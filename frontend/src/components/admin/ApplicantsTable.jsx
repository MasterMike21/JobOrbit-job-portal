import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { Badge } from '../ui/badge';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);

    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    }

    return (
        <div>
            <Table>
                <TableCaption>A list of recent applicants and their full profiles</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Contact & Location</TableHead>
                        <TableHead>Education</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead>Links</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants && applicants?.applications?.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell>
                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{item?.fullName || item?.applicant?.fullname}</div>
                                    <div className="text-xs text-gray-500">{item?.email || item?.applicant?.email}</div>
                                    <div className="text-xs text-gray-400">Age: {item?.age || "N/A"}</div>
                                </TableCell>
                                <TableCell>
                                    <div>{item?.phoneNumber || item?.applicant?.phoneNumber}</div>
                                    <div className="text-xs text-gray-500">{item?.city ? `${item.city}, ${item.country}` : "N/A"}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-xs">{item?.qualification || "N/A"}</div>
                                    <div className="text-xs text-gray-500">{item?.college} ({item?.graduationYear})</div>
                                    <div className="text-xs text-purple-600 font-medium">CGPA: {item?.cgpa || "N/A"}</div>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                    <div className="flex flex-wrap gap-1">
                                        {item?.skills?.slice(0, 3).map((skill, i) => (
                                            <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5">{skill}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-xs">
                                        {item?.github && (
                                            <a href={item.github} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-0.5">
                                                GitHub <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        {item?.linkedin && (
                                            <a href={item.linkedin} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-0.5">
                                                LinkedIn <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {
                                        item?.applicant?.profile?.resume ? (
                                            <a 
                                                className="text-blue-600 hover:underline cursor-pointer text-xs" 
                                                href={item?.applicant?.profile?.resume} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                {item?.applicant?.profile?.resumeOriginalName || "View Resume"}
                                            </a>
                                        ) : <span className="text-xs text-gray-400">N/A</span>
                                    }
                                </TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <MoreHorizontal />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-32 dark:bg-[#111827] dark:border-gray-800">
                                            {
                                                shortlistingStatus.map((status, index) => (
                                                    <div 
                                                        onClick={() => statusHandler(status, item?._id)} 
                                                        key={index} 
                                                        className='flex items-center my-2 cursor-pointer hover:text-[#6A38C2]'
                                                    >
                                                        <span>{status}</span>
                                                    </div>
                                                ))
                                            }
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default ApplicantsTable;