import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen, FileText } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);

    const resumeLink = user?.profile?.resume;
    const resumeName = user?.profile?.resumeOriginalName || "View Resume";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                
                {/* Profile Overview Card */}
                <div className='bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm'>
                    <div className='flex justify-between items-start'>
                        <div className='flex items-center gap-4 flex-wrap sm:flex-nowrap'>
                            <Avatar className="h-24 w-24 border border-gray-200 dark:border-gray-700 bg-white">
                                <AvatarImage 
                                    src={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"} 
                                    alt={user?.fullname || "Profile"} 
                                />
                                <AvatarFallback className="bg-purple-100 text-[#6A38C2] font-bold text-xl">
                                    {user?.fullname?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className='font-bold text-2xl text-gray-900 dark:text-white'>
                                    {user?.fullname || "Candidate Profile"}
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {user?.profile?.bio || "No bio added yet."}
                                </p>
                            </div>
                        </div>

                        <Button 
                            onClick={() => setOpen(true)} 
                            variant="outline" 
                            size="icon"
                            className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Pen className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Contact Details */}
                    <div className='my-6 space-y-3 border-t border-gray-100 dark:border-gray-800/80 pt-4'>
                        <div className='flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300'>
                            <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>{user?.email || "Not Provided"}</span>
                        </div>
                        <div className='flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300'>
                            <Contact className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span>{user?.phoneNumber || "Not Provided"}</span>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className='my-6 border-t border-gray-100 dark:border-gray-800/80 pt-4 space-y-2'>
                        <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Technical Skills</h2>
                        <div className='flex items-center gap-1.5 flex-wrap pt-1'>
                            {
                                user?.profile?.skills && user?.profile?.skills?.length > 0 ? (
                                    user?.profile?.skills?.map((item, index) => (
                                        <Badge 
                                            key={index} 
                                            className="bg-gray-100 dark:bg-[#1f2937] text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 text-xs px-2.5 py-0.5"
                                        >
                                            {item}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-500">No skills listed yet</span>
                                )
                            }
                        </div>
                    </div>

                    {/* Resume */}
                    <div className='border-t border-gray-100 dark:border-gray-800/80 pt-4 space-y-1.5'>
                        <Label className="text-sm font-semibold text-gray-900 dark:text-white">Uploaded Resume</Label>
                        <div>
                            {
                                resumeLink ? (
                                    <a 
                                        target='_blank' 
                                        rel="noopener noreferrer" 
                                        href={
                                            resumeLink.startsWith("http") && !resumeLink.includes("drive.google.com")
                                                ? `https://docs.google.com/viewer?url=${encodeURIComponent(resumeLink)}&embedded=false`
                                                : resumeLink
                                        } 
                                        className='text-[#6A38C2] dark:text-purple-400 font-medium text-xs hover:underline inline-flex items-center gap-1.5'
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>{resumeName}</span>
                                    </a>
                                ) : (
                                    <span className="text-xs text-gray-400">No resume uploaded</span>
                                )
                            }
                        </div>
                    </div>
                </div>

                {/* Applied Jobs Table Section */}
                <div className='bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4'>
                    <h2 className='font-bold text-xl text-gray-900 dark:text-white'>Applied Campus Drives</h2>
                    <AppliedJobTable />
                </div>

            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    );
};

export default Profile;