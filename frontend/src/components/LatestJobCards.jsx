import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    
    return (
        <div 
            onClick={() => navigate(`/description/${job?._id}`)} 
            className='p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm hover:shadow-md cursor-pointer transition-all duration-200'
        >
            <div className='flex items-center gap-3 mb-3'>
                <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={job?.company?.logo} alt={job?.company?.name} />
                    <AvatarFallback className="font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        {job?.company?.name?.charAt(0)?.toUpperCase() || "C"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className='font-semibold text-lg text-gray-900 dark:text-gray-100'>{job?.company?.name}</h1>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>{job?.location || "India"}</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg text-gray-900 dark:text-gray-50 my-1'>{job?.title}</h1>
                <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>{job?.description}</p>
            </div>

            <div className='flex items-center gap-2 mt-4 flex-wrap'>
                <Badge className='text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold' variant="ghost">
                    {job?.position} Positions
                </Badge>
                <Badge className='text-[#F83002] dark:text-orange-400 bg-red-50 dark:bg-red-950/60 font-semibold' variant="ghost">
                    {job?.jobType}
                </Badge>
                <Badge className='text-[#7209b7] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 font-semibold' variant="ghost">
                    {job?.salary} LPA
                </Badge>
            </div>
        </div>
    )
}

export default LatestJobCards;