# Lead Deduplicator - Smart Lead Management

<!-- Last updated: 2025-11-06 -->

A streamlined Next.js 14 application for lead deduplication, campaign tracking, and database management.

## Features

### 🎯 Core Workflow
1. **Upload CSV**: Drag-and-drop your lead list
2. **Auto-Detection**: Automatically finds email column and campaign name
3. **Duplicate Check**: Instantly identifies duplicates against your database
4. **Clean Export**: Download CSV with duplicates removed (exact original format)
5. **Database Sync**: New leads automatically saved to database

### 📊 Master Database
- **View All Leads**: Complete database of all uploaded leads
- **Search & Filter**: Search by email, name, or campaign
- **Campaign Tracking**: See which campaigns each lead came from
- **Export**: Download filtered results as CSV
- **Manage**: Delete individual leads
- **Statistics**: Total leads, campaign count, and filtered results

### 🔍 Smart Features
- **Automatic Processing**: No manual "check duplicates" button needed
- **Campaign Tracking**: Each upload is tagged with campaign name (from filename)
- **Multi-Campaign Leads**: Tracks when a lead appears in multiple uploads
- **Format Preservation**: Exported CSV maintains exact original headers and columns
- **Real-time Stats**: See new leads added and duplicates removed instantly

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **CSV Parsing**: PapaParse
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

## Installation

1. **Clone the repository**
```bash
cd /path/to/lead-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

Create a new Supabase project at [supabase.com](https://supabase.com)

4. **Run the database migration**

In your Supabase SQL Editor, run the migration file:
```sql
-- Copy and paste the contents of supabase/migrations/001_create_leads_table.sql
```

5. **Configure environment variables**

Create a `.env.local` file in the root directory:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Uploading Leads

1. Navigate to the **Upload** page (home page)
2. Drag and drop a CSV file or click to browse
3. The system automatically:
   - Detects the email column
   - Extracts campaign name from filename
   - Checks for duplicates
4. Review results:
   - Green card shows new leads added
   - Red card shows duplicates removed
5. Click "Download Clean CSV (Duplicates Removed)"
   - New leads are saved to database
   - Clean CSV downloads (exact original format, minus duplicates)

### Master Database

1. Navigate to the **Master Database** page
2. View statistics:
   - Total leads in database
   - Number of campaigns tracked
   - Current filtered count
3. Search leads:
   - Type in search box
   - Search by email, name, or campaign
   - Results update in real-time
4. Filter by campaign:
   - Scroll to "All Campaigns" section
   - Click any campaign badge to filter
5. Export leads:
   - Search/filter to get desired leads
   - Click "Export (X)" button
   - CSV downloads with results
6. Delete leads:
   - Click trash icon next to any lead
   - Confirm deletion

## Database Schema

```sql
CREATE TABLE leads (
  email TEXT PRIMARY KEY,
  display_name TEXT,
  campaigns TEXT[],
  date_added TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  source_data JSONB DEFAULT '{}'
);
```

### Indexes
- `idx_campaigns`: GIN index on campaigns array for fast filtering
- `idx_date_added`: B-tree index on date_added for sorting
- `idx_email_search`: GIN index with pg_trgm for fuzzy email search

## CSV Format Requirements

Your CSV file should include:
- An email column (various names supported: email, e-mail, work email, etc.)
- Optional: first_name, last_name, name, or full_name for display names
- Any additional columns will be stored in `source_data` JSONB field

Example CSV:
```csv
email,first_name,last_name,company,phone
john@example.com,John,Doe,Acme Inc,555-1234
jane@example.com,Jane,Smith,Tech Corp,555-5678
```

## Performance

- Handles 10,000+ row CSVs in under 5 seconds
- Batch database queries (no N+1 queries)
- Debounced search inputs (300ms)
- Proper indexes for all queries
- Progress indicators for large operations

## Project Structure

```
lead-tracker/
├── app/
│   ├── page.tsx              # Upload page (main workflow)
│   ├── database/
│   │   └── page.tsx          # Master database page
│   ├── layout.tsx            # Root layout with navigation
│   └── globals.css           # Global styles
├── components/
│   ├── upload-csv.tsx        # CSV upload component
│   ├── duplicate-results.tsx # Results display & export
│   ├── navigation.tsx        # Top navigation bar
│   └── ui/                   # Shadcn UI components
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── helpers.ts            # Helper functions
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Utility functions
└── supabase/
    └── migrations/
        └── 001_create_leads_table.sql
```

## Helper Functions

Key functions in `lib/helpers.ts`:
- `detectEmailColumn()`: Auto-detect email column from CSV headers
- `extractCampaignName()`: Extract campaign name from filename
- `validateEmail()`: Validate email format
- `checkDuplicates()`: Check for duplicate emails in database
- `saveLeads()`: Save leads to database with upsert
- `searchLeads()`: Search leads with filters and pagination
- `exportToCSV()`: Export leads to CSV with format options
- `getStats()`: Get dashboard statistics
- `getAllCampaigns()`: Get all unique campaigns

## Troubleshooting

### "Missing Supabase environment variables"
Make sure you've created `.env.local` with your Supabase credentials.

### "No email column detected"
Ensure your CSV has a column with "email" in the name. Supported patterns:
- email
- e-mail
- email address
- work email
- business email

### Database connection errors
1. Check your Supabase project is active
2. Verify your API keys are correct
3. Ensure you've run the database migration

### CSV parsing errors
1. Ensure your file is a valid CSV
2. Check for proper UTF-8 encoding
3. Verify file size is under 50MB

## Building for Production

```bash
npm run build
npm start
```

## Deployment

This app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- Any platform supporting Next.js 14

Make sure to set your environment variables in your deployment platform.

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
