from fast_flights import FlightQuery, Passengers, create_query, get_flights
from datetime import datetime, timezone
import pandas as pd
import time

def scrape_google_flights(origin, destination, travel_date):
    # 1. Construct the query payload
    query = create_query(
        flights=[
            FlightQuery(
                date=travel_date, 
                from_airport=origin,
                to_airport=destination
            )
        ],
        passengers=Passengers(adults=1),
        trip="one-way",
        seat="economy"
    )
    
    try:
        result = get_flights(query)
        scraped_data = []
        
        # FIX: In v3+, 'result' is a ResultList. We loop through it directly.
        for flight in result:
            
            # Extract airline name dynamically based on v3 property updates
            if hasattr(flight, 'name'):
                airline_name = flight.name
            elif hasattr(flight, 'airline'):
                airline_name = flight.airline
            elif hasattr(flight, 'airlines'):
                airline_name = ", ".join(flight.airlines)
            else:
                airline_name = "Unknown"
                
            total_fare = float(flight.price)
            
            # Reverse calculate Base and GST (assuming standard 5% economy tax)
            base_price = round(total_fare / 1.05, 2)
            gst = round(total_fare - base_price, 2)
            
            scraped_data.append({
                "Origin": origin,
                "Destination": destination,
                "Airline name": airline_name,
                "Travel_date": travel_date,
                "Fare": total_fare,
                "Base price": base_price,
                "GST": gst,
                "Currency": "INR",
                "Scraped_at time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                "Source": "Google Flights"
            })
            
        return scraped_data
        
    except Exception as e:
        print(f"Error fetching {origin} to {destination}: {e}")
        return []

if __name__ == "__main__":
    from datetime import timedelta # Add this to your imports at the top
    
    # Expanded Route Matrix (Top Indian Trunk Routes)
    indian_routes = [
        ("DEL", "BOM"), ("BOM", "DEL"), # Delhi <-> Mumbai
        ("BLR", "DEL"), ("DEL", "BLR"), # Bangalore <-> Delhi
        ("BOM", "BLR"), ("BLR", "BOM"), # Mumbai <-> Bangalore
        ("CCU", "DEL"), ("DEL", "CCU"), # Kolkata <-> Delhi
        ("HYD", "BOM"), ("BOM", "HYD"), # Hyderabad <-> Mumbai
        ("DEL", "MAA"), ("MAA", "DEL"), # Delhi <-> Chennai
        ("DEL", "GOI"), ("BOM", "GOI")  # Leisure routes to Goa
    ]
    
    # Calculate dynamic lead-time buckets for CPI modeling
    today = datetime.now()
    target_dates = [
        (today + timedelta(days=1)).strftime("%Y-%m-%d"),  # Last minute (T+1)
        (today + timedelta(days=7)).strftime("%Y-%m-%d"),  # Next week (T+7)
        (today + timedelta(days=15)).strftime("%Y-%m-%d"), # Mid-range (T+15)
        (today + timedelta(days=30)).strftime("%Y-%m-%d")  # Standard advance (T+30)
    ]
    
    all_flight_data = []
    total_queries = len(indian_routes) * len(target_dates)
    current_query = 1

    print(f"Starting Multi-Dimensional Scrape... ({total_queries} total queries)")
    
    for route in indian_routes:
        origin, dest = route
        for t_date in target_dates:
            print(f"[{current_query}/{total_queries}] Scraping {origin}->{dest} for {t_date}...")
            
            # Call your existing function
            route_data = scrape_google_flights(origin, dest, t_date)
            all_flight_data.extend(route_data)
            
            current_query += 1
            time.sleep(1.5) # Crucial: Don't remove this or Google will block your IP

    df = pd.DataFrame(all_flight_data)
    print(f"\nSUCCESS! Scraped {len(df)} total flights.")
    
    if not df.empty:
        df.to_csv("google_flights_india_massive.csv", index=False)
        print("Data saved to google_flights_india_massive.csv")