const $=s=>document.querySelector(s);
const form=$('#request-form');
const message=$('#form-message');
$('#year').textContent=new Date().getFullYear();
const dateInput=form.querySelector('[name="date"]'); dateInput.min=new Date().toISOString().split('T')[0];
form.addEventListener('submit',async e=>{
  e.preventDefault();
  const submit=form.querySelector('[type="submit"]');
  const data=Object.fromEntries(new FormData(form).entries());
  message.textContent='Submitting your request…';
  submit.disabled=true;
  try {
    const response=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error||'Submission failed');
    message.textContent='Thank you! Your enquiry has been received. Our team will contact you soon.';
    form.reset();
  } catch(err) {
    message.textContent='We could not send your request right now. Please call or WhatsApp 7290990543.';
  } finally { submit.disabled=false; }
});
/* Only form-intent links should populate the enquiry form. Detail links navigate normally. */
const activityLinks=document.querySelectorAll('[data-activity][href="#plan"]');
activityLinks.forEach(a=>a.addEventListener('click',()=>{const sel=form.querySelector('[name="activity"]');sel.value=a.dataset.activity;setTimeout(()=>form.querySelector('[name="name"]').focus(),250)}));
$('.menu-toggle').addEventListener('click',()=>{document.body.classList.toggle('menu-open')});document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('menu-open')));

/* SITE-WIDE PAGE NAVIGATION: HTML page links must navigate, hash links may scroll. */
document.addEventListener('click',function(e){
  const a=e.target.closest('a[href]');
  if(!a)return;
  const href=a.getAttribute('href');
  if(!href || href.startsWith('#') || a.target==='_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)return;
  if(/\.html(?:[?#].*)?$/i.test(href)){
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    window.location.assign(href);
  }
},true);
