import React, { useEffect, useState, useMemo } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Briefcase } from 'lucide-react'

const salaryRangeMap = {
    "0 - 6 LPA": { min: 0, max: 6 },
    "6 - 12 LPA": { min: 6, max: 12 },
    "12 - 25 LPA": { min: 12, max: 25 },
    "25 - 50 LPA": { min: 25, max: 50 },
    "50+ LPA": { min: 50, max: 999 }
};

const Jobs = () => {
    const { allJobs, searchedQuery } = useSelector(store => store.job);

    const initialFilterState = {
        locations: [],
        industries: [],
        salaries: []
    };

    const [selectedFilters, setSelectedFilters] = useState(initialFilterState);

    const resetFiltersHandler = () => {
        setSelectedFilters(initialFilterState);
    };

    // Filter computation
    const filteredJobs = useMemo(() => {
        return allJobs.filter((job) => {
            // 1. Search Bar Query match
            if (searchedQuery) {
                const q = searchedQuery.toLowerCase();
                const matchesSearch = 
                    job.title?.toLowerCase().includes(q) ||
                    job.description?.toLowerCase().includes(q) ||
                    job.location?.toLowerCase().includes(q) ||
                    job.company?.name?.toLowerCase().includes(q);
                if (!matchesSearch) return false;
            }

            // 2. Multi-City Location Filter match
            if (selectedFilters.locations.length > 0) {
                const jobLocationLower = (job.location || "").toLowerCase();
                const matchesAnyLocation = selectedFilters.locations.some(loc =>
                    jobLocationLower.includes(loc.toLowerCase())
                );
                if (!matchesAnyLocation) return false;
            }

            // 3. Industry / Role Filter match
            if (selectedFilters.industries.length > 0) {
                const jobTitleLower = (job.title || "").toLowerCase();
                const jobReqsLower = (job.requirements || []).join(" ").toLowerCase();
                const matchesIndustry = selectedFilters.industries.some(ind => {
                    const indKeywords = ind.toLowerCase().split(" ");
                    return indKeywords.some(kw => jobTitleLower.includes(kw) || jobReqsLower.includes(kw));
                });
                if (!matchesIndustry) return false;
            }

            // 4. Salary Filter match
            if (selectedFilters.salaries.length > 0) {
                const jobSalary = Number(job.salary) || 0;
                const matchesSalary = selectedFilters.salaries.some(rangeLabel => {
                    const range = salaryRangeMap[rangeLabel];
                    return range && jobSalary >= range.min && jobSalary <= range.max;
                });
                if (!matchesSalary) return false;
            }

            return true;
        });
    }, [allJobs, searchedQuery, selectedFilters]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <div className='max-w-7xl mx-auto my-8 px-4'>
                <div className='flex flex-col md:flex-row gap-6'>
                    
                    {/* Left Sidebar Filter (Width preserved) */}
                    <div className='w-full md:w-[280px] shrink-0'>
                        <FilterCard 
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                            onResetFilters={resetFiltersHandler}
                        />
                    </div>

                    {/* Main Job Feed */}
                    <div className='flex-1'>
                        {filteredJobs.length <= 0 ? (
                            <div className='flex flex-col items-center justify-center p-14 bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 text-center shadow-sm'>
                                <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-full mb-3">
                                    <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">No Jobs Available</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                                    No active jobs match your selected location and criteria filters.
                                </p>
                            </div>
                        ) : (
                            <div className='h-[85vh] overflow-y-auto pb-6 pr-2'>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {filteredJobs.map((job) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -15 }}
                                            transition={{ duration: 0.2 }}
                                            key={job?._id}
                                        >
                                            <Job job={job} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Jobs;