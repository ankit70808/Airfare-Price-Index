import React, { useState } from 'react';

// 1. Add { onScrapeClick } inside the parentheses
const SPane = ({ onScrapeClick, setLastScraped }) => {
    // State to hold the currently selected values
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [window, setWindow] = useState('');
    const [isScraping, setIsScraping] = useState(false);

    // Top 10 airports data
    const airports = [
        { code: 'DEL', name: 'New Delhi' },
        { code: 'BOM', name: 'Mumbai' },
        { code: 'BLR', name: 'Bengaluru' },
        { code: 'HYD', name: 'Hyderabad' },
        { code: 'CCU', name: 'Kolkata' },
        { code: 'MAA', name: 'Chennai' },
        { code: 'AMD', name: 'Ahmedabad' },
        { code: 'COK', name: 'Kochi' },
        { code: 'PNQ', name: 'Pune' },
        { code: 'GOI', name: 'Goa' }
    ];

    // Time windows data
    const windows = [
        'T+1 (1 Day)',
        'T+7 (7 Days)',
        'T+15 (15 Days)',
        'T+30 (30 Days)',
        'T+45 (45 Days)'
    ];

    // Function to swap origin and destination
    const handleSwap = () => {
        const temp = origin;
        setOrigin(destination);
        setDestination(temp);
    };

    // State to trigger the flying animation
    // const [isScraping, setIsScraping] = useState(false);

    // 2. Replace your existing handleScrape with this
    const handleScrape = () => {
    setIsScraping(true);

    if (setLastScraped) {
        setLastScraped(new Date()); // Updates the timestamp state back in App
    }

    if (onScrapeClick) {
        onScrapeClick({ origin, destination, window });
    }
    setTimeout(() => setIsScraping(false), 1000);
};


    return (
        <div className="flex w-full items-end justify-between gap-4 font-sans">

            {/* 1. Origin Airport Dropdown */}
            <div className="flex flex-col flex-1 min-w-0">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Origin Airport
                </label>
                <div className="relative">
                    <select
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        // Added pr-10 for arrow space, and truncate to prevent text overflow
                        className="w-full border border-gray-300 rounded-2xl py-2 pl-3 pr-10 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer truncate"
                    >
                        <option value="" disabled>Select Origin</option>
                        {airports.map(airport => (
                            <option key={`orig-${airport.code}`} value={airport.code}>
                                {airport.code} ({airport.name})
                            </option>
                        ))}
                    </select>
                    {/* Custom Dropdown Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            {/* Swap Icon Fixed: Replaced with a proper horizontal Left/Right arrow */}
            <div className="flex items-center justify-center pb-[2px] shrink-0">
                <button
                    onClick={handleSwap}
                    className="border border-gray-300 rounded-md p-2 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m16 3 4 4-4 4" />
                        <path d="M20 7H4" />
                        <path d="m8 21-4-4 4-4" />
                        <path d="M4 17h16" />
                    </svg>
                </button>
            </div>

            {/* 2. Destination Airport Dropdown */}
            <div className="flex flex-col flex-1 min-w-0">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Destination Airport
                </label>
                <div className="relative">
                    <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full border border-gray-300 rounded-2xl py-2 pl-3 pr-10 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer truncate"
                    >
                        <option value="" disabled>Select Destination</option>
                        {airports.map(airport => (
                            <option key={`dest-${airport.code}`} value={airport.code}>
                                {airport.code} ({airport.name})
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            {/* 3. Window Dropdown */}
            <div className="flex flex-col flex-1 min-w-0">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                    Window
                </label>
                <div className="relative">
                    <select
                        value={window}
                        onChange={(e) => setWindow(e.target.value)}
                        className="w-full border border-gray-300 rounded-2xl py-2 pl-3 pr-10 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer truncate"
                    >
                        <option value="" disabled>Select Window</option>
                        {windows.map(win => (
                            <option key={win} value={win}>{win}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            {/* 4. Scrape Live Button */}
            <div className="flex items-end pb-[2px] shrink-0">
                <button
                    onClick={handleScrape}

                    className="group relative bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-3xl px-6 py-2 text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm h-[38px] overflow-hidden"
                >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                        {/* Removed -translate-y-[30px] so it only travels straight right along the X axis */}
                        {/* Changed scale-50 to scale-150 so it grows while flying */}
                        <div
                            className={`absolute flex transition-all duration-700 ease-in-out ${isScraping ? 'translate-x-[60px] opacity-0 scale-150' : 'translate-x-0 opacity-100 scale-100'
                                }`}
                        >
                            {/* Search Icon */}
                            <svg className="group-hover:hidden transition-opacity duration-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                            </svg>

                            {/* Airplane Icon (Hidden by default, visible on group hover) */}
                            <svg className="hidden group-hover:block transition-opacity duration-300" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22 12A2 2 0 0 0 20 10H14L10 4H7L9 10H4L2 8H1L2 12L1 16H2L4 14H9L7 20H10L14 14H20A2 2 0 0 0 22 12Z" />
                            </svg>
                        </div>
                    </div>

                    <span className="relative z-10">Scrape Live</span>
                </button>
            </div>

        </div>
    );
}

export default SPane;