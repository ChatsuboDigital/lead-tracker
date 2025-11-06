# Lead Tracker - Quick Setup Guide

This guide will walk you through setting up the Lead Tracker application from scratch.

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: lead-tracker (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for setup to complete (~2 minutes)

### 1.2 Run Database Migration

1. In your Supabase project, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_create_leads_table.sql`
4. Paste into the SQL Editor
5. Click "Run" or press Cmd/Ctrl + Enter
6. You should see "Success. No rows returned"

### 1.3 Get Your API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these two values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (under "Project API keys")

## Step 2: Application Setup

### 2.1 Install Dependencies

```bash
cd /Users/hosaka/AI/My_Apps/lead-tracker
npm install
```

### 2.2 Configure Environment Variables

1. Create `.env.local` file in the project root:
```bash
cp env.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with the values you copied in Step 1.3.

### 2.3 Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Step 3: Test the Application

### 3.1 Create a Test CSV

Create a file called `test-leads.csv`:

```csv
email,first_name,last_name,company,phone
john.doe@example.com,John,Doe,Acme Inc,555-1234
jane.smith@example.com,Jane,Smith,Tech Corp,555-5678
bob.jones@example.com,Bob,Jones,StartupXYZ,555-9012
alice.brown@example.com,Alice,Brown,BigCo,555-3456
charlie.davis@example.com,Charlie,Davis,SmallBiz,555-7890
```

### 3.2 Upload Test Data

1. Go to [http://localhost:3000](http://localhost:3000)
2. Drag and drop `test-leads.csv` or click to browse
3. Review the preview and campaign name
4. Click "Check for Duplicates"
5. Click "Export New Leads & Save to Database"

### 3.3 Verify in Dashboard

1. Navigate to the Dashboard page
2. You should see 5 leads
3. Try searching for an email
4. Click on a lead to view details
5. Add a note and save

### 3.4 Test Export Builder

1. Navigate to the Export page
2. Select the campaign you just created
3. Choose "All Fields" format
4. Click "Download CSV"

## Step 4: Verify Database

### 4.1 Check Data in Supabase

1. Go to your Supabase project
2. Click **Table Editor** in the sidebar
3. Select the `leads` table
4. You should see your 5 test leads

### 4.2 Test Duplicate Detection

1. Upload the same `test-leads.csv` again
2. All 5 should be marked as duplicates
3. Try uploading a CSV with some new and some duplicate emails

## Common Issues

### Issue: "Missing Supabase environment variables"

**Solution**: 
- Make sure `.env.local` exists in the project root
- Check that the file has the correct variable names
- Restart the dev server after creating/editing `.env.local`

### Issue: "No email column detected"

**Solution**:
- Ensure your CSV has a column with "email" in the name
- Supported names: email, e-mail, email address, work email, business email
- Check that your CSV is properly formatted (comma-separated)

### Issue: Database connection errors

**Solution**:
1. Verify your Supabase project is active (not paused)
2. Check your API keys are correct in `.env.local`
3. Ensure you ran the database migration
4. Try regenerating your API keys in Supabase settings

### Issue: CSV parsing errors

**Solution**:
1. Ensure file is valid CSV format
2. Check file encoding is UTF-8
3. Verify file size is under 50MB
4. Remove any special characters from headers

## Next Steps

### Customize Campaign Names

Campaign names are auto-extracted from filenames:
- `marketing-campaign-2024-01-15.csv` → "Marketing Campaign"
- `q1_leads.csv` → "Q1 Leads"
- You can always edit the campaign name before uploading

### Add Row-Level Security (Optional)

For production, add RLS policies in Supabase:

```sql
-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users"
ON leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Or allow public access (for demo/testing)
CREATE POLICY "Allow all for anon users"
ON leads
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
```

### Deploy to Production

1. **Vercel** (Recommended):
```bash
npm install -g vercel
vercel
```

2. Add environment variables in Vercel dashboard
3. Deploy!

### Backup Your Data

Regular backups are important:

1. In Supabase, go to **Database** → **Backups**
2. Enable daily backups
3. Or export manually: **Table Editor** → Select table → **Download as CSV**

## Support

If you encounter any issues:

1. Check the main README.md for detailed documentation
2. Review the Troubleshooting section
3. Check Supabase logs: **Logs** → **Database**
4. Verify your CSV format matches the examples

## Security Notes

- Never commit `.env.local` to git (it's in .gitignore)
- Use environment variables for all sensitive data
- For production, implement proper authentication
- Consider adding rate limiting for API endpoints
- Enable RLS policies in Supabase for production use

## Performance Tips

- Keep CSVs under 10,000 rows for best performance
- Use the export builder for large datasets
- Regularly clean up old/unused leads
- Monitor Supabase database size in project settings

Enjoy using Lead Tracker! 🚀

