# 🚀 Quick Migration Guide - Run This Now!

Follow these steps to run the database migration in Supabase:

---

## Step 1: Open Supabase Dashboard

1. Go to **[https://supabase.com/dashboard](https://supabase.com/dashboard)**
2. Sign in if needed
3. Click on your project: **lead-tracker** (or whatever you named it)

---

## Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"** (icon looks like a database)
2. Click **"New Query"** button (top right)
3. You'll see an empty SQL editor

---

## Step 3: Copy and Paste the Migration

**Copy this ENTIRE SQL script** (everything below):

```sql
-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  email TEXT PRIMARY KEY,
  display_name TEXT,
  campaigns TEXT[] DEFAULT '{}',
  date_added TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  source_data JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns ON leads USING GIN(campaigns);
CREATE INDEX IF NOT EXISTS idx_date_added ON leads(date_added DESC);

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_email_search ON leads USING gin(email gin_trgm_ops);

-- Function to add campaign to lead without duplicates
CREATE OR REPLACE FUNCTION add_campaign_to_lead(
  lead_email TEXT,
  campaign_name TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE leads
  SET campaigns = array_append(campaigns, campaign_name),
      last_updated = NOW()
  WHERE email = lead_email
    AND NOT (campaign_name = ANY(campaigns));
END;
$$ LANGUAGE plpgsql;

-- Function to update last_updated timestamp automatically
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_updated on row update
CREATE TRIGGER update_leads_last_updated
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated();
```

---

## Step 4: Run the Migration

1. **Paste** the entire SQL script into the SQL Editor
2. Click **"Run"** button (or press `Cmd + Enter` on Mac, `Ctrl + Enter` on Windows/Linux)
3. Wait for it to complete (should be instant)

---

## Step 5: Verify Success

You should see:
✅ **"Success. No rows returned"** (this is normal!)

This means:
- ✅ Table created successfully
- ✅ Indexes created successfully
- ✅ Functions created successfully
- ✅ Triggers created successfully

---

## Step 6: Verify Table Exists

1. In the left sidebar, click **"Table Editor"**
2. You should see a table called **"leads"**
3. Click on it - it should be empty (which is correct!)

---

## ✅ Done!

If you see the "leads" table in Table Editor, your migration is complete!

Now you can:
1. Go back to your app: http://localhost:3000
2. Upload a CSV file
3. Start using Lead Tracker!

---

## 🐛 Troubleshooting

### Error: "relation already exists"
- This means the table already exists - that's OK! The migration uses `IF NOT EXISTS` so it's safe.
- You can ignore this or verify the table works.

### Error: "extension already exists"
- The `pg_trgm` extension already exists - that's fine!
- The migration handles this with `IF NOT EXISTS`.

### Error: "permission denied"
- Make sure you're logged into the correct Supabase project
- Try refreshing the page and running again

### Error: Syntax error
- Make sure you copied the ENTIRE script (all lines)
- Check for missing semicolons
- Try copying again from this file

---

**Need help?** Check `SUPABASE_SETUP.md` for more detailed instructions.



