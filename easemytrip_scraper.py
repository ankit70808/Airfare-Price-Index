import asyncio
import re
import random
import logging
from urllib.parse import quote
from datetime import datetime, timezone, timedelta
import pandas as pd
from playwright.async_api import async_playwright

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("sih_scraper_easemytrip.log"),
        logging.StreamHandler()
    ]
)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
]

# IATA -> full city name, as required in EaseMyTrip's URL scheme
CITY_NAMES = {
    "DEL": "Delhi", "BOM": "Mumbai", "BLR": "Bangalore", "HYD": "Hyderabad",
    "PNQ": "Pune", "CCU": "Kolkata", "AMD": "Ahmedabad", "MAA": "Chennai",
    "GOI": "Goa", "GAU": "Guwahati", "SXR": "Srinagar",
}

# Only keep the N cheapest flights per search — cuts data volume AND
# processing time, since we don't waste effort parsing every one of the
# 150+ cards a search can return.
LIMIT_PER_SEARCH = 20

# Extracts ALL flight cards from the page in a SINGLE browser round-trip
# using JavaScript, instead of making a separate Playwright call per field
# per card (which is what made the old version slow — 150 cards x 8 calls
# each = 1200+ round trips per search).
EXTRACT_JS = """
() => {
    const cards = document.querySelectorAll('div.nw_listing_bx_tp');
    const results = [];
    cards.forEach(card => {
        const airlineEl = card.querySelector('h6.ft_13.ft_500');
        const flightCodeEl = card.querySelector('span.ft_13');
        const h4s = card.querySelectorAll('h4');
        const tmLcSpans = card.querySelectorAll('.tm_lc span');
        const durationEl = card.querySelector('p.ft_13');
        const stopsEl = card.querySelector('span.ft_11.gryclr');
        const priceEl = card.querySelector('h4[id^="spnPrice"]');
        const seatsEl = card.querySelector('div.seatlft');

        if (!priceEl || h4s.length < 2) return;  // skip malformed cards

        results.push({
            airline: airlineEl ? airlineEl.innerText.trim() : null,
            flight_code: flightCodeEl ? flightCodeEl.innerText.trim() : null,
            departure_time: h4s[0] ? h4s[0].innerText.trim() : null,
            arrival_time: h4s[1] ? h4s[1].innerText.trim() : null,
            origin_city: tmLcSpans[0] ? tmLcSpans[0].innerText.trim() : null,
            dest_city: tmLcSpans[2] ? tmLcSpans[2].innerText.trim() : null,
            duration: durationEl ? durationEl.innerText.trim() : null,
            stops: stopsEl ? stopsEl.innerText.trim() : null,
            price_text: priceEl.innerText.trim(),
            seats_left: seatsEl ? seatsEl.innerText.trim() : null,
        });
    });
    return results;
}
"""


def build_easemytrip_url(origin, destination, travel_date):
    """
    travel_date: "YYYY-MM-DD" -> converted to EaseMyTrip's DD/MM/YYYY format.
    URL pattern confirmed from a real manual search:
    srch=DEL-Delhi-India|BOM-Mumbai-India|28/08/2026
    """
    date_obj = datetime.strptime(travel_date, "%Y-%m-%d")
    date_str = date_obj.strftime("%d/%m/%Y")

    origin_city = CITY_NAMES.get(origin, origin)
    dest_city = CITY_NAMES.get(destination, destination)

    srch = f"{origin}-{origin_city}-India|{destination}-{dest_city}-India|{date_str}"
    srch_encoded = quote(srch, safe="")

    url = (
        "https://www.easemytrip.com/flight-search/listing"
        f"?srch={srch_encoded}"
        "&px=1-0-0&cbn=0&ar=undefined&isow=true&isdm=true"
        "&lang=en-us&IsDoubleSeat=false&CCODE=IN&curr=INR&apptype=B2C"
    )
    return url


async def scrape_easemytrip(browser, origin, destination, travel_date):
    """
    origin/destination: IATA codes (e.g. "DEL", "BOM")
    travel_date: "YYYY-MM-DD"
    """
    scraped_data = []

    context = await browser.new_context(user_agent=random.choice(USER_AGENTS))
    page = await context.new_page()

    try:
        origin_city = CITY_NAMES.get(origin, origin)
        dest_city = CITY_NAMES.get(destination, destination)

        url = build_easemytrip_url(origin, destination, travel_date)
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(8000)  # results take a while to load

        # ---- RESULTS PARSING — single fast JS pass, then trim to cheapest N ----
        raw_cards = await page.evaluate(EXTRACT_JS)
        logging.info(f"Found {len(raw_cards)} flight cards for {origin}->{destination}")

        for c in raw_cards:
            try:
                price_match = re.search(r"[\d,]+", c["price_text"] or "")
                if not price_match:
                    continue
                fare = float(price_match.group().replace(",", ""))

                base_price = round(fare / 1.05, 2)
                gst = round(fare - base_price, 2)

                scraped_data.append({
                    "Origin": c["origin_city"] or origin_city,
                    "Destination": c["dest_city"] or dest_city,
                    "Airline name": c["airline"] or "Unknown",
                    "Flight_code": c["flight_code"] or "Unknown",
                    "Stops": c["stops"] or "Unknown",
                    "Travel_date": travel_date,
                    "Departure_time": c["departure_time"],
                    "Arrival_time": c["arrival_time"],
                    "Duration": c["duration"],
                    "Fare": fare,
                    "Base price": base_price,
                    "GST": gst,
                    "Currency": "INR",
                    "Seats_left": c["seats_left"],
                    "Scraped_at time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                    "Source": "EaseMyTrip",
                })
            except Exception as card_err:
                logging.warning(f"Skipped a card due to: {card_err}")
                continue

        # Keep only the N cheapest per search — controls total dataset size
        # and avoids storing near-duplicate fare-bundle variants of the
        # same flight (EaseMyTrip often lists several fare types per flight).
        if len(scraped_data) > LIMIT_PER_SEARCH:
            scraped_data.sort(key=lambda r: r["Fare"])
            scraped_data = scraped_data[:LIMIT_PER_SEARCH]

    except Exception as e:
        logging.error(f"Error on {origin}->{destination}: {e}")
    finally:
        await page.close()
        await context.close()

    if scraped_data:
        df = pd.DataFrame(scraped_data)
        df = df.sort_values(by="Fare")
        df = df.drop_duplicates(subset=["Origin", "Destination", "Flight_code", "Travel_date"], keep="first")
        return df.to_dict("records")
    return []


async def main():
    # Trimmed to top 10 highest-traffic routes (was 20) to cut runtime ~in half
    routes = [
        ("DEL", "BOM"), ("BLR", "DEL"), ("BLR", "BOM"), ("DEL", "HYD"),
        ("DEL", "PNQ"), ("DEL", "CCU"), ("AMD", "DEL"), ("MAA", "DEL"),
        ("HYD", "BOM"), ("BLR", "CCU"),
    ]

    today = datetime.now()
    dates = [
        (today + timedelta(days=1)).strftime("%Y-%m-%d"),
        (today + timedelta(days=7)).strftime("%Y-%m-%d"),
        (today + timedelta(days=15)).strftime("%Y-%m-%d"),
        (today + timedelta(days=30)).strftime("%Y-%m-%d"),
        (today + timedelta(days=45)).strftime("%Y-%m-%d"),
    ]

    all_data = []
    total = len(routes) * len(dates)
    count = 1

    logging.info(f"Starting EaseMyTrip Engine: {total} combinations...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        for origin, dest in routes:
            for d in dates:
                logging.info(f"[{count}/{total}] Scraping {origin}->{dest} for {d}...")
                data = await scrape_easemytrip(browser, origin, dest, d)
                all_data.extend(data)
                count += 1
                await asyncio.sleep(random.uniform(3.0, 5.0))

        await browser.close()

    if all_data:
        df = pd.DataFrame(all_data)
        df = df.sort_values(by="Fare")
        df = df.drop_duplicates(subset=["Origin", "Destination", "Flight_code", "Travel_date"], keep="first")
        df.to_csv("sih_dgca_top20_easemytrip.csv", index=False)
        logging.info(f"SUCCESS! Master dataset saved. Total unique flights extracted: {len(df)}")
    else:
        logging.warning("No data extracted. Check selectors or connection.")


if __name__ == "__main__":
    asyncio.run(main())
