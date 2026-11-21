CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  occasion TEXT,
  activity TEXT,
  budget TEXT,
  date TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Contacted','Completed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);