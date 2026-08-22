import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='text-center'>
            <div className='flex flex-col gap-5 my-10'>
                <span className='mx-auto px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-[#F83002] dark:text-orange-400 font-medium'>
                    Launch Your Tech Career With JobOrbit
                </span>
                <h1 className='text-5xl font-bold text-gray-900 dark:text-white'>
                    Search, Apply & <br /> Get Your <span className='text-[#6A38C2] dark:text-[#9065e0]'>Dream Jobs</span>
                </h1>
                <p className='text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                    Discover thousands of curated software engineering, design, and product roles from top tech companies and startups worldwide.
                </p>
                <div className='flex w-[90%] sm:w-[50%] md:w-[40%] shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] pl-4 rounded-full items-center gap-4 mx-auto'>
                    <input
                        type="text"
                        placeholder='Find your dream jobs'
                        onChange={(e) => setQuery(e.target.value)}
                        className='outline-none border-none w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400'
                    />
                    <Button onClick={searchJobHandler} className="rounded-r-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white">
                        <Search className='h-5 w-5' />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default HeroSection;