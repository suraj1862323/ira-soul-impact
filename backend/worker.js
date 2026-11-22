const COOKIE_NAME = "ira_admin_session";
const SESSION_TTL = 60 * 60 * 12;
const allowedStatuses = new Set(["Pending", "Contacted", "Completed"]);

function corsHeaders(origin, env) {
  const allowed = env.SITE_ORIGIN || "https://irasoul.in";
  const h = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Vary": "Origin",
  };
  if (origin === allowed) {
    h["Access-Control-Allow-Origin"] = allowed;
    h["Access-Control-Allow-Credentials"] = "true";
  }
  return h;
}
function json(data, status=200, headers={}) {
  return new Response(JSON.stringify(data), {status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...headers}});
}
function b64u(bytes) {
  let s=""; for(const b of bytes) s+=String.fromCharCode(b);
  return btoa(s).replaceAll("=","").replaceAll("+","-").replaceAll("/","_");
}
function decodeB64u(s) { const raw=s.replaceAll("-","+").replaceAll("_","/"); return atob(raw.padEnd(Math.ceil(raw.length/4)*4,"=")); }
function safeEqual(a,b) {
  let diff=a.length^b.length;
  const n=Math.max(a.length,b.length);
  for(let i=0;i<n;i++) diff|=(a.charCodeAt(i%Math.max(1,a.length))||0)^(b.charCodeAt(i%Math.max(1,b.length))||0);
  return diff===0;
}
async function sign(payload, secret) {
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return b64u(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(payload))));
}
async function validSession(request, env) {
  const cookieHeader=request.headers.get("Cookie")||"";
  const token=cookieHeader.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE_NAME+"="))?.slice(COOKIE_NAME.length+1);
  if(!token)return false;
  const [payload,sig]=token.split(".");
  if(!payload||!sig||!env.SESSION_SECRET)return false;
  const expected=await sign(payload,env.SESSION_SECRET);
  if(!safeEqual(expected,sig))return false;
  try { const data=JSON.parse(decodeB64u(payload)); return data.exp>Date.now()/1000; } catch { return false; }
}
function cookie(value, maxAge) {
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}
async function handle(request, env) {
  const url=new URL(request.url), origin=request.headers.get("Origin")||"";
  const expectedOrigin=env.SITE_ORIGIN||"https://irasoul.in";
  const headers=corsHeaders(origin,env);
  if(origin && origin!==expectedOrigin)return json({error:"Origin not allowed"},403);
  if(["POST","PATCH","DELETE"].includes(request.method) && origin!==expectedOrigin)return json({error:"Origin required"},403);
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(url.pathname==="/api/health")return json({ok:true});
  if(url.pathname==="/api/admin/login"&&request.method==="POST"){
    if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET||env.SESSION_SECRET.length<32)return json({error:"Admin secrets are not configured"},503,headers);
    const body=await request.json().catch(()=>null);
    if(!body||typeof body.password!=="string"||!safeEqual(body.password,env.ADMIN_PASSWORD))return json({error:"Invalid password"},401,headers);
    const payload=b64u(new TextEncoder().encode(JSON.stringify({exp:Math.floor(Date.now()/1000)+SESSION_TTL})));
    const token=payload+"."+await sign(payload,env.SESSION_SECRET);
    return json({ok:true},200,{...headers,"Set-Cookie":cookie(token,SESSION_TTL)});
  }
  if(url.pathname==="/api/admin/logout"&&request.method==="POST")return json({ok:true},200,{...headers,"Set-Cookie":cookie("",0)});
  if(url.pathname.startsWith("/api/admin/")){
    if(!(await validSession(request,env)))return json({error:"Unauthorized"},401,headers);
    if(url.pathname==="/api/admin/requests"&&request.method==="GET"){
      const {results=[]}=await env.DB.prepare("SELECT * FROM enquiries ORDER BY created_at DESC").all();
      return json({requests:results},200,headers);
    }
    const match=url.pathname.match(/^\\/api\\/admin\\/requests\\/(\\d+)$/);
    if(match&&request.method==="PATCH"){
      const body=await request.json().catch(()=>null);
      if(!body||!allowedStatuses.has(body.status))return json({error:"Invalid status"},400,headers);
      await env.DB.prepare("UPDATE enquiries SET status=? WHERE id=?").bind(body.status,match[1]).run();
      return json({ok:true},200,headers);
    }
    if(match&&request.method==="DELETE"){
      await env.DB.prepare("DELETE FROM enquiries WHERE id=?").bind(match[1]).run();
      return json({ok:true},200,headers);
    }
  }
  if(url.pathname==="/api/requests"&&request.method==="POST"){
    const body=await request.json().catch(()=>null);
    if(!body||!body.name||!body.phone)return json({error:"Name and phone are required"},400,headers);
    if(JSON.stringify(body).length>8000)return json({error:"Request too large"},413,headers);
    const name=String(body.name).trim().slice(0,120), phone=String(body.phone).trim().slice(0,30);
    const occasion=String(body.occasion||"").slice(0,120),activity=String(body.activity||"").slice(0,120);
    const budget=String(body.budget||"").slice(0,100),date=String(body.date||"").slice(0,30),message=String(body.message||"").slice(0,2000);
    await env.DB.prepare("INSERT INTO enquiries(name,phone,occasion,activity,budget,date,message) VALUES(?,?,?,?,?,?,?)").bind(name,phone,occasion,activity,budget,date,message).run();
    return json({ok:true},201,headers);
  }
  return json({error:"Not found"},404,headers);
}
export default {fetch(request,env){return handle(request,env).catch(()=>json({error:"Internal server error"},500));}};
