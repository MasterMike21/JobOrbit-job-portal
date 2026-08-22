import React, { useEffect, useState, useMemo } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Country, State, City } from 'country-state-city'
import { Search, MapPin, X, CheckSquare, Square, RotateCcw } from 'lucide-react'

const allIndustries = [
    "Frontend Developer",
    "Backend Developer",
    "FullStack Developer",
    "Data Science & AI",
    "DevOps & Cloud Engineer",
    "Mobile App Developer (iOS/Android)",
    "UI/UX Designer",
    "Cybersecurity Analyst",
    "Product Manager",
    "QA / Test Automation"
];

const salaryRanges = [
    { label: "0 - 6 LPA", min: 0, max: 6 },
    { label: "6 - 12 LPA", min: 6, max: 12 },
    { label: "12 - 25 LPA", min: 12, max: 25 },
    { label: "25 - 50 LPA", min: 25, max: 50 },
    { label: "50+ LPA", min: 50, max: 999 }
];

const FilterCard = ({ selectedFilters, setSelectedFilters, onResetFilters }) => {
    const allCountries = useMemo(() => Country.getAllCountries(), []);
    
    // Typeable text inputs
    const [countryInput, setCountryInput] = useState("India");
    const [stateInput, setStateInput] = useState("");
    
    // Matched object references
    const [selectedCountryCode, setSelectedCountryCode] = useState("IN");
    const [selectedStateCode, setSelectedStateCode] = useState("");
    
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    // Filter search queries
    const [citySearch, setCitySearch] = useState("");
    const [industrySearch, setIndustrySearch] = useState("");

    // Synchronize country selection & populate states
    useEffect(() => {
        if (selectedCountryCode) {
            const states = State.getStatesOfCountry(selectedCountryCode);
            setStatesList(states);
            // Default to first state if available
            const firstState = states[0];
            if (firstState) {
                setStateInput(firstState.name);
                setSelectedStateCode(firstState.isoCode);
                setCitiesList(City.getCitiesOfState(selectedCountryCode, firstState.isoCode));
            } else {
                setStateInput("");
                setSelectedStateCode("");
                setCitiesList([]);
            }
        }
    }, [selectedCountryCode]);

    // Synchronize state selection & populate cities
    useEffect(() => {
        if (selectedCountryCode && selectedStateCode) {
            const cities = City.getCitiesOfState(selectedCountryCode, selectedStateCode);
            setCitiesList(cities);
        } else {
            setCitiesList([]);
        }
    }, [selectedCountryCode, selectedStateCode]);

    // Handle Country typing / selection
    const handleCountryChange = (e) => {
        const value = e.target.value;
        setCountryInput(value);
        const match = allCountries.find(
            c => c.name.toLowerCase() === value.trim().toLowerCase() || c.isoCode.toLowerCase() === value.trim().toLowerCase()
        );
        if (match) {
            setSelectedCountryCode(match.isoCode);
        }
    };

    // Handle State typing / selection
    const handleStateChange = (e) => {
        const value = e.target.value;
        setStateInput(value);
        const match = statesList.find(
            s => s.name.toLowerCase() === value.trim().toLowerCase() || s.isoCode.toLowerCase() === value.trim().toLowerCase()
        );
        if (match) {
            setSelectedStateCode(match.isoCode);
        }
    };

    // Toggle multi-select items
    const toggleItem = (category, item) => {
        setSelectedFilters(prev => {
            const currentList = prev[category];
            const exists = currentList.includes(item);
            return {
                ...prev,
                [category]: exists 
                    ? currentList.filter(i => i !== item) 
                    : [...currentList, item]
            };
        });
    };

    const toggleCity = (cityName) => {
        toggleItem("locations", cityName);
    };

    const totalApplied = selectedFilters.locations.length + selectedFilters.industries.length + selectedFilters.salaries.length;

    return (
        <div className='w-full bg-white dark:bg-[#111827] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg text-gray-900 dark:text-gray-100 transition-colors space-y-5'>
            
            {/* Header with Clear All */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                    <h1 className='font-bold text-base text-gray-900 dark:text-white'>Filter Jobs</h1>
                    {totalApplied > 0 && (
                        <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-bold">
                            {totalApplied}
                        </span>
                    )}
                </div>
                {totalApplied > 0 && (
                    <button 
                        onClick={onResetFilters}
                        className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                )}
            </div>

            {/* Selected Location Badges */}
            {selectedFilters.locations.length > 0 && (
                <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Active Locations</Label>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                        {selectedFilters.locations.map((loc, idx) => (
                            <span 
                                key={idx} 
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800/80 text-[11px] font-medium text-purple-700 dark:text-purple-300"
                            >
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                {loc}
                                <X 
                                    className="w-3 h-3 cursor-pointer hover:text-red-500 ml-0.5" 
                                    onClick={() => toggleCity(loc)}
                                />
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 1. DYNAMIC CASCADING TYPEABLE LOCATION SELECTOR --- */}
            <div className="space-y-2.5">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" /> Location Hierarchy
                </Label>

                {/* Country Typeable Input */}
                <div>
                    <Label className="text-[11px] text-gray-500 mb-0.5 block">1. Country (Type or Select)</Label>
                    <Input
                        list="filter-country-datalist"
                        value={countryInput}
                        onChange={handleCountryChange}
                        placeholder="Type country (e.g. India, United States)..."
                        className="h-8 text-xs bg-gray-50 dark:bg-[#1f2937] dark:border-gray-700"
                    />
                    <datalist id="filter-country-datalist">
                        {allCountries.map(c => (
                            <option key={c.isoCode} value={c.name} />
                        ))}
                    </datalist>
                </div>

                {/* State Typeable Input */}
                <div>
                    <Label className="text-[11px] text-gray-500 mb-0.5 block">2. State / Province (Type or Select)</Label>
                    <Input
                        list="filter-state-datalist"
                        value={stateInput}
                        onChange={handleStateChange}
                        disabled={statesList.length === 0}
                        placeholder="Type state (e.g. Punjab, Karnataka)..."
                        className="h-8 text-xs bg-gray-50 dark:bg-[#1f2937] dark:border-gray-700 disabled:opacity-50"
                    />
                    <datalist id="filter-state-datalist">
                        {statesList.map(s => (
                            <option key={s.isoCode} value={s.name} />
                        ))}
                    </datalist>
                </div>

                {/* 3. Cities Multi-Select Scroll Box */}
                <div>
                    <Label className="text-[11px] text-gray-500 mb-0.5 block">3. Select Cities</Label>
                    <div className="relative mb-1.5">
                        <Search className="absolute left-2 top-2 w-3 h-3 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search in this state..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            className="h-7 pl-7 text-[11px] bg-gray-50 dark:bg-[#1f2937] dark:border-gray-700"
                        />
                    </div>

                    <div className="h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-1.5 bg-gray-50/50 dark:bg-[#1f2937]/30 space-y-1">
                        {citiesList.length === 0 ? (
                            <p className="text-[11px] text-gray-400 p-2 text-center">No cities found for this state</p>
                        ) : (
                            citiesList
                                .filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))
                                .map((city, idx) => {
                                    const isSel = selectedFilters.locations.includes(city.name);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => toggleCity(city.name)}
                                            className={`flex items-center gap-2 p-1 rounded cursor-pointer text-xs transition-colors ${
                                                isSel ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {isSel ? (
                                                <CheckSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                            ) : (
                                                <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            )}
                                            <span className="truncate">{city.name}</span>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>

            {/* --- 2. INDUSTRY / ROLE FILTER --- */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                    Industry / Role
                </Label>
                <div className="relative mb-1">
                    <Search className="absolute left-2 top-2 w-3 h-3 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search roles..."
                        value={industrySearch}
                        onChange={(e) => setIndustrySearch(e.target.value)}
                        className="h-7 pl-7 text-[11px] bg-gray-50 dark:bg-[#1f2937] dark:border-gray-700"
                    />
                </div>
                <div className="h-28 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-1.5 bg-gray-50/50 dark:bg-[#1f2937]/30 space-y-1">
                    {allIndustries
                        .filter(role => role.toLowerCase().includes(industrySearch.toLowerCase()))
                        .map((role, idx) => {
                            const isSel = selectedFilters.industries.includes(role);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => toggleItem("industries", role)}
                                    className={`flex items-center gap-2 p-1 rounded cursor-pointer text-xs transition-colors ${
                                        isSel ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {isSel ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                    ) : (
                                        <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    )}
                                    <span className="truncate">{role}</span>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* --- 3. SALARY RANGES --- */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                    Salary (LPA)
                </Label>
                <div className="space-y-1.5">
                    {salaryRanges.map((sal, idx) => {
                        const isSel = selectedFilters.salaries.includes(sal.label);
                        return (
                            <div
                                key={idx}
                                onClick={() => toggleItem("salaries", sal.label)}
                                className={`flex items-center gap-2 p-1 rounded cursor-pointer text-xs transition-colors ${
                                    isSel ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                {isSel ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                ) : (
                                    <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                )}
                                <span>{sal.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    )
}

export default FilterCard;