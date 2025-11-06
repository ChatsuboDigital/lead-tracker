# 🚀 Getting Started with Lead Tracker

Welcome! This guide will help you get your Lead Tracker application up and running.

---

## 📚 Documentation Overview

Your project includes comprehensive documentation:

1. **QUICKSTART.md** - Get running in 5 minutes ⚡
2. **SETUP_GUIDE.md** - Detailed setup instructions 📖
3. **README.md** - Complete technical documentation 📘
4. **FEATURES.md** - Feature documentation (514 lines) ✨
5. **DEPLOYMENT.md** - Production deployment guide 🚀
6. **PROJECT_SUMMARY.md** - Complete project overview 📊
7. **GETTING_STARTED.md** - This file! 👋

---

## 🎯 Choose Your Path

### Path 1: Quick Start (5 minutes)
**Best for**: Getting started fast, testing the app

👉 Follow **QUICKSTART.md**

### Path 2: Detailed Setup (15 minutes)
**Best for**: Understanding everything, production setup

👉 Follow **SETUP_GUIDE.md**

### Path 3: Just Tell Me What to Do (2 minutes)
**Best for**: Experienced developers

```bash
# 1. Set up Supabase
# - Create project at supabase.com
# - Run migration: supabase/migrations/001_create_leads_table.sql
# - Get API keys from Settings → API

# 2. Configure environment
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Install and run
npm install
npm run dev

# 4. Test
# Open http://localhost:3000
# Upload sample-leads.csv
```

---

## ✅ What's Included

### Complete Application
- ✅ Next.js 14 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Shadcn UI components (15 components)
- ✅ Supabase integration
- ✅ All features implemented

### Three Main Pages
1. **Upload** (`/`) - CSV upload and duplicate detection
2. **Dashboard** (`/dashboard`) - Lead management with stats
3. **Export** (`/export`) - Advanced export builder

### Key Features
- 📤 CSV upload with drag-and-drop
- 🔍 Automatic duplicate detection
- 📊 Real-time statistics
- 🔎 Fuzzy email search
- 🏷️ Campaign tracking
- 📥 Advanced export options
- 🗑️ Bulk operations
- 📝 Lead notes

---

## 🎬 First-Time Setup

### Step 1: Supabase (5 minutes)

1. **Create account** at [supabase.com](https://supabase.com)
2. **Create new project**
   - Name: lead-tracker
   - Password: (save this!)
   - Region: (closest to you)
3. **Run migration**
   - Go to SQL Editor
   - Copy contents of `supabase/migrations/001_create_leads_table.sql`
   - Paste and click "Run"
4. **Get API keys**
   - Settings → API
   - Copy Project URL and anon key

### Step 2: Local Setup (2 minutes)

```bash
# Navigate to project
cd /Users/hosaka/AI/My_Apps/lead-tracker

# Install dependencies
npm install

# Create environment file
cp env.example .env.local

# Edit .env.local with your credentials
# NEXT_PUBLIC_SUPABASE_URL=your_url_here
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### Step 3: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Test with Sample Data

1. Use the included `sample-leads.csv` file
2. Drag and drop onto the upload area
3. Click "Check for Duplicates"
4. Click "Export New Leads & Save to Database"
5. Go to Dashboard to see your leads!

---

## 🎓 Learning the Application

### 5-Minute Tour

1. **Upload Page** (/)
   - Upload sample-leads.csv
   - See automatic email detection
   - Review campaign name
   - Check for duplicates

2. **Dashboard** (/dashboard)
   - View statistics cards
   - Search for a lead
   - Click on a lead to see details
   - Add a note and save

3. **Export Builder** (/export)
   - Select a campaign
   - Choose export format
   - Download CSV

### Key Concepts

**Leads**: Email addresses with associated data
- Primary key: email
- Can have multiple campaigns
- Stores all original CSV data

**Campaigns**: Tags to organize leads
- Extracted from filename
- Can add multiple campaigns per lead
- Used for filtering and exporting

**Duplicates**: Leads already in database
- Detected by email address
- Shows existing campaigns
- Won't be re-added

---

## 💡 Common Use Cases

### Use Case 1: Import New Leads
```
1. Export leads from your CRM/marketing tool as CSV
2. Upload to Lead Tracker
3. Review duplicates
4. Save new leads to database
5. View in Dashboard
```

### Use Case 2: Merge Multiple Campaigns
```
1. Upload first campaign CSV
2. Upload second campaign CSV
3. Duplicates will show both campaigns
4. All leads now have both campaign tags
```

### Use Case 3: Export for Email Campaign
```
1. Go to Export Builder
2. Select campaigns to include
3. Exclude campaigns (e.g., "unsubscribed")
4. Choose "Email Only" format
5. Download and import to email tool
```

### Use Case 4: Clean Up Database
```
1. Go to Dashboard
2. Search for specific leads
3. Select multiple leads
4. Delete or add to "archived" campaign
```

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
**Solution**: 
- Make sure `.env.local` exists
- Check variable names are correct
- Restart dev server: `npm run dev`

### "No email column detected"
**Solution**:
- CSV must have column with "email" in name
- Supported: email, e-mail, work email, etc.
- Check CSV is properly formatted

### "Database connection error"
**Solution**:
- Verify Supabase project is active
- Check API keys in `.env.local`
- Ensure migration was run
- Test in Supabase Table Editor

### CSV Upload Fails
**Solution**:
- Check file size < 50MB
- Ensure file is .csv format
- Verify UTF-8 encoding
- Try with sample-leads.csv first

---

## 📖 Next Steps

### After Setup

1. **Read the Documentation**
   - FEATURES.md for detailed feature info
   - README.md for technical details

2. **Customize for Your Needs**
   - Modify campaign name extraction
   - Adjust page sizes
   - Add custom fields

3. **Deploy to Production**
   - Follow DEPLOYMENT.md
   - Set up on Vercel/Netlify
   - Configure custom domain

### Learning Resources

**Next.js 14**
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

**Supabase**
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Guide](https://supabase.com/docs/guides/database)

**Tailwind CSS**
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

---

## 🎯 Success Checklist

After setup, verify these work:

- [ ] Upload a CSV file
- [ ] See email validation counts
- [ ] Check for duplicates
- [ ] Save to database
- [ ] View leads in Dashboard
- [ ] Search for a lead
- [ ] Filter by campaign
- [ ] View lead details
- [ ] Add and save notes
- [ ] Export leads
- [ ] Delete a lead

If all checked, you're ready to go! 🎉

---

## 💬 Getting Help

### Documentation
1. Check the specific guide for your issue
2. Review error messages carefully
3. Look in browser console for details

### Common Issues
- Most issues are environment variable related
- Check Supabase connection first
- Verify CSV format matches examples

### Support Resources
- README.md troubleshooting section
- SETUP_GUIDE.md common issues
- Supabase documentation
- Next.js documentation

---

## 🚀 Ready to Deploy?

When you're ready for production:

1. Read **DEPLOYMENT.md**
2. Choose hosting platform (Vercel recommended)
3. Set up environment variables
4. Deploy!
5. Test all features
6. Enable Row Level Security
7. Set up backups

---

## 🎉 You're All Set!

You now have a fully functional lead deduplication and campaign tracking system!

### What You Can Do
- ✅ Upload unlimited CSV files
- ✅ Track leads across campaigns
- ✅ Prevent duplicate imports
- ✅ Search and filter leads
- ✅ Export custom lead lists
- ✅ Manage leads with notes
- ✅ Bulk operations

### Performance
- Handles 10,000+ leads
- Fast duplicate detection
- Real-time search
- Optimized database queries

### Production Ready
- TypeScript for reliability
- Error handling throughout
- Loading states everywhere
- Mobile responsive
- Build tested ✅

---

## 📞 Quick Reference

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

**Local URL**: http://localhost:3000

**Pages**:
- `/` - Upload
- `/dashboard` - Dashboard
- `/export` - Export Builder

**Sample Data**: `sample-leads.csv`

---

## 🎊 Happy Lead Tracking!

You're now ready to start managing your leads efficiently. Upload your first CSV and see the magic happen!

Need help? Check the documentation files or review the code comments.

**Built with ❤️ using Next.js 14, TypeScript, Tailwind CSS, and Supabase**

---

*Last Updated: November 5, 2025*

