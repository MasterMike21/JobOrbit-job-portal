import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    useEffect(() => {
        const filteredJobs = allAdminJobs.length >= 0 && allAdminJobs.filter((job) => {
            if (!searchJobByText) {
                return true;
            }
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || 
                   job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase());
        });
        setFilterJobs(filteredJobs);
    }, [allAdminJobs, searchJobByText]);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#111827] shadow-sm">
            <Table>
                <TableCaption className="py-4 text-gray-500 dark:text-gray-400">
                    A list of your posted campus recruitment openings
                </TableCaption>
                <TableHeader className="bg-gray-50 dark:bg-[#1f2937]/50">
                    <TableRow className="border-gray-200 dark:border-gray-800">
                        <TableHead className="text-gray-700 dark:text-gray-300 font-bold text-xs">Company Name</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300 font-bold text-xs">Role Title</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300 font-bold text-xs">Date Posted</TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300 font-bold text-xs">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterJobs?.length > 0 ? (
                        filterJobs.map((job) => (
                            <TableRow key={job._id} className="border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                <TableCell className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                                    {job?.company?.name || "N/A"}
                                </TableCell>
                                <TableCell className="text-xs text-gray-700 dark:text-gray-300">
                                    {job?.title}
                                </TableCell>
                                <TableCell className="text-xs text-gray-500">
                                    {job?.createdAt?.split("T")[0]}
                                </TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-36 p-1.5 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xl">
                                            {/* Distinct Route 1: Edit Job */}
                                            <div 
                                                onClick={() => navigate(`/admin/jobs/${job._id}/edit`)} 
                                                className="flex items-center gap-2 p-2 text-xs rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                                <span>Edit Job</span>
                                            </div>

                                            {/* Distinct Route 2: View Applicants */}
                                            <div 
                                                onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} 
                                                className="flex items-center gap-2 p-2 text-xs rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-[#6A38C2]" />
                                                <span>Applicants</span>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500 text-xs">
                                No jobs posted yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable