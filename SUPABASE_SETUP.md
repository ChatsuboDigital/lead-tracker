# 🔧 Supabase Setup Guide - Step by Step

This guide will walk you through setting up Supabase for your Lead Tracker application.

---

## 📋 What You'll Need

- A web browser
- An email address (for Supabase account)
- About 10 minutes

---

## Step 1: Create a Supabase Account

### 1.1 Go to Supabase
Open your browser and go to: **[https://supabase.com](https://supabase.com)**

### 1.2 Sign Up
1. Click **"Start your project"** or **"Sign In"** (top right)
2. Choose one of these options:
   - **GitHub** (recommended - easiest)
   - **Google**
   - **Email** (if you prefer email/password)

### 1.3 Complete Sign Up
- If using GitHub/Google: Authorize the connection
- If using Email: Check your email and verify your account

---

## Step 2: Create a New Project

### 2.1 Create Project
1. Once logged in, you'll see your dashboard
2. Click **"New Project"** (green button)

### 2.2 Fill in Project Details

**Project Name:**
- Enter: `lead-tracker` (or any name you prefer)

**Database Password:**
- **IMPORTANT**: Create a strong password and **SAVE IT** somewhere safe!
- You'll need this if you want to connect directly to the database later
- Minimum 12 characters
- Example: `MyStrongPassword123!`

**Region:**
- Choose the region closest to you or your users
- Popular options:
  - **US East** (N. Virginia) - for US users
  - **US West** (Oregon) - for US West Coast
  - **EU West** (Ireland) - for European users
  - **Asia Pacific** (Singapore) - for Asian users

**Pricing Plan:**
- For this project, **Free tier** is perfect!
- Click **"Create new project"**

### 2.3 Wait for Project Setup
- This takes about **2-3 minutes**
- You'll see a progress screen
- Don't close the browser - wait for it to complete!

---

## Step 3: Run the Database Migration

### 3.1 Open SQL Editor
1. Once your project is ready, you'll see the project dashboard
2. In the left sidebar, click **"SQL Editor"** (icon looks like a database)

### 3.2 Create New Query
1. Click **"New Query"** button (top right)
2. You'll see an empty SQL editor

### 3.3 Copy the Migration Script

Open this file in your project:
```
/Users/hosaka/AI/My_Apps/lead-tracker/supabase/migrations/001_create_leads_table.sql
```

**Or copy this entire SQL script:**

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

### 3.4 Paste and Run
1. **Paste** the entire SQL script into the SQL Editor
2. Click **"Run"** button (or press `Cmd/Ctrl + Enter`)
3. Wait for it to complete

### 3.5 Verify Success
You should see:
- ✅ **"Success. No rows returned"** (this is normal!)
- This means the table, indexes, and functions were created successfully

### 3.6 Verify Table Creation (Optional)
1. In the left sidebar, click **"Table Editor"**
2. You should see a table called **"leads"**
3. Click on it - it should be empty (which is correct!)

---

## Step 4: Get Your API Keys

### 4.1 Open Project Settings
1. In the left sidebar, click the **gear icon** (⚙️) at the bottom
2. This opens **"Project Settings"**

### 4.2 Go to API Section
1. In the left menu of Settings, click **"API"**
2. You'll see a page with API credentials

### 4.3 Copy Your Credentials

You need to copy **TWO values**:

#### **1. Project URL**
- Look for **"Project URL"** or **"Project URL"**
- It looks like: `https://xxxxxxxxxxxxx.supabase.co`
- Click the **copy icon** next to it
- Save it somewhere (you'll need it in a moment)

#### **2. anon public key**
- Look for **"Project API keys"** section
- Find **"anon public"** key (it's a long string)
- Click the **copy icon** next to it
- Save it somewhere (you'll need it in a moment)

**⚠️ Important Notes:**
- The **anon public** key is safe to use in client-side code
- Never share your **service_role** key (that's for server-side only)
- You only need the **anon public** key for this project

---

## Step 5: Configure Your Local Environment

### 5.1 Create Environment File
Open your terminal and run:

```bash
cd /Users/hosaka/AI/My_Apps/lead-tracker
cp env.example .env.local
```

### 5.2 Edit the Environment File

Open the file `.env.local` in your code editor:

```bash
# If you're using VS Code:
code .env.local

# Or open it in any text editor
```

### 5.3 Add Your Supabase Credentials

Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Replace:**
- `https://xxxxxxxxxxxxx.supabase.co` with your **Project URL**
- `eyJhbGc...` (the long string) with your **anon public key**

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

### 5.4 Save the File
- Save `.env.local` (make sure it's saved!)
- **Important**: This file should NOT be committed to git (it's already in .gitignore)

---

## Step 6: Test the Connection

### 6.1 Start the Development Server

```bash
cd /Users/hosaka/AI/My_Apps/lead-tracker
npm install  # If you haven't already
npm run dev
```

### 6.2 Open the Application

Open your browser and go to:
**[http://localhost:3000](http://localhost:3000)**

### 6.3 Test Upload

1. You should see the upload page
2. Try uploading the sample CSV file:
   - File: `sample-leads.csv` (included in the project)
3. Click "Check for Duplicates"
4. If everything works, you should see:
   - ✅ "Found X new leads and 0 duplicates"
   - No errors in the console

### 6.4 Verify in Supabase (Optional)

1. Go back to your Supabase dashboard
2. Click **"Table Editor"** in the sidebar
3. Click on the **"leads"** table
4. After uploading and saving, you should see your leads here!

---

## ✅ Setup Complete!

If you can:
- ✅ Upload a CSV file
- ✅ See duplicate detection working
- ✅ Save leads to the database
- ✅ View leads in the Dashboard

Then your Supabase setup is **complete**! 🎉

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Problem:** The app can't find your Supabase credentials.

**Solutions:**
1. Make sure `.env.local` exists in the project root
2. Check that the file is named exactly `.env.local` (not `.env.local.txt`)
3. Verify the variable names are correct:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Restart the dev server after creating/editing `.env.local`:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Error: "Invalid API key" or "Invalid URL"

**Problem:** The credentials are incorrect.

**Solutions:**
1. Double-check you copied the correct values:
   - Project URL should start with `https://` and end with `.supabase.co`
   - anon key should be a long string starting with `eyJ`
2. Make sure there are no extra spaces or quotes in `.env.local`
3. Verify in Supabase: Settings → API → Copy again

### Error: "relation 'leads' does not exist"

**Problem:** The database migration didn't run successfully.

**Solutions:**
1. Go back to Supabase SQL Editor
2. Run the migration script again
3. Check for any error messages
4. Verify the table exists: Table Editor → You should see "leads" table

### Error: "permission denied" or "Row Level Security"

**Problem:** Row Level Security (RLS) is enabled and blocking access.

**Solutions:**
1. Go to Supabase SQL Editor
2. Run this to allow public access (for testing):
   ```sql
   -- Disable RLS for now (for testing)
   ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
   ```
3. For production, you'll want to set up proper RLS policies

### Error: Connection timeout

**Problem:** Can't connect to Supabase.

**Solutions:**
1. Check your internet connection
2. Verify your Supabase project is active (not paused)
3. Check Supabase status: [status.supabase.com](https://status.supabase.com)
4. Try refreshing the page

### Database Migration Fails

**Problem:** Error when running the SQL script.

**Solutions:**
1. Make sure you copied the ENTIRE script (all lines)
2. Check for syntax errors (missing semicolons, etc.)
3. Try running parts of the script separately:
   - First: Create the table
   - Then: Create indexes
   - Then: Create functions
   - Finally: Create triggers

### Can't Find "anon public" Key

**Problem:** Can't see the API key.

**Solutions:**
1. Go to: Project Settings → API
2. Scroll down to "Project API keys" section
3. Look for "anon public" (not "service_role")
4. Click the eye icon to reveal it
5. Click the copy icon to copy it

---

## 📸 Quick Reference

### Supabase Dashboard Locations

1. **SQL Editor**: Left sidebar → "SQL Editor"
2. **Table Editor**: Left sidebar → "Table Editor"
3. **Project Settings**: Left sidebar → Gear icon (⚙️) → "API"
4. **Project URL**: Settings → API → "Project URL"
5. **API Keys**: Settings → API → "Project API keys" → "anon public"

### Your Environment File Location

```
/Users/hosaka/AI/My_Apps/lead-tracker/.env.local
```

### Files You Need

1. **Migration Script**: `supabase/migrations/001_create_leads_table.sql`
2. **Environment Template**: `env.example`
3. **Your Environment File**: `.env.local` (create this!)

---

## 🎯 Quick Checklist

Before you start:
- [ ] Supabase account created
- [ ] Project created
- [ ] Database password saved somewhere safe

After migration:
- [ ] SQL script ran successfully
- [ ] "leads" table appears in Table Editor

After getting API keys:
- [ ] Project URL copied
- [ ] anon public key copied
- [ ] `.env.local` file created
- [ ] Credentials added to `.env.local`

After testing:
- [ ] Dev server starts without errors
- [ ] Can upload CSV file
- [ ] Can check for duplicates
- [ ] Can save leads to database
- [ ] Can see leads in Dashboard

---

## 🚀 Next Steps

Once Supabase is set up:

1. **Test with Sample Data**
   - Upload `sample-leads.csv`
   - Try all features

2. **Explore the Application**
   - Upload your own CSVs
   - Test duplicate detection
   - Use the Dashboard
   - Try the Export Builder

3. **Read the Documentation**
   - `GETTING_STARTED.md` - Learn how to use it
   - `FEATURES.md` - See all features
   - `DEPLOYMENT.md` - Deploy to production

---

## 📞 Still Having Issues?

### Check These First

1. **Environment Variables**
   - File exists: `.env.local`
   - File location: project root (same folder as `package.json`)
   - Variable names are exact (case-sensitive)
   - No extra quotes or spaces

2. **Supabase Project**
   - Project is active (not paused)
   - Migration ran successfully
   - Table "leads" exists in Table Editor

3. **Dev Server**
   - Restarted after creating `.env.local`
   - No errors in terminal
   - Port 3000 is available

### Get Help

1. Check browser console for errors (F12 → Console tab)
2. Check terminal for error messages
3. Verify Supabase project is active
4. Review this guide step-by-step again

---

## 🎉 You're Done!

Once you can:
- ✅ Upload CSVs
- ✅ See duplicate detection
- ✅ Save to database
- ✅ View in Dashboard

Your Lead Tracker is ready to use! 🚀

---

**Need more help?** Check the other documentation files:
- `GETTING_STARTED.md` - Getting started guide
- `SETUP_GUIDE.md` - Detailed setup instructions
- `QUICKSTART.md` - 5-minute quick start

---

*Last Updated: November 5, 2025*

