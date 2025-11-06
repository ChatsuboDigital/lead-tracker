# Lead Tracker - Quick Start (5 Minutes)

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)

## Step 1: Supabase Setup (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign in → "New Project"
2. Create project (takes ~2 minutes to provision)
3. Go to SQL Editor → New Query
4. Copy/paste contents of `supabase/migrations/001_create_leads_table.sql`
5. Click "Run"
6. Go to Settings → API → Copy:
   - Project URL
   - anon public key

## Step 2: Local Setup (2 minutes)

```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_url_here
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here

# Start development server
npm run dev
```

## Step 3: Test It (1 minute)

1. Open [http://localhost:3000](http://localhost:3000)
2. Create a test CSV:

```csv
email,first_name,last_name,company
john@example.com,John,Doe,Acme Inc
jane@example.com,Jane,Smith,Tech Corp
```

3. Upload the CSV
4. Click "Check for Duplicates"
5. Click "Export New Leads & Save to Database"
6. Go to Dashboard to see your leads!

## That's It! 🎉

You're ready to use Lead Tracker!

### Next Steps

- Upload your real lead CSVs
- Explore the Dashboard
- Try the Export Builder
- Read the full [README.md](README.md) for detailed docs

### Need Help?

- See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
- See [FEATURES.md](FEATURES.md) for feature documentation
- Check the Troubleshooting section in README.md

### Common First-Time Issues

**"Missing Supabase environment variables"**
- Make sure you created `.env.local` (not `.env`)
- Restart the dev server after creating the file

**"No email column detected"**
- Your CSV must have a column with "email" in the name
- Supported: email, e-mail, email address, work email, etc.

**Database connection errors**
- Double-check your Supabase URL and key
- Make sure you ran the SQL migration
- Verify your Supabase project is active (not paused)

### Pro Tips

1. **Campaign Names**: Use descriptive names like "Q1-2024-Marketing"
2. **CSV Format**: Always include first_name and last_name for better display
3. **Backups**: Export your data regularly using the Export Builder
4. **Performance**: Keep CSVs under 10,000 rows for best performance

Enjoy! 🚀

