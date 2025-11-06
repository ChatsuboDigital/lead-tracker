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

