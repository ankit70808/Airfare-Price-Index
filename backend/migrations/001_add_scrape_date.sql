-- Run this in psql, connected to your database:
--   psql -U <your_user> -d <your_db> -f 001_add_scrape_date.sql
--
-- If your table isn't named "flight_pricing_data", or your column names came
-- out different (run \d flight_pricing_data first to check), find-and-replace
-- below before running.

-- 1. Add the date the row was scraped on. Existing 98 rows backfill to today.
ALTER TABLE flight_pricing_data
  ADD COLUMN IF NOT EXISTS scrape_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- 2. Prevent duplicate rows for the same route+window+class on the same day
--    (lets your daily scrape job safely re-run with an upsert, see below).
ALTER TABLE flight_pricing_data
  ADD CONSTRAINT uq_fare_snapshot
  UNIQUE (origin, destination, purchasewindow, class, scrape_date);

-- 3. Index for the query pattern the API actually uses: one route+window,
--    ordered by date.
CREATE INDEX IF NOT EXISTS idx_fare_lookup
  ON flight_pricing_data (origin, destination, purchasewindow, scrape_date);
