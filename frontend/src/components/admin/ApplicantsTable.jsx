import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { MoreHorizontal, ExternalLink, FileText, Code2, CheckCircle2, XCircle, Send } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { Badge } from '../ui/badge';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [actionStatus, setActionStatus] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const openStatusDialog = (status, item) => {
        const candidateName = item?.fullName || item?.applicant?.fullname || "Candidate";
        setSelectedApplication(item);
        setActionStatus(status);

        // Populate with job-specific pre-configured template if available, else default template
        if (status === "Accepted") {
            const defaultAccepted = applicants?.acceptanceEmailTemplate || 
                `Dear ${candidateName},\n\nWe are pleased to inform you that your resume has cleared our screening and you have been shortlisted for the next rounds!\n\nSelection Process:\n1. Online Technical Assessment (OA) link will be dispatched shortly.\n2. Technical Interview round with engineering panel.\n3. Techno-Behavioral / HR discussion.\n\nPlease check your inbox regularly for slot booking details. Best of luck!`;
            
            setEmailMessage(defaultAccepted);
        } else {
            const defaultRejected = applicants?.rejectionEmailTemplate || 
                `Dear ${candidateName},\n\nThank you for taking the time to apply and sharing your academic background with us.\n\nWhile our team was impressed with your credentials, we will not be moving forward with your candidacy for this particular opening at this time due to high competition.\n\nWe encourage you to apply for upcoming campus drives on JobOrbit. We wish you the very best in your career!`;
            
            setEmailMessage(defaultRejected);
        }
        setModalOpen(true);
    };

    const submitStatusUpdate = async () => {
        if (!selectedApplication) return;
        try {
            setLoading(true);
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${selectedApplication._id}/update`, { 
                status: actionStatus,
                customMessage: emailMessage
            });
            if (res.data.success) {
                toast.success(res.data.message);
                setModalOpen(false);
                window.location.reload();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#111827] shadow-sm">
            <Table>
                <TableCaption className="py-4">A list of recent applicants and their full profiles</TableCaption>
                <TableHeader className="bg-gray-50 dark:bg-[#1f2937]/50">
                    <TableRow className="border-gray-200 dark:border-gray-800">
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Candidate</TableHead>
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Contact & Location</TableHead>
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Education & Scores</TableHead>
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Skills</TableHead>
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Links</TableHead>
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Resume</TableHead>
                        <TableHead className="font-bold text-xs text-gray-700 dark:text-gray-300">Status</TableHead>
                        <TableHead className="text-right font-bold text-xs text-gray-700 dark:text-gray-300">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applicants && applicants?.applications?.length > 0 ? (
                        applicants.applications.map((item) => {
                            const rawResume = item?.resumeUrl || item?.resumeLink || item?.applicant?.profile?.resume;
                            const resumeName = item?.resumeOriginalName || item?.applicant?.profile?.resumeOriginalName || "View Resume";

                            const finalResumeHref = rawResume && rawResume.startsWith("http") && !rawResume.includes("drive.google.com")
                                ? `https://docs.google.com/viewer?url=${encodeURIComponent(rawResume)}&embedded=false`
                                : rawResume;

                            return (
                                <TableRow key={item._id} className="border-gray-100 dark:border-gray-800/60 hover:bg-purple-50/20 dark:hover:bg-purple-950/10">
                                    {/* Candidate Info */}
                                    <TableCell>
                                        <div className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                                            {item?.fullName || item?.applicant?.fullname}
                                        </div>
                                        <div className="text-[11px] text-gray-500">
                                            {item?.email || item?.applicant?.email}
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            Age: {item?.age || "N/A"}
                                        </div>
                                    </TableCell>

                                    {/* Contact & Location */}
                                    <TableCell>
                                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                            {item?.phoneNumber || item?.applicant?.phoneNumber}
                                        </div>
                                        <div className="text-[11px] text-gray-500 truncate max-w-[150px]">
                                            {item?.city ? `${item.city}, ${item.country}` : "N/A"}
                                        </div>
                                    </TableCell>

                                    {/* Education & Scores */}
                                    <TableCell className="max-w-[220px]">
                                        <div className="font-semibold text-xs text-purple-700 dark:text-purple-300 truncate">
                                            {item?.degree || item?.qualification} {item?.branch ? `(${item.branch})` : ""}
                                        </div>
                                        <div className="text-[11px] text-gray-600 dark:text-gray-400 truncate" title={item?.collegeName || item?.college}>
                                            {item?.collegeName || item?.college || "University"} {item?.graduationYear ? `• ${item.graduationYear}` : ""}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                                CGPA: {item?.cgpa || "N/A"}
                                            </span>
                                            {(item?.tenthPercentage > 0 || item?.twelfthPercentage > 0) && (
                                                <span className="text-[10px] text-gray-500">
                                                    (10th: {item?.tenthPercentage}% | 12th: {item?.twelfthPercentage}%)
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Skills */}
                                    <TableCell className="max-w-[180px]">
                                        <div className="flex flex-wrap gap-1">
                                            {item?.skills && item.skills.length > 0 ? (
                                                item.skills.slice(0, 3).map((skill, i) => (
                                                    <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                                        {skill}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-[11px] text-gray-400">No skills listed</span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Profiles / Links */}
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                            {item?.leetcode && (
                                                <a 
                                                    href={item.leetcode} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="px-1.5 py-0.5 rounded text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:underline flex items-center gap-0.5"
                                                >
                                                    <Code2 className="w-3 h-3" /> LeetCode
                                                </a>
                                            )}
                                            {(item?.github || item?.applicant?.profile?.github) && (
                                                <a 
                                                    href={item?.github || item?.applicant?.profile?.github} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="px-1.5 py-0.5 rounded text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:underline flex items-center gap-0.5"
                                                >
                                                    GitHub <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            )}
                                            {(item?.linkedin || item?.applicant?.profile?.linkedin) && (
                                                <a 
                                                    href={item?.linkedin || item?.applicant?.profile?.linkedin} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="px-1.5 py-0.5 rounded text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:underline flex items-center gap-0.5"
                                                >
                                                    LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Resume Column */}
                                    <TableCell>
                                        {rawResume ? (
                                            <a 
                                                className="text-[#6A38C2] dark:text-purple-400 font-semibold hover:underline text-xs inline-flex items-center gap-1" 
                                                href={finalResumeHref} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                <span className="truncate max-w-[120px]">{resumeName}</span>
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">N/A</span>
                                        )}
                                    </TableCell>

                                    {/* Status Column */}
                                    <TableCell>
                                        <Badge className={`text-xs font-semibold ${
                                            item?.status === 'accepted' 
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                                                : item?.status === 'rejected' 
                                                    ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800' 
                                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                        }`}>
                                            {item?.status ? item.status.toUpperCase() : "PENDING"}
                                        </Badge>
                                    </TableCell>

                                    {/* Action Column */}
                                    <TableCell className="text-right cursor-pointer">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-40 p-1.5 bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 shadow-xl">
                                                {shortlistingStatus.map((status, index) => (
                                                    <div 
                                                        onClick={() => openStatusDialog(status, item)} 
                                                        key={index} 
                                                        className={`flex items-center gap-2 p-2 text-xs rounded cursor-pointer transition-colors ${
                                                            status === 'Accepted' 
                                                                ? 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                                                                : 'hover:bg-red-50 dark:hover:bg-red-950/40 text-red-700 dark:text-red-300'
                                                        }`}
                                                    >
                                                        {status === 'Accepted' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                        <span>{status === 'Accepted' ? 'Accept & Email' : 'Reject & Email'}</span>
                                                    </div>
                                                ))}
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500 text-xs">
                                No applicants found for this recruitment opening yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Recruiter Custom Email Dialog */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-lg bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            {actionStatus === "Accepted" ? <CheckCircle2 className="text-emerald-500 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
                            Send {actionStatus} Email to {selectedApplication?.fullName || selectedApplication?.applicant?.fullname}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 my-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Review and customize the exact email copy dispatched to <strong>{selectedApplication?.email || selectedApplication?.applicant?.email}</strong>:
                        </p>
                        <Textarea 
                            rows={8} 
                            value={emailMessage} 
                            onChange={(e) => setEmailMessage(e.target.value)} 
                            className="text-xs leading-relaxed bg-gray-50 dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 focus-visible:ring-purple-500 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setModalOpen(false)} disabled={loading} className="text-xs">
                            Cancel
                        </Button>
                        <Button 
                            onClick={submitStatusUpdate} 
                            disabled={loading} 
                            className={`text-xs text-white flex items-center gap-1.5 ${actionStatus === 'Accepted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            <Send className="w-3.5 h-3.5" />
                            {loading ? "Sending..." : `Confirm & Send Email`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ApplicantsTable;