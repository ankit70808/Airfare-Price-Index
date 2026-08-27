import React from 'react';

const CpiBox = ({ data }) => {
    if (!data) {
        return (
            <div className="w-full p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="mb-1">
                    <h3 className="text-xl font-bold text-black">CPI Metrics</h3>
                    <p className="text-xs text-gray-500 mt-1">(Cost Performance Index)</p>
                </div>
                <div className="flex items-center justify-center p-8 bg-gray-50/50 rounded-lg border border-gray-100 min-h-[150px]">
                    <p className="text-gray-400 font-medium text-sm">Waiting for data... Click Scrape Live!</p>
                </div>
            </div>
        );
    }

    const prices = data.prices;

    // --- CORRECTED CALCULATIONS ---
    
    // 1. Monthly Avg (Most recent 30 days, e.g., indices 0 to 30)
    const monthlyPrices = prices.slice(0, 30);
    const monthlyAvg = Math.round(monthlyPrices.reduce((a, b) => a + b, 0) / monthlyPrices.length);

    // 2. Month-on-Month Change (Compare most recent 30 days to the 30 days before that)
    const currentMonthPrices = prices.slice(0, 30);
    const prevMonthPrices = prices.slice(30, 60);
    
    let momChange = 0;
    if (prevMonthPrices.length > 0) {
        const currentAvg = currentMonthPrices.reduce((a, b) => a + b, 0) / currentMonthPrices.length;
        const prevAvg = prevMonthPrices.reduce((a, b) => a + b, 0) / prevMonthPrices.length;
        momChange = Math.round(((currentAvg - prevAvg) / prevAvg) * 100);
    }

    // 3. Yearly Avg
    const yearlyPrices = prices.slice(0, 365);
    const yearlyAvg = Math.round(yearlyPrices.reduce((a, b) => a + b, 0) / yearlyPrices.length);

    // 4. Year-on-Year Change (Check if we actually have data from a year ago i.e., index 365+)
    let yoyChangeText = "N/A";
    let isYoYNegative = false;
    
    if (prices.length >= 365) {
        const lastYearPrices = prices.slice(335, 365); // roughly 1 year ago block
        const oldAvg = lastYearPrices.reduce((a, b) => a + b, 0) / lastYearPrices.length;
        const currentYearAvg = yearlyPrices.reduce((a, b) => a + b, 0) / yearlyPrices.length;
        const yoyVal = Math.round(((currentYearAvg - oldAvg) / oldAvg) * 100);
        yoyChangeText = yoyVal <= 0 ? `${yoyVal}%` : `+${yoyVal}%`;
        isYoYNegative = yoyVal <= 0;
    }

    return (
        <div className="w-full p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="mb-5">
                <h3 className="text-xl font-bold text-black">CPI Metrics</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                    Cost Performance Index • {data.origin} → {data.destination}
                </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Box 1: Monthly Avg */}
                <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Monthly Avg</p>
                    <p className="text-xl font-bold text-gray-900">₹{monthlyAvg}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Past 30 days average</p>
                </div>

                {/* Box 2: Month on Month Change (Lower price = Green, Higher price = Red) */}
                <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Month-on-Month</p>
                    <p className={`text-xl font-bold ${momChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {momChange <= 0 ? `${momChange}%` : `+${momChange}%`}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">vs previous month</p>
                </div>

                {/* Box 3: Yearly Avg */}
                <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Yearly Avg</p>
                    <p className="text-xl font-bold text-gray-900">₹{yearlyAvg}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Trailing 12 months</p>
                </div>

                {/* Box 4: Year on Year Change (Shows N/A if data isn't long enough) */}
                <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Year-on-Year Change</p>
                    <p className={`text-sm font-bold ${yoyChangeText === 'N/A' ? 'text-gray-400' : isYoYNegative ? 'text-green-600' : 'text-red-600'}`}>
                        {/* {yoyChangeText} */}
                        N/A yet
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">Compared to last year</p>
                </div>

            </div>
        </div>
    );
};

export default CpiBox;