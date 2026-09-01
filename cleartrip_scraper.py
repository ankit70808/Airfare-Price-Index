import asyncio
import re
import random
import logging
from datetime import datetime, timezone, timedelta
import pandas as pd
from playwright.async_api import async_playwright

# 1. Professional Logging Setup (Terminal + File)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("sih_scraper.log"),
        logging.StreamHandler()
    ]
)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
]

async def scrape_cleartrip(browser, origin, destination, travel_date):
    scraped_data = []
    
    # Format date for Cleartrip (DD/MM/YYYY)
    date_obj = datetime.strptime(travel_date, "%Y-%m-%d")
    ct_date = date_obj.strftime("%d/%m/%Y")
    url = f"https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0&class=Economy&depart_date={ct_date}&from={origin}&to={destination}"
    
    # Create new context to save RAM and bypass bot-detection
    context = await browser.new_context(user_agent=random.choice(USER_AGENTS))
    page = await context.new_page()
    
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(10000) # Give page time to load completely
        
        flight_cards = await page.locator("div").all()
        known_airlines = ["IndiGo", "Air India", "Akasa Air", "SpiceJet", "Vistara", "Air India Express"]
        
        for card in flight_cards:
            text = await card.inner_text()
            
            if "₹" not in text:
                continue
                
            # A. Extract Departure and Arrival Times
            times = re.findall(r'\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b', text)
            if len(times) < 2:
                continue
                
            # B. BULLETPROOF PRICE LOGIC: Get all prices, pick the maximum (Real Fare > Discount)
            price_matches = re.findall(r'₹\s*([\d,]+)', text)
            if not price_matches:
                continue
                
            price_list = [int(p.replace(',', '')) for p in price_matches]
            clean_price = float(max(price_list))
            
            # Skip unrealistic values (ads or false catches)
            if clean_price < 2000 or clean_price > 50000: 
                continue
            
            # C. Flight Code & Smart Airline Extraction
            code_match = re.search(r'\b([A-Z0-9]{2})\s*[-]?\s*(\d{3,4})\b', text, re.IGNORECASE)
            if code_match:
                prefix = code_match.group(1).upper()
                flight_code = f"{prefix}-{code_match.group(2)}"
                
                # Standardize Names based on exact IATA codes
                if prefix == "6E": airline = "IndiGo"
                elif prefix == "IX": airline = "Air India Express"
                elif prefix == "AI": airline = "Air India"
                elif prefix == "QP": airline = "Akasa Air"
                elif prefix == "SG": airline = "SpiceJet"
                elif prefix == "UK": airline = "Vistara"
                elif prefix == "I5": airline = "AIX Connect"
                else: airline = "Unknown"
            else:
                flight_code = "Unknown"
                airline = "Unknown"
                for a in known_airlines:
                    if a.lower() in text.lower():
                        airline = a
                        break

            # D. Stops (Non-stop vs Layover)
            stops_match = re.search(r'(Non-stop|\d+\s*stop)', text, re.IGNORECASE)
            stops = stops_match.group(1).capitalize() if stops_match else "Unknown"
            
            departure_time = f"{times[0][0]}:{times[0][1]}"
            arrival_time = f"{times[1][0]}:{times[1][1]}"
            base_price = round(clean_price / 1.05, 2)
            gst = round(clean_price - base_price, 2)
            
            scraped_data.append({
                "Origin": origin,
                "Destination": destination,
                "Airline name": airline,
                "Flight_code": flight_code,
                "Stops": stops,
                "Travel_date": travel_date,
                "Departure_time": departure_time,
                "Arrival_time": arrival_time,
                "Fare": clean_price,
                "Base price": base_price,
                "GST": gst,
                "Currency": "INR",
                "Scraped_at time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                "Source": "Cleartrip"
            })
            
    except Exception as e:
        logging.error(f"Error on {origin}->{destination}: {e}")
    finally:
        # Prevent memory leaks
        await page.close()
        await context.close() 
        
    if scraped_data:
        df = pd.DataFrame(scraped_data)
        df = df.sort_values(by='Fare') 
        df = df.drop_duplicates(subset=['Origin', 'Destination', 'Flight_code', 'Travel_date'], keep='first')
        return df.to_dict('records')
    return []

async def main():
    # Top 20 DGCA Routes
    routes = [
        ("DEL", "BOM"), ("BLR", "DEL"), ("BLR", "BOM"), ("DEL", "HYD"),
        ("DEL", "PNQ"), ("DEL", "CCU"), ("AMD", "DEL"), ("MAA", "DEL"),
        ("HYD", "BOM"), ("BLR", "CCU"), ("DEL", "SXR"), ("BLR", "HYD"),
        ("CCU", "BOM"), ("MAA", "BOM"), ("AMD", "BOM"), ("BLR", "PNQ"),
        ("MAA", "HYD"), ("GOI", "DEL"), ("DEL", "GAU"), ("GOI", "BOM")
    ]
    
    today = datetime.now()
    
    # Official SIH T+1 to T+45 Days Windows
    dates = [
        (today + timedelta(days=1)).strftime("%Y-%m-%d"),
        (today + timedelta(days=7)).strftime("%Y-%m-%d"),
        (today + timedelta(days=15)).strftime("%Y-%m-%d"),
        (today + timedelta(days=30)).strftime("%Y-%m-%d"),
        (today + timedelta(days=45)).strftime("%Y-%m-%d")
    ]
    
    all_data = []
    total = len(routes) * len(dates)
    count = 1
    
    logging.info(f"🚀 Starting Official SIH Engine: {total} combinations...")
    
    # Launch browser only ONCE to save memory
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        
        for origin, dest in routes:
            for d in dates:
                logging.info(f"[{count}/{total}] Scraping {origin}->{dest} for {d}...")
                data = await scrape_cleartrip(browser, origin, dest, d)
                all_data.extend(data)
                count += 1
                
                # CORRECTLY INDENTED ANTI-BOT DELAY
                delay = random.uniform(3.0, 5.0)
                await asyncio.sleep(delay)
                
        await browser.close()
            
    if all_data:
        # Final Master Deduplication across entire dataset
        df = pd.DataFrame(all_data)
        df = df.sort_values(by='Fare')
        df = df.drop_duplicates(subset=['Origin', 'Destination', 'Flight_code', 'Travel_date'], keep='first')
        
        df.to_csv("sih_dgca_top20_cleartrip.csv", index=False)
        logging.info(f"✅ SUCCESS! Master dataset saved. Total unique flights extracted: {len(df)}")
    else:
        logging.warning("No data extracted. Please check your internet connection or IP block.")

if __name__ == "__main__":
    asyncio.run(main())