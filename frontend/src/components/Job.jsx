import React from 'react'
import { Button } from './ui/button'
import { Bookmark } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const Job = ({ job }) => {
    const navigate = useNavigate();

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    return (
        <div className='p-5 rounded-2xl shadow-sm bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md'>
            <div className='flex items-center justify-between'>
                <p className='text-xs text-gray-500 font-medium'>
                    {daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                </p>
                <Button variant="outline" className="rounded-full h-8 w-8 p-0 border-gray-200 dark:border-gray-700" size="icon">
                    <Bookmark className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
            </div>

            <div className='flex items-center gap-3 my-3'>
                <Button className="p-1 border border-gray-200 dark:border-gray-700 bg-white" variant="outline" size="icon">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div>
                    <h1 className='font-bold text-base text-gray-900 dark:text-white'>{job?.company?.name}</h1>
                    <p className='text-xs text-gray-500'>{job?.location || "India"}</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-1 text-gray-900 dark:text-white'>{job?.title}</h1>
                <p className='text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed'>
                    {job?.description?.replace(/(\*\*.*?\*\*|[•\-\*])/g, '')}
                </p>
            </div>

            <div className='flex items-center gap-2 mt-4 flex-wrap'>
                <Badge className={'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 font-bold text-xs'}>
                    {job?.position && Number(job.position) > 0 ? `${job.position} Positions` : "Multiple Openings"}
                </Badge>
                <Badge className={'text-[#F83002] bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900 font-bold text-xs'}>
                    {job?.jobType}
                </Badge>
                <Badge className={'text-[#7209b7] bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 font-bold text-xs'}>
                    {job?.salary} LPA
                </Badge>
            </div>

            <div className='flex items-center gap-3 mt-4'>
                <Button onClick={() => navigate(`/description/${job?._id}`)} variant="outline" className="text-xs border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                    Details
                </Button>
                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white text-xs">
                    Save For Later
                </Button>
            </div>
        </div>
    )
}

export default Job