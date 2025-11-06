# 📊 Master Database

## Overview

The Master Database is your central hub for viewing, searching, and managing all leads that have been uploaded to the system.

---

## Features

### 📈 Statistics Dashboard
- **Total Leads**: See how many leads are in your database
- **Campaigns**: Track how many campaigns you've run
- **Showing**: Current filtered count based on search

### 🔍 Search & Filter
Search across:
- **Email addresses**
- **Display names**
- **Campaign names**

Real-time filtering as you type!

### 📥 Export
- Export all leads or filtered results
- Download as CSV with all lead data
- Includes email, name, campaigns, and dates

### 🗑️ Delete
- Remove individual leads from database
- Confirmation prompt to prevent accidents
- Instant refresh after deletion

### 🏷️ Campaign Tracking
- View all campaigns at a glance
- Click a campaign badge to filter by that campaign
- See which leads came from which upload

---

## How Campaign Tracking Works

### Campaign Name = File Upload Name

When you upload a CSV file, the campaign name is extracted from:
1. **Filename** (e.g., `summer-2024-leads.csv` → `summer-2024-leads`)
2. **Manual entry** (you can override the auto-detected name)

### Example

**Upload 1**: `q4-webinar-leads.csv`
- Campaign: `q4-webinar-leads`
- 100 new leads added
- All tagged with campaign `q4-webinar-leads`

**Upload 2**: `black-friday-promo.csv`
- Campaign: `black-friday-promo`
- 150 new leads added
- 20 duplicates from previous upload
- New leads tagged with `black-friday-promo`
- Duplicate leads get BOTH campaigns: `[q4-webinar-leads, black-friday-promo]`

**Upload 3**: `q4-webinar-leads-followup.csv`
- Campaign: `q4-webinar-leads-followup`
- 50 new leads added
- 30 duplicates from Upload 1
- Duplicate leads now have: `[q4-webinar-leads, q4-webinar-leads-followup]`

### Multi-Campaign Leads

If a lead appears in multiple uploads:
- The lead is stored **once** in the database
- The campaigns array tracks **all** uploads it appeared in
- You can see the full history of where that lead came from

**Example**:
```
Email: john@example.com
Campaigns: [q4-webinar-leads, black-friday-promo, q4-webinar-leads-followup]
```

This tells you John appeared in 3 different uploads!

---

## Using the Database

### View All Leads

1. Click **"Master Database"** in the navigation
2. See all leads in a table format
3. Scroll through the list

### Search for Specific Leads

1. Type in the search box
2. Search by:
   - Email: `john@example.com`
   - Name: `John Doe`
   - Campaign: `q4-webinar`
3. Results update instantly

### Filter by Campaign

1. Scroll to "All Campaigns" section
2. Click any campaign badge
3. Table filters to show only leads from that campaign

### Export Leads

1. Search/filter to get the leads you want
2. Click **"Export (X)"** button
3. CSV downloads with filtered results
4. Filename: `master-database-2024-11-05.csv`

### Delete a Lead

1. Find the lead in the table
2. Click the trash icon (🗑️)
3. Confirm deletion
4. Lead is removed from database

---

## Table Columns

| Column | Description |
|--------|-------------|
| **Email** | Lead's email address (unique identifier) |
| **Name** | Display name (extracted from CSV data) |
| **Campaigns** | All campaigns this lead has appeared in |
| **Date Added** | When the lead was first added to database |
| **Actions** | Delete button |

---

## Use Cases

### 1. Check if a Lead Exists
Search by email to see if someone is already in your database.

### 2. Track Campaign Performance
Filter by campaign to see how many leads came from each upload.

### 3. Find Multi-Campaign Leads
Search for leads with multiple campaign badges - these are your repeat leads across different uploads.

### 4. Export for External Use
- Export all leads for CRM import
- Export specific campaign leads for targeted outreach
- Export search results for analysis

### 5. Clean Up Database
Remove test leads, invalid emails, or outdated contacts.

---

## Statistics

### Total Leads
The total number of **unique** leads in your database. Even if a lead appears in 5 campaigns, it's counted once.

### Campaigns
The total number of **unique** campaign names tracked. Each upload with a different name creates a new campaign.

### Showing
The current count based on your search/filter. Useful to see how many results match your query.

---

## Tips

### 📌 Naming Conventions
Use clear, descriptive campaign names:
- ✅ `2024-q4-webinar-leads`
- ✅ `black-friday-email-campaign`
- ✅ `linkedin-ads-november`
- ❌ `leads.csv`
- ❌ `new-file-2.csv`

### 🔍 Search Tips
- Search is case-insensitive
- Partial matches work (search "john" finds "john@example.com")
- Search campaigns by any part of the name

### 📊 Campaign Tracking
- Upload same campaign name to append leads to existing campaign
- Use different names to track separate campaigns
- Check campaign badges to see lead history

### 💾 Regular Exports
- Export your database regularly for backups
- Keep CSV exports for historical records
- Use exports for reporting and analysis

---

## Data Flow

```
Upload CSV
    ↓
Extract Campaign Name (from filename)
    ↓
Check for Duplicates
    ↓
New Leads → Add to Database with Campaign
    ↓
Duplicate Leads → Add Campaign to Existing Lead
    ↓
View in Master Database
    ↓
Search, Filter, Export
```

---

## Example Workflow

### Scenario: Running Multiple Campaigns

**Month 1**: Upload `january-newsletter.csv`
- 500 leads added
- Campaign: `january-newsletter`

**Month 2**: Upload `february-newsletter.csv`
- 450 new leads
- 50 duplicates (already in database from Month 1)
- Those 50 leads now have: `[january-newsletter, february-newsletter]`

**Month 3**: Upload `webinar-signup.csv`
- 300 new leads
- 100 duplicates (some from Month 1, some from Month 2)
- Duplicates get `webinar-signup` added to their campaigns array

**Result in Master Database**:
- Total Leads: 1,250 unique leads
- Campaigns: 3 campaigns tracked
- Some leads have 1 campaign, some have 2, some have all 3

**Analysis**:
- Search for leads with 3 campaigns = your most engaged audience
- Filter by `webinar-signup` = see who signed up for webinar
- Export `january-newsletter` leads = see your original audience

---

## Technical Details

### Database Structure
```typescript
Lead {
  email: string (primary key)
  display_name: string
  campaigns: string[] (array of campaign names)
  date_added: timestamp
  last_updated: timestamp
  source_data: jsonb (original CSV data)
}
```

### Campaign Array
- PostgreSQL array type
- Automatically appends new campaigns
- No duplicates in array
- Maintains insertion order

### Indexing
- Email: Primary key (fast lookups)
- Campaigns: GIN index (fast array searches)
- Date Added: B-tree index (fast sorting)

---

## FAQ

**Q: Can I rename a campaign?**  
A: Not directly in the UI. You'd need to update the database manually or re-upload with a new name.

**Q: What happens if I delete a lead?**  
A: It's permanently removed from the database. If you upload it again, it will be added as a new lead.

**Q: Can I export just emails?**  
A: The current export includes all fields. You can open the CSV and delete columns you don't need.

**Q: How do I see leads from multiple campaigns?**  
A: Search for part of the campaign name, or click multiple campaign badges (though only one filter applies at a time).

**Q: Can I edit lead data?**  
A: Not in the current version. You can delete and re-upload, or update the database directly.

---

## Summary

The Master Database gives you:
- ✅ Complete visibility into all leads
- ✅ Campaign tracking via upload names
- ✅ Powerful search and filtering
- ✅ Easy export for external use
- ✅ Simple lead management

It's your central hub for lead management! 🎯



