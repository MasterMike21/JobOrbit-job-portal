import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'
import { Building2, Calendar, MapPin } from 'lucide-react'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#111827] shadow-sm">
            <Table>
                <TableCaption className="py-4">A record of your applied campus drives & status tracking.</TableCaption>
                <TableHeader className="bg-gray-50 dark:bg-[#1f2937]/50">
                    <TableRow className="border-gray-200 dark:border-gray-800">
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Date</TableHead>
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Role & Company</TableHead>
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Locations</TableHead>
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Package</TableHead>
                        <TableHead className="text-right font-bold text-xs text-gray-700 dark:text-gray-300">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allAppliedJobs && allAppliedJobs.length > 0 ? (
                        allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id} className="border-gray-100 dark:border-gray-800/60 hover:bg-purple-50/20 dark:hover:bg-purple-950/10">
                                <TableCell className="text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        {appliedJob?.createdAt?.split("T")[0]}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2.5">
                                        {appliedJob?.job?.company?.logo ? (
                                            <img src={appliedJob.job.company.logo} alt="Logo" className="w-7 h-7 rounded object-contain border p-0.5 bg-white" />
                                        ) : (
                                            <Building2 className="w-6 h-6 text-purple-600 p-1 bg-purple-50 dark:bg-purple-950/40 rounded" />
                                        )}
                                        <div>
                                            <p className="font-bold text-xs text-gray-900 dark:text-white">{appliedJob?.job?.title}</p>
                                            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">{appliedJob?.job?.company?.name}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-gray-600 dark:text-gray-400 max-w-[180px] truncate">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                        <span className="truncate">{appliedJob?.job?.location}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                    {appliedJob?.job?.salary} LPA
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge className={`text-xs font-semibold ${
                                        appliedJob?.status === "rejected" 
                                            ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800' 
                                            : appliedJob?.status === 'accepted' 
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                    }`}>
                                        {appliedJob?.status ? appliedJob.status.toUpperCase() : "PENDING"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                You have not applied to any job drives yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default AppliedJobTable;