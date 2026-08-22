import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux'; 

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);
   
    return (
        <div className='max-w-7xl mx-auto my-20 px-4'>
            <h1 className='text-4xl font-bold text-gray-900 dark:text-white'>
                <span className='text-[#6A38C2] dark:text-[#9065e0]'>Latest & Top </span> Job Openings
            </h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6'>
                {
                    !allJobs || allJobs.length <= 0 ? (
                        <span className='text-gray-500 dark:text-gray-400'>No Jobs Available</span>
                    ) : (
                        allJobs.slice(0, 6).map((job) => <LatestJobCards key={job._id} job={job} />)
                    )
                }
            </div>
        </div>
    )
}

export default LatestJobs;