import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);


// Paste this OUTSIDE and ABOVE the Graph component
const verticalLinePlugin = {
    id: 'verticalLinePlugin',
    afterDraw: (chart) => {
        // Find the element your mouse is hovering over
        const activeElements = chart.getActiveElements();

        if (activeElements.length > 0) {
            const x = activeElements[0].element.x;
            const yAxis = chart.scales.y;
            const ctx = chart.ctx;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#94a3b8'; // Solid slate gray
            ctx.setLineDash([5, 5]); // Dotted line effect
            ctx.stroke();
            ctx.restore();
        }
    }
};









const Graph = ({ data }) => {
    const [duration, setDuration] = useState('1M');
    const durations = ['1W', '2W', '3W', '1M', '2M', '1Y'];

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full w-full text-gray-500 font-medium min-h-[400px]">
                Waiting for data... Select options and click Scrape Live!
            </div>
        );
    }

    // --- FILTERING LOGIC ---
    // Map the dropdown text to an actual number of days
    const durationMap = {
        '1W': 7,
        '2W': 14,
        '3W': 21,
        '1M': 30,
        '2M': 60,
        '1Y': 365
    };
    const daysToShow = durationMap[duration];

    // Slice the massive backend array to only show the requested number of days
    const displayPrices = data.prices.slice(0, daysToShow);
    const displayDates = data.dates.slice(0, daysToShow);

    // Calculate stats based ONLY on the currently displayed data
    const lowest = Math.min(...displayPrices);
    const peak = Math.max(...displayPrices);
    const average = Math.round(displayPrices.reduce((a, b) => a + b, 0) / displayPrices.length);
    const isDropping = displayPrices[displayPrices.length - 1] <= displayPrices[0];

    const chartData = {
        labels: displayDates,
        datasets: [
            {
                label: 'Flight Price (₹)',
                data: displayPrices,
                borderColor: '#0ea5e9',
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0ea5e9',
                pointHoverBackgroundColor: '#0ea5e9',
                pointHoverBorderColor: '#fff',
                pointRadius: displayPrices.length > 60 ? 0 : 4, // Hide dots if showing 1 year so it doesn't get cluttered
                pointHoverRadius: 6,
                tension: 0.1
            }
        ]
    };







    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        // ADD THIS BLOCK right here:
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: (context) => `₹${context.raw}`
                }
            },
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                ticks: { padding: 10, color: '#94a3b8' }
            },
            x: {
                grid: { display: false },
                ticks: { padding: 10, color: '#94a3b8', maxTicksLimit: 10 } // Limits X-axis labels so they don't overlap
            }
        }
    };

    return (
        <div className="w-full h-full p-6 bg-white rounded-xl">
            {/* TOP HEADER ROW */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-black">Price Trend</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        {data.origin} → {data.destination}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="px-3 py-1.5 pr-8 text-sm font-semibold rounded-md border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                            {durations.map((dur) => (
                                <option key={dur} value={dur}>{dur}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    <div className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 ${isDropping ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {isDropping ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" /></svg>
                        )}
                        {isDropping ? 'Prices Dropping' : 'Prices Rising'}
                    </div>
                </div>
            </div>

            {/* STATS CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Lowest Scraped</p>
                    <p className="text-xl font-bold text-green-600">₹{lowest}</p>
                </div>
                <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Average Fare</p>
                    <p className="text-xl font-bold text-gray-900">₹{average}</p>
                </div>
                <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Peak Fare</p>
                    <p className="text-xl font-bold text-gray-900">₹{peak}</p>
                </div>
            </div>

            {/* CHART AREA */}
            <div className="w-full h-[220px] relative">
                <Line
                    data={chartData}
                    options={chartOptions}
                    plugins={[verticalLinePlugin]}
                />
            </div>

        </div>
    );
}

export default Graph;