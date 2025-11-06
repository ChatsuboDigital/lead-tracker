# Lead Tracker - Feature Documentation

Complete guide to all features and capabilities of the Lead Tracker application.

## Table of Contents

1. [CSV Upload & Processing](#csv-upload--processing)
2. [Duplicate Detection](#duplicate-detection)
3. [Dashboard & Lead Management](#dashboard--lead-management)
4. [Export Builder](#export-builder)
5. [Campaign Management](#campaign-management)
6. [Search & Filtering](#search--filtering)
7. [Bulk Operations](#bulk-operations)

---

## CSV Upload & Processing

### Supported File Formats
- **Format**: CSV (Comma-Separated Values)
- **Max Size**: 50MB
- **Encoding**: UTF-8 recommended
- **Max Rows**: Optimized for up to 10,000 rows

### Upload Methods
1. **Drag & Drop**: Drag CSV file onto the upload area
2. **Click to Browse**: Click the upload area to select a file

### Automatic Email Detection

The system automatically detects email columns using these patterns:
- `email`
- `e-mail`
- `email address`
- `work email`
- `business email`
- `mail`

**Multiple Email Columns**: If multiple email columns are detected, you'll be prompted to select which one to use.

### Campaign Name Extraction

Campaign names are automatically extracted from filenames:

**Examples**:
- `marketing-campaign-2024-01-15.csv` → "Marketing Campaign"
- `q1_leads_2024.csv` → "Q1 Leads"
- `summer-sale.csv` → "Summer Sale"

**Rules**:
- Removes `.csv` extension
- Removes date patterns (YYYY-MM-DD, MM-DD-YYYY)
- Replaces dashes/underscores with spaces
- Capitalizes each word

You can edit the campaign name before processing.

### Email Validation

Each email is validated using regex pattern:
```
^[^\s@]+@[^\s@]+\.[^\s@]+$
```

**Valid Examples**:
- `john@example.com`
- `jane.smith@company.co.uk`
- `user+tag@domain.com`

**Invalid Examples**:
- `notanemail` (no @ symbol)
- `@domain.com` (missing local part)
- `user@` (missing domain)

### CSV Preview

After upload, you'll see:
- First 5 rows of data
- All column headers
- Email column highlighted
- Valid/invalid email counts

---

## Duplicate Detection

### How It Works

1. **Normalization**: All emails are converted to lowercase and trimmed
2. **Batch Query**: Checks all emails against database in a single query
3. **Classification**: Splits results into new leads and duplicates

### Results Display

**New Leads** (Green Badge):
- Emails not in database
- Will be added on save
- Shows email and name fields from CSV

**Duplicates** (Red Badge):
- Emails already in database
- Shows existing campaigns
- Shows date originally added
- Won't be re-added to database

### Search Results

Use the search bar to filter results by email address in real-time.

### View Options

Three tabs available:
1. **New**: Shows only new leads
2. **Duplicates**: Shows only duplicates with their existing data
3. **All**: Shows both new and duplicates together

---

## Dashboard & Lead Management

### Statistics Cards

Four key metrics displayed:
1. **Total Leads**: All leads in database
2. **This Week**: Leads added in current week (Monday-Sunday)
3. **This Month**: Leads added in current month
4. **Total Campaigns**: Unique campaign count

### Lead Table

**Columns**:
- Email (sortable)
- Display Name (sortable)
- Campaigns (shows first 3 + count)
- Date Added (sortable, default descending)
- Actions (view/delete)

**Features**:
- Click column headers to sort
- Click row to view full details
- Select multiple leads with checkboxes
- 50 leads per page

### Pagination

- Shows current page and total pages
- Jump to first/last page
- Navigate previous/next
- Direct page number selection
- Smart page number display (shows 5 pages at a time)

### Lead Detail Modal

Click any lead to view:
- Full email and display name
- All campaigns (as badges)
- Date added and last updated
- All source data (original CSV fields)
- Editable notes field
- Delete button

**Notes Feature**:
- Add custom notes to any lead
- Saved in `source_data.notes`
- Persists across sessions

---

## Export Builder

### Filter Options

**Campaign Filters**:
- **Include Campaigns**: Lead must be in at least one selected campaign
- **Exclude Campaigns**: Lead must NOT be in any selected campaign
- Can use both simultaneously

**Date Range**:
- **Start Date**: Include leads added on or after this date
- **End Date**: Include leads added on or before this date

**Email Search**:
- Filter by partial email match
- Case-insensitive
- Real-time preview updates

### Preview Section

Shows:
- Total count of matching leads
- First 5 matching leads
- Updates in real-time as filters change

### Export Formats

**All Fields**:
- Email, display name, campaigns, dates
- All original CSV columns (source_data)
- Best for complete backup

**Core Fields Only**:
- Email
- Display name
- Campaigns (semicolon-separated)
- Date added

**Email Only**:
- Just the email addresses
- Perfect for email marketing tools

### Advanced Options

**Custom Filename**:
- Specify filename (without .csv)
- Date automatically appended
- Example: `leads-export-2024-01-15.csv`

**Tag with Campaign**:
- Optionally add a new campaign to exported leads
- Useful for tracking "exported to X" campaigns
- Campaign is added to database before export

---

## Campaign Management

### Campaign Tracking

Each lead can have multiple campaigns:
- Stored as PostgreSQL array
- No duplicates (automatically prevented)
- Unlimited campaigns per lead

### Adding Campaigns

**During Upload**:
- Campaign name extracted from filename
- Editable before processing
- Added to all new leads

**Bulk Add**:
- Select multiple leads in dashboard
- Click "Add to Campaign"
- Enter campaign name
- Only adds if not already present

**During Export**:
- Option to tag exported leads
- Adds campaign to all exported leads
- Useful for tracking export batches

### Campaign Filtering

**Dashboard**:
- Click campaign badges to filter
- Multiple campaigns = OR logic (lead in ANY selected)
- "Clear All" to reset filters

**Export Builder**:
- Include: Lead must be in at least one
- Exclude: Lead must NOT be in any
- Combine both for advanced filtering

---

## Search & Filtering

### Email Search

**Features**:
- Fuzzy matching using PostgreSQL pg_trgm
- Case-insensitive
- Partial matches supported
- 300ms debounce for performance

**Examples**:
- Search `john` finds `john@example.com`, `johnny@test.com`
- Search `@gmail` finds all Gmail addresses
- Search `example.com` finds all emails from that domain

### Campaign Filters

**Dashboard**:
- Multi-select badge interface
- Click to toggle selection
- Shows all unique campaigns
- Updates results immediately

**Export Builder**:
- Separate include/exclude lists
- Click badge to toggle
- Red badges = excluded
- Blue badges = included

### Date Range Filtering

**Available in**: Export Builder

**Features**:
- Date picker interface
- Start date only: All leads from that date forward
- End date only: All leads up to that date
- Both: Leads within date range
- Inclusive (includes start and end dates)

---

## Bulk Operations

### Selection

**Select All**:
- Checkbox in table header
- Selects all leads on current page
- Visual indicator when partially selected

**Individual Selection**:
- Checkbox in each row
- Click to toggle
- Selected count shown in blue banner

### Available Actions

**Add to Campaign**:
1. Select leads
2. Click "Add to Campaign"
3. Enter campaign name
4. Confirms with toast notification
5. Updates database immediately

**Export Selected**:
1. Select leads
2. Click "Export Selected"
3. Downloads CSV with all fields
4. Filename: `selected-leads-YYYY-MM-DD.csv`

**Delete Selected**:
1. Select leads
2. Click "Delete Selected"
3. Confirmation dialog appears
4. Permanently removes from database
5. Cannot be undone

### Performance

- Batch operations use single database queries
- No N+1 query problems
- Handles 1000+ selections efficiently
- Progress indicators for long operations

---

## Performance Features

### Optimization Techniques

**Database**:
- GIN indexes on campaigns array
- B-tree index on date_added
- pg_trgm index for fuzzy search
- Batch queries (no N+1)

**Frontend**:
- Debounced search (300ms)
- Pagination (50 per page)
- Lazy loading of modals
- Optimistic UI updates

**CSV Processing**:
- Streaming parse with PapaParse
- Progress indicators
- Early validation
- Memory-efficient

### Limits

- **CSV Size**: 50MB max
- **Rows**: Optimized for 10,000, can handle more
- **Page Size**: 50 leads per page
- **Search Debounce**: 300ms
- **Campaign Display**: First 3 shown, rest collapsed

---

## Error Handling

### Upload Errors

- **File too large**: Shows error, max 50MB
- **Invalid format**: Must be .csv
- **No email column**: Must have email field
- **Empty CSV**: Must have at least 1 row
- **Parse error**: Invalid CSV format

### Database Errors

- **Connection failed**: Check Supabase credentials
- **Query timeout**: Reduce result set size
- **Duplicate key**: Handled gracefully with upsert

### User Feedback

All operations show:
- ✅ Success toast (green)
- ❌ Error toast (red)
- ℹ️ Info toast (blue)
- ⚠️ Warning toast (yellow)

---

## Keyboard Shortcuts

*Future feature - placeholder for reference*

- `Cmd/Ctrl + K`: Focus search
- `Cmd/Ctrl + U`: Upload page
- `Cmd/Ctrl + D`: Dashboard
- `Cmd/Ctrl + E`: Export page

---

## Mobile Responsiveness

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Responsive Features

- Collapsible navigation on mobile
- Stacked cards on small screens
- Horizontal scroll for tables
- Touch-friendly buttons (44px min)
- Simplified pagination on mobile

---

## Data Privacy

### What's Stored

- Email addresses (primary key)
- Display names
- Campaign associations
- Date added/updated
- All original CSV data (in JSONB)
- User-added notes

### What's NOT Stored

- Passwords (no authentication yet)
- IP addresses
- Session data
- File uploads (processed and discarded)

### Data Export

- Users can export all their data
- CSV format for portability
- Includes all fields
- No data lock-in

---

## Best Practices

### CSV Preparation

1. Include email column with clear name
2. Add first_name/last_name for display names
3. Use UTF-8 encoding
4. Remove special characters from headers
5. Test with small sample first

### Campaign Naming

1. Use descriptive names: "Q1 2024 Marketing"
2. Be consistent with naming conventions
3. Avoid special characters
4. Keep under 50 characters
5. Use dates in format: YYYY-MM-DD

### Database Maintenance

1. Regularly export backups
2. Clean up old/unused leads
3. Monitor database size
4. Review campaign list periodically
5. Add notes to important leads

### Performance Tips

1. Keep CSVs under 10,000 rows
2. Use pagination, don't load all at once
3. Use specific filters to reduce result sets
4. Export in batches for large datasets
5. Clear browser cache if experiencing issues

---

## Troubleshooting

See SETUP_GUIDE.md for detailed troubleshooting steps.

Quick fixes:
- **Slow performance**: Reduce page size, add more filters
- **Upload fails**: Check file size and format
- **Search not working**: Check database indexes
- **Export empty**: Verify filters aren't too restrictive
- **Duplicates not detected**: Check email format consistency

