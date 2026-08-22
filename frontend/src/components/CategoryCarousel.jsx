import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer",
    "Cybersecurity",
    "DevOps Engineer",
    "Mobile Developer"
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    };

    return (
        <div className="w-full flex justify-center">
            <Carousel className="w-full max-w-xl mx-auto my-10">
                <CarouselContent className="items-center">
                    {category.map((cat, index) => (
                        <CarouselItem key={index} className="basis-1/2 md:basis-1/3 flex justify-center">
                            <button 
                                type="button"
                                onClick={() => searchJobHandler(cat)} 
                                className="rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-200 hover:bg-[#6A38C2] hover:text-white dark:hover:bg-[#6A38C2] dark:hover:text-white font-medium text-xs px-4 py-2 shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                            >
                                {cat}
                            </button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-200 hover:bg-[#6A38C2] hover:text-white dark:hover:bg-[#6A38C2] dark:hover:text-white" />
                <CarouselNext className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-gray-800 dark:text-gray-200 hover:bg-[#6A38C2] hover:text-white dark:hover:bg-[#6A38C2] dark:hover:text-white" />
            </Carousel>
        </div>
    );
};

export default CategoryCarousel;