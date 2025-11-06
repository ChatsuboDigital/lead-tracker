# 🧹 Duplicate Removal Feature Guide

## What This Does

This feature allows you to **upload a CSV file, check for duplicates against your database, and export a clean CSV with duplicates removed** - without saving anything to the database.

Perfect for cleaning up lead lists before importing them into other systems!

---

## How It Works

### Step 1: Upload Your CSV
1. Go to the Upload page (home page)
2. Drag and drop your CSV file
3. The system automatically detects the email column
4. Review the campaign name (you can edit it)

### Step 2: Check for Duplicates
1. Click **"Check for Duplicates"**
2. The system checks all emails against your database
3. You'll see two groups:
   - **NEW LEADS** (green) - Unique emails not in your database
   - **DUPLICATES** (red) - Emails already in your database

### Step 3: Export Options

You now have **THREE export options**:

#### Option 1: Export New Leads & Save to Database (Blue Button)
- **What it does**: Exports new leads AND saves them to your database
- **Use when**: You want to add these leads to your tracking system
- **Result**: 
  - CSV file downloads with new leads
  - Leads are saved to database
  - Campaign is added to each lead

#### Option 2: Export Unique Only - Remove Duplicates (Purple Button) ⭐ NEW!
- **What it does**: Exports ONLY unique leads (duplicates removed)
- **Use when**: You want a clean CSV without duplicates for another system
- **Result**:
  - CSV file downloads with ONLY new/unique leads
  - Duplicates are completely removed
  - Nothing is saved to database
  - Original CSV format is preserved
- **Filename**: `campaign-name-duplicates-removed-2024-11-05.csv`
- **Shows**: "Exported X unique leads (Y duplicates removed)"

#### Option 3: Export All (Including Duplicates) (Gray Button)
- **What it does**: Exports everything from your upload
- **Use when**: You want a backup or need all data
- **Result**: 
  - CSV file downloads with ALL leads
  - Nothing is saved to database
  - For backup purposes

---

## Use Cases

### Use Case 1: Clean a List Before Importing to Email Tool
**Scenario**: You have a CSV with 1,000 leads, but 300 are already in your database. You want to import only the new 700 to your email marketing tool.

**Steps**:
1. Upload your CSV
2. Click "Check for Duplicates"
3. Click **"Export Unique Only (Remove 300 Duplicates)"**
4. Import the downloaded CSV to your email tool
5. ✅ Only 700 unique leads imported!

### Use Case 2: Deduplicate Against Your Database
**Scenario**: You bought a lead list but want to remove anyone you already have.

**Steps**:
1. Upload the purchased list
2. Click "Check for Duplicates"
3. See how many are already in your system
4. Click **"Export Unique Only"**
5. ✅ Get a clean list with no duplicates!

### Use Case 3: Clean Multiple Lists
**Scenario**: You have 3 CSV files from different sources and want to merge them without duplicates.

**Steps**:
1. Upload first CSV → Export & Save to Database
2. Upload second CSV → Export Unique Only (removes duplicates from first)
3. Upload third CSV → Export Unique Only (removes duplicates from first two)
4. ✅ Three clean lists, no duplicates!

### Use Case 4: Audit Your Data
**Scenario**: You want to see how many duplicates are in a list before deciding what to do.

**Steps**:
1. Upload your CSV
2. Click "Check for Duplicates"
3. Review the counts: "Found X new leads and Y duplicates"
4. Decide which export option to use
5. ✅ Make informed decisions about your data!

---

## What Gets Exported

### Export Unique Only Format
The exported CSV includes **all original columns** from your upload:

**Example Input CSV**:
```csv
email,first_name,last_name,company,phone,notes
john@example.com,John,Doe,Acme,555-1234,VIP
jane@example.com,Jane,Smith,Tech,555-5678,Follow up
bob@duplicate.com,Bob,Jones,Corp,555-9012,Old lead
```

**If `bob@duplicate.com` is already in database**:

**Exported CSV** (duplicates removed):
```csv
email,first_name,last_name,company,phone,notes
john@example.com,John,Doe,Acme,555-1234,VIP
jane@example.com,Jane,Smith,Tech,555-5678,Follow up
```

✅ Bob's row is completely removed  
✅ All original columns preserved  
✅ Ready to import elsewhere  

---

## Visual Guide

### After Clicking "Check for Duplicates"

```
┌─────────────────────────────────────────────────┐
│  NEW LEADS                    DUPLICATES         │
│  [Green Badge: 150]          [Red Badge: 50]    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  [Blue Button]                                   │
│  Export New Leads & Save to Database            │
│  ↓ Downloads 150 leads + Saves to DB            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  [Purple Button] ⭐ NEW!                         │
│  Export Unique Only (Remove 50 Duplicates)      │
│  ↓ Downloads 150 leads (50 removed)             │
│  ↓ Nothing saved to database                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  [Gray Button]                                   │
│  Export All (Including Duplicates)              │
│  ↓ Downloads all 200 leads                      │
└─────────────────────────────────────────────────┘
```

---

## Key Differences

| Feature | Save & Export | Export Unique Only | Export All |
|---------|--------------|-------------------|------------|
| Saves to database | ✅ Yes | ❌ No | ❌ No |
| Includes duplicates | ❌ No | ❌ No | ✅ Yes |
| Adds campaign tag | ✅ Yes | ❌ No | ❌ No |
| Use for other systems | ✅ Yes | ✅ Yes | ✅ Yes |
| Clean CSV output | ✅ Yes | ✅ Yes | ❌ No |

---

## Tips & Best Practices

### Tip 1: Check First, Export Later
Always click "Check for Duplicates" first to see the counts before deciding which export option to use.

### Tip 2: Use Unique Export for External Systems
If you're importing to another system (email tool, CRM, etc.), use **"Export Unique Only"** to avoid importing duplicates.

### Tip 3: Save to Database for Tracking
Only use **"Export & Save to Database"** when you want to track these leads in your Lead Tracker system.

### Tip 4: Keep Backups
Use **"Export All"** to keep a backup of the original upload before removing duplicates.

### Tip 5: Build Your Database First
Upload and save a few lists to your database first. Then, all future uploads will be checked against this growing database of known leads.

---

## Workflow Examples

### Workflow 1: One-Time Cleanup
```
1. Upload CSV
2. Check for Duplicates
3. Export Unique Only
4. Import to email tool
✅ Done! Database unchanged.
```

### Workflow 2: Add to Tracking + Get Clean List
```
1. Upload CSV
2. Check for Duplicates
3. Export New Leads & Save to Database
4. Later: Upload another CSV
5. Export Unique Only (removes leads from step 3)
✅ Database grows, clean lists exported!
```

### Workflow 3: Audit Multiple Sources
```
1. Upload List A → Export & Save
2. Upload List B → Check duplicates
3. See: "Found 100 new, 50 duplicates"
4. Export Unique Only
✅ Know exactly how many duplicates exist!
```

---

## FAQ

### Q: Does "Export Unique Only" save anything to the database?
**A**: No! It only downloads a CSV. Your database is unchanged.

### Q: What if I have no duplicates?
**A**: The button will show "Remove 0 Duplicates" and export all leads.

### Q: Can I undo an export?
**A**: Exports don't change your database, so there's nothing to undo. If you used "Export & Save", you can delete those leads from the Dashboard.

### Q: What format is the exported CSV?
**A**: Same format as your original upload - all columns preserved.

### Q: Can I use this to merge multiple CSVs?
**A**: Yes! Upload and save the first, then upload others and use "Export Unique Only" to get only new leads.

### Q: What happens to the duplicate rows?
**A**: They're completely removed from the exported CSV. You can see them in the "Duplicates" tab before exporting.

---

## Button Colors Explained

- **Blue** = Saves to database + exports
- **Purple** = Export only (duplicates removed) ⭐ NEW!
- **Gray** = Export only (includes duplicates)

---

## Success Messages

### After "Export Unique Only"
```
✅ Exported 150 unique leads (50 duplicates removed)
```

This tells you:
- 150 leads in the downloaded CSV
- 50 leads were removed as duplicates
- Nothing saved to database

---

## Summary

The **"Export Unique Only"** feature gives you:

✅ Clean CSV files with duplicates removed  
✅ No database changes  
✅ Original CSV format preserved  
✅ Perfect for importing to other systems  
✅ Clear count of removed duplicates  

**Use it whenever you need a clean lead list without duplicates!**

---

*Last Updated: November 5, 2025*



