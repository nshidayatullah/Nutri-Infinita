-- Add compliance columns to daily_menus for analytics
-- Compliance is tracked per menu (per catering, date, meal_time)

ALTER TABLE daily_menus 
ADD COLUMN IF NOT EXISTS is_compliant boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS compliance_note text;

-- Create index for faster analytics on compliance
CREATE INDEX IF NOT EXISTS idx_daily_menus_compliance ON daily_menus(is_compliant);
