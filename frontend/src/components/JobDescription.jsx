import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { 
    ArrowLeft, 
    ArrowRight, 
    CheckCircle2, 
    Loader2, 
    AlertCircle, 
    Briefcase, 
    MapPin, 
    DollarSign, 
    Calendar, 
    Users, 
    GraduationCap, 
    Building2, 
    Code2, 
    BookOpen, 
    Layers 
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant'
import { setSingleJob } from '@/redux/jobSlice'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Country, State, City } from 'country-state-city'
import { indianQualifications, indianColleges, educationBoards } from '@/utils/indiaEducationData'

// Selective Markdown formatter: only bolds **words** or section headings
const FormattedText = ({ text }) => {
    if (!text) return null;

    const normalizedText = text.replace(/(\d+\.\s+)/g, '\n$1');
    const lines = normalizedText.split(/\r?\n/).filter(line => line.trim().length > 0);

    const parseLineMarkup = (str) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={index} className="font-bold text-gray-900 dark:text-white">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return <span key={index} className="font-normal text-gray-700 dark:text-gray-300">{part}</span>;
        });
    };

    return (
        <div className="space-y-2.5 text-sm leading-relaxed">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                const isNumbered = /^\d+[\.\)]\s/.test(trimmed);
                const isBullet = /^[•\-\*]\s/.test(trimmed);

                if (/^[A-Za-z\s]+:(\s*-)?$/.test(trimmed) || /^(Responsibilities|Requirements|Eligibility|Overview):/i.test(trimmed)) {
                    return (
                        <p key={idx} className="font-bold text-gray-900 dark:text-white pt-2 text-sm">
                            {trimmed}
                        </p>
                    );
                }

                if (isNumbered || isBullet) {
                    const cleanText = trimmed.replace(/^(\d+[\.\)]|[•\-\*])\s*/, '');
                    return (
                        <div key={idx} className="flex items-start gap-2.5 ml-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6A38C2] mt-2 shrink-0" />
                            <div className="flex-1">{parseLineMarkup(cleanText)}</div>
                        </div>
                    );
                }

                return (
                    <p key={idx} className="text-gray-700 dark:text-gray-300 font-normal">
                        {parseLineMarkup(trimmed)}
                    </p>
                );
            })}
        </div>
    );
};

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isInitiallyApplied = singleJob?.applications?.some(app => 
        (typeof app === 'object' ? app.applicant === user?._id : app === user?._id)
    ) || false;

    const [isApplied, setIsApplied] = useState(isInitiallyApplied);
    const [openApplyModal, setOpenApplyModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");

    // Files state
    const [resumeFile, setResumeFile] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    // Location state for modal
    const allCountries = Country.getAllCountries();
    const [selectedCountryCode, setSelectedCountryCode] = useState("IN");
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    const [formData, setFormData] = useState({
        // Step 1: Personal Details
        fullName: "",
        email: "",
        phoneNumber: "",
        age: "",
        country: "India",
        state: "Punjab",
        city: "Chandigarh",

        // Step 2: Academic Hierarchy
        qualification: "Bachelors (4 Years)",
        degree: "B.E. (Bachelor of Engineering)",
        branch: "Information Technology",
        graduationYear: 2026,
        cgpa: "",
        skills: "",

        // Step 3: Schooling & College
        tenthSchool: "",
        tenthBoard: "CBSE (Central Board of Secondary Education)",
        tenthPercentage: "",
        twelfthSchool: "",
        twelfthBoard: "CBSE (Central Board of Secondary Education)",
        twelfthPercentage: "",
        collegeCountry: "India",
        collegeName: "University Institute of Engineering and Technology (UIET), Panjab University, Chandigarh",

        // Step 4: Profiles & Resume
        leetcode: "",
        github: "",
        linkedin: "",
        portfolio: "",
        resumeLink: "",
        expectedSalary: 0,
        noticePeriod: "Immediate",
        willingToRelocate: "Yes"
    });

    useEffect(() => {
        const states = State.getStatesOfCountry("IN");
        setStatesList(states);
        const punjabState = states.find(s => s.name.includes("Punjab") || s.name.includes("Chandigarh")) || states[0];
        if (punjabState) {
            const cities = City.getCitiesOfState("IN", punjabState.isoCode);
            setCitiesList(cities);
        }
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.fullname || prev.fullName,
                email: user.email || prev.email,
                phoneNumber: user.phoneNumber || prev.phoneNumber,
                resumeLink: user.profile?.resume || prev.resumeLink,
                skills: user.profile?.skills?.join(", ") || prev.skills
            }));
        }
    }, [user]);

    const handleCountryChange = (e) => {
        const countryName = e.target.value;
        const countryObj = allCountries.find(c => c.name === countryName);
        const countryCode = countryObj ? countryObj.isoCode : "";
        setSelectedCountryCode(countryCode);

        const states = State.getStatesOfCountry(countryCode);
        setStatesList(states);

        const firstState = states[0] ? states[0].name : "";
        const firstStateCode = states[0] ? states[0].isoCode : "";
        const cities = firstStateCode ? City.getCitiesOfState(countryCode, firstStateCode) : [];
        setCitiesList(cities);

        setFormData(prev => ({
            ...prev,
            country: countryName,
            state: firstState,
            city: cities[0] ? cities[0].name : ""
        }));
        setFormError("");
    };

    const handleStateChange = (e) => {
        const stateName = e.target.value;
        const stateObj = statesList.find(s => s.name === stateName);
        const stateCode = stateObj ? stateObj.isoCode : "";

        const cities = City.getCitiesOfState(selectedCountryCode, stateCode);
        setCitiesList(cities);

        setFormData(prev => ({
            ...prev,
            state: stateName,
            city: cities[0] ? cities[0].name : ""
        }));
        setFormError("");
    };

    const handleQualificationChange = (e) => {
        const qual = e.target.value;
        const availableDegrees = Object.keys(indianQualifications[qual]?.degrees || {});
        const firstDegree = availableDegrees[0] || "";
        const availableBranches = indianQualifications[qual]?.degrees?.[firstDegree] || [];
        const firstBranch = availableBranches[0] || "";

        setFormData(prev => ({
            ...prev,
            qualification: qual,
            degree: firstDegree,
            branch: firstBranch
        }));
        setFormError("");
    };

    const handleDegreeChange = (e) => {
        const deg = e.target.value;
        const availableBranches = indianQualifications[formData.qualification]?.degrees?.[deg] || [];
        const firstBranch = availableBranches[0] || "";

        setFormData(prev => ({
            ...prev,
            degree: deg,
            branch: firstBranch
        }));
        setFormError("");
    };

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setFormError("");
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyClick = () => {
        if (!user) {
            toast.error("Please login to apply for jobs.");
            return navigate("/login");
        }
        if (user?.role === 'recruiter') {
            return toast.error("Recruiter accounts cannot apply to job postings.");
        }
        setFormError("");
        setCurrentStep(1);
        setOpenApplyModal(true);
    };

    const nextStepHandler = () => {
        setFormError("");

        if (currentStep === 1) {
            if (!String(formData.fullName).trim()) return setFormError("Full Name is required");
            if (!String(formData.email).trim()) return setFormError("Email Address is required");
            if (!String(formData.phoneNumber).trim()) return setFormError("Phone Number is required");
            if (!formData.age || Number(formData.age) < 16) return setFormError("Please enter a valid age (16+)");
            if (!String(formData.city).trim()) return setFormError("City is required");
            setCurrentStep(2);
            return;
        }

        if (currentStep === 2) {
            if (!formData.qualification) return setFormError("Highest Qualification is required");
            if (!formData.degree) return setFormError("Degree / Program is required");
            if (!formData.branch) return setFormError("Branch / Specialization is required");
            if (!formData.graduationYear) return setFormError("Graduation Year is required");
            if (!formData.cgpa || isNaN(formData.cgpa) || Number(formData.cgpa) <= 0 || Number(formData.cgpa) > 10) {
                return setFormError("Enter a valid CGPA out of 10 (e.g. 8.2)");
            }

            if (singleJob?.minCgpa && Number(formData.cgpa) < singleJob.minCgpa) {
                return setFormError(`Not eligible: Minimum ${singleJob.minCgpa} CGPA required.`);
            }
            if (singleJob?.allowedQualifications?.length > 0 && !singleJob.allowedQualifications.includes(formData.qualification)) {
                return setFormError(`Ineligible: Role requires ${singleJob.allowedQualifications.join(", ")}`);
            }
            if (singleJob?.allowedBranches?.length > 0 && !singleJob.allowedBranches.includes(formData.branch)) {
                return setFormError(`Ineligible branch. Recruiter allows: ${singleJob.allowedBranches.join(", ")}`);
            }
            if (!String(formData.skills).trim()) return setFormError("Please enter your key skills");
            setCurrentStep(3);
            return;
        }

        if (currentStep === 3) {
            if (!String(formData.tenthSchool).trim()) return setFormError("10th School name is required");
            if (!formData.tenthPercentage || isNaN(formData.tenthPercentage)) return setFormError("10th Percentage is required");
            if (singleJob?.minTenthPercent && Number(formData.tenthPercentage) < singleJob.minTenthPercent) {
                return setFormError(`Ineligible: Minimum ${singleJob.minTenthPercent}% required in 10th.`);
            }

            if (!String(formData.twelfthSchool).trim()) return setFormError("12th School / Junior College name is required");
            if (!formData.twelfthPercentage || isNaN(formData.twelfthPercentage)) return setFormError("12th Percentage is required");
            if (singleJob?.minTwelfthPercent && Number(formData.twelfthPercentage) < singleJob.minTwelfthPercent) {
                return setFormError(`Ineligible: Minimum ${singleJob.minTwelfthPercent}% required in 12th.`);
            }

            if (!String(formData.collegeName).trim()) return setFormError("College Name is required");
            if (singleJob?.allowedColleges?.length > 0 && !singleJob.allowedColleges.includes(formData.collegeName)) {
                return setFormError("Ineligible: Campus drive is restricted to specific partner colleges.");
            }
            setCurrentStep(4);
            return;
        }
    };

    const submitApplicationHandler = async () => {
        setFormError("");

        if (!String(formData.leetcode).trim()) return setFormError("LeetCode Profile URL is required");
        if (!String(formData.github).trim()) return setFormError("GitHub Profile URL is required");
        if (!String(formData.linkedin).trim()) return setFormError("LinkedIn Profile URL is required");
        if (!String(formData.resumeLink).trim() && !resumeFile && !user?.profile?.resume) {
            return setFormError("Please provide a Resume Link or Upload a PDF Resume file");
        }

        try {
            setLoading(true);
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (resumeFile) data.append("resumeFile", resumeFile);
            if (photoFile) data.append("applicantPhoto", photoFile);

            const res = await axios.post(`${APPLICATION_API_END_POINT}/apply/${jobId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            if (res.data.success) {
                setIsApplied(true);
                setOpenApplyModal(false);
                const updatedSingleJob = {
                    ...singleJob,
                    applications: [...(singleJob?.applications || []), { applicant: user?._id }]
                };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message || "Application submitted successfully!");
            }
        } catch (error) {
            console.error(error);
            setFormError(error.response?.data?.message || "Failed to submit application");
            toast.error(error.response?.data?.message || "Failed to submit application");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job?.applications?.some(app => 
                        (typeof app === 'object' ? app.applicant === user?._id : app === user?._id)
                    ));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    const degreesAvailable = Object.keys(indianQualifications[formData.qualification]?.degrees || {});
    const rawRequirements = singleJob?.requirements || [];
    const formattedRequirements = Array.isArray(rawRequirements) 
        ? rawRequirements 
        : typeof rawRequirements === 'string' 
            ? rawRequirements.split(/\r?\n|,/).map(r => r.trim()).filter(Boolean)
            : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <div className='max-w-6xl mx-auto my-10 px-4'>
                
                {/* Header Card */}
                <div className='bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm mb-6'>
                    <div className='flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap'>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {singleJob?.company?.logo ? (
                                    <img 
                                        src={singleJob?.company?.logo} 
                                        alt={singleJob?.company?.name} 
                                        className="w-12 h-12 rounded-xl object-contain bg-white border border-gray-200 p-1"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-lg">
                                        <Building2 className="w-6 h-6 text-[#6A38C2]" />
                                    </div>
                                )}
                                <div>
                                    <h1 className='font-extrabold text-2xl text-gray-900 dark:text-white'>
                                        {singleJob?.title || "Job Title"}
                                    </h1>
                                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                        {singleJob?.company?.name || "Company"}
                                    </p>
                                </div>
                            </div>

                            {/* Key Badges */}
                            <div className='flex items-center gap-2 flex-wrap pt-1'>
                                <Badge className={'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 font-bold'}>
                                    {singleJob?.position && Number(singleJob.position) > 0 
                                        ? `${singleJob.position} Positions` 
                                        : "Multiple / Competitive Openings"
                                    }
                                </Badge>
                                <Badge className={'text-[#F83002] bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900 font-bold'}>
                                    {singleJob?.jobType}
                                </Badge>
                                <Badge className={'text-[#7209b7] bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 font-bold'}>
                                    {singleJob?.salary} LPA
                                </Badge>
                                {singleJob?.minCgpa > 0 ? (
                                    <Badge className={'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 font-bold'}>
                                        Min CGPA: {singleJob?.minCgpa}
                                    </Badge>
                                ) : (
                                    <Badge className={'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 font-bold'}>
                                        Universal Eligibility (No Cutoff)
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Apply Trigger */}
                        <div>
                            <Button
                                onClick={isApplied ? null : handleApplyClick}
                                disabled={isApplied || user?.role === 'recruiter'}
                                className={`rounded-xl px-6 py-6 font-semibold shadow-md ${
                                    isApplied 
                                        ? 'bg-emerald-600 text-white cursor-not-allowed' 
                                        : user?.role === 'recruiter'
                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                            : 'bg-[#6A38C2] hover:bg-[#5b30a6] text-white'
                                }`}
                            >
                                {isApplied ? (
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" /> Applied
                                    </span>
                                ) : user?.role === 'recruiter' ? (
                                    "Recruiter View"
                                ) : (
                                    "Apply Now"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left 2 Columns */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Job Description Card */}
                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                                Detailed Job Description & Responsibilities
                            </h2>
                            <FormattedText text={singleJob?.description} />
                        </div>

                        {/* Technical Prerequisites */}
                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <Code2 className="w-5 h-5 text-purple-600" />
                                Required Skills & Technical Prerequisites
                            </h2>
                            
                            {formattedRequirements.length > 0 ? (
                                <div className="space-y-2.5">
                                    {formattedRequirements.map((req, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {req.replace(/^[•\-\*]\s*/, '')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500">No specific technical prerequisites listed for this opening.</p>
                            )}
                        </div>

                        {/* Screening Criteria */}
                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <GraduationCap className="w-5 h-5 text-purple-600" />
                                Student Academic Screening Criteria
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 bg-gray-50 dark:bg-[#1f2937]/50 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                                    <p className="text-[11px] text-gray-500 font-medium">Min CGPA</p>
                                    <p className="font-bold text-sm text-purple-600 dark:text-purple-400">
                                        {singleJob?.minCgpa > 0 ? singleJob.minCgpa : "None"}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-[#1f2937]/50 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                                    <p className="text-[11px] text-gray-500 font-medium">Equivalent %</p>
                                    <p className="font-bold text-sm text-purple-600 dark:text-purple-400">
                                        {singleJob?.minPercentage > 0 ? `${singleJob.minPercentage}%` : "None"}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-[#1f2937]/50 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                                    <p className="text-[11px] text-gray-500 font-medium">Min 10th Score</p>
                                    <p className="font-bold text-sm text-purple-600 dark:text-purple-400">
                                        {singleJob?.minTenthPercent > 0 ? `${singleJob.minTenthPercent}%` : "None"}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-[#1f2937]/50 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                                    <p className="text-[11px] text-gray-500 font-medium">Min 12th Score</p>
                                    <p className="font-bold text-sm text-purple-600 dark:text-purple-400">
                                        {singleJob?.minTwelfthPercent > 0 ? `${singleJob.minTwelfthPercent}%` : "None"}
                                    </p>
                                </div>
                            </div>

                            {singleJob?.allowedBranches?.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Allowed Branches:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {singleJob.allowedBranches.map((br, i) => (
                                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                                                {br}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {singleJob?.allowedColleges?.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Eligible Campus Institutions:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {singleJob.allowedColleges.map((col, i) => (
                                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                                                {col}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-600" />
                                Opening Overview
                            </h3>

                            <div className="space-y-3.5 text-xs">
                                <div className="flex items-start gap-3">
                                    <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-gray-500">Role Designation</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{singleJob?.title}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-gray-500">Work Locations</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{singleJob?.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-gray-500">Offered CTC / Package</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{singleJob?.salary} LPA</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-gray-500">Total Applicants</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{singleJob?.applications?.length || 0} Candidates</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-gray-500">Posted Date</p>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                                            {singleJob?.createdAt ? singleJob.createdAt.split("T")[0] : "2026-08-22"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* 4-Step Application Modal */}
                <Dialog open={openApplyModal} onOpenChange={setOpenApplyModal}>
                    <DialogContent className="sm:max-w-[660px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111827] dark:border-gray-800">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                Apply for {singleJob?.title}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 dark:text-gray-400">
                                Step {currentStep} of 4 — {
                                    currentStep === 1 ? "Personal & Contact" : 
                                    currentStep === 2 ? "Degrees & Specializations" : 
                                    currentStep === 3 ? "Schools & Colleges in India" : "Coding Profiles & Resume"
                                }
                            </DialogDescription>
                        </DialogHeader>

                        {/* Progress Stepper Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full my-2 overflow-hidden">
                            <div 
                                className="bg-[#6A38C2] h-full transition-all duration-300"
                                style={{ width: `${currentStep * 25}%` }}
                            />
                        </div>

                        {formError && (
                            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <div className="space-y-4 pt-1">
                            {/* STEP 1: Personal & Contact */}
                            {currentStep === 1 && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Full Name *</Label>
                                            <Input name="fullName" value={formData.fullName} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Applicant Photo</Label>
                                            <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0])} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Email Address *</Label>
                                            <Input name="email" type="email" value={formData.email} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Phone Number *</Label>
                                            <Input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-gray-700 dark:text-gray-300 font-semibold">Age (Years) *</Label>
                                        <Input name="age" type="number" min="16" max="70" placeholder="e.g. 23" value={formData.age} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Country *</Label>
                                            <select name="country" value={formData.country} onChange={handleCountryChange} className="w-full h-10 px-3 py-2 my-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-sm text-gray-900 dark:text-white">
                                                {allCountries.map(c => <option key={c.isoCode} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">State / UT *</Label>
                                            <select name="state" value={formData.state} onChange={handleStateChange} className="w-full h-10 px-3 py-2 my-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-sm text-gray-900 dark:text-white">
                                                {statesList.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">City *</Label>
                                            <Input list="cities-options" name="city" value={formData.city} onChange={changeHandler} placeholder="Type or Select City" className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                            <datalist id="cities-options">
                                                {citiesList.map((c, i) => <option key={i} value={c.name} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Academic Hierarchy */}
                            {currentStep === 2 && (
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-gray-700 dark:text-gray-300 font-semibold">Highest Qualification *</Label>
                                        <select name="qualification" value={formData.qualification} onChange={handleQualificationChange} className="w-full h-10 px-3 py-2 my-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-sm text-gray-900 dark:text-white">
                                            {Object.keys(indianQualifications).map(qual => <option key={qual} value={qual}>{qual}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Degree / Program Name *</Label>
                                            <select name="degree" value={formData.degree} onChange={handleDegreeChange} className="w-full h-10 px-3 py-2 my-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-sm text-gray-900 dark:text-white">
                                                {degreesAvailable.map(deg => <option key={deg} value={deg}>{deg}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Branch / Specialization *</Label>
                                            <Input list="branches-options" name="branch" value={formData.branch} onChange={changeHandler} placeholder="Select or type branch" className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                            <datalist id="branches-options">
                                                {(indianQualifications[formData.qualification]?.degrees?.[formData.degree] || []).map(b => <option key={b} value={b} />)}
                                            </datalist>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Graduation Year *</Label>
                                            <Input name="graduationYear" type="number" min="1990" max="2035" value={formData.graduationYear} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">
                                                Cumulative CGPA (out of 10) * {singleJob?.minCgpa > 0 && <span className="text-xs text-amber-500 font-normal">(Cutoff: {singleJob.minCgpa})</span>}
                                            </Label>
                                            <Input name="cgpa" type="number" step="0.01" min="1" max="10" placeholder="e.g. 8.25" value={formData.cgpa} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-gray-700 dark:text-gray-300 font-semibold">Key Skills (comma separated) *</Label>
                                        <Input name="skills" placeholder="C++, React, Node.js, DSA, System Design" value={formData.skills} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Schooling & Colleges */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className="p-3 border rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1f2937]/30 space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">10th Standard Records</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input name="tenthSchool" placeholder="School Name" value={formData.tenthSchool} onChange={changeHandler} className="col-span-1 bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                            <select name="tenthBoard" value={formData.tenthBoard} onChange={changeHandler} className="col-span-1 h-10 px-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111827] text-xs text-gray-900 dark:text-white">
                                                {(educationBoards || []).map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                            <Input name="tenthPercentage" type="number" placeholder="10th % (e.g. 92)" value={formData.tenthPercentage} onChange={changeHandler} className="col-span-1 bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                    </div>

                                    <div className="p-3 border rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1f2937]/30 space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">12th Standard Records</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Input name="twelfthSchool" placeholder="School / Jr. College Name" value={formData.twelfthSchool} onChange={changeHandler} className="col-span-1 bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                            <select name="twelfthBoard" value={formData.twelfthBoard} onChange={changeHandler} className="col-span-1 h-10 px-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111827] text-xs text-gray-900 dark:text-white">
                                                {(educationBoards || []).map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                            <Input name="twelfthPercentage" type="number" placeholder="12th % (e.g. 88)" value={formData.twelfthPercentage} onChange={changeHandler} className="col-span-1 bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">College / University Name (India) *</Label>
                                            <span className="text-xs text-muted-foreground">Country: India</span>
                                        </div>
                                        <Input list="colleges-options" name="collegeName" value={formData.collegeName} onChange={changeHandler} placeholder="Search or type college name" className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        <datalist id="colleges-options">
                                            {(indianColleges || []).map((c, i) => <option key={i} value={c} />)}
                                        </datalist>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Coding Profiles & Resume */}
                            {currentStep === 4 && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">LeetCode Profile URL *</Label>
                                            <Input name="leetcode" placeholder="https://leetcode.com/u/username" value={formData.leetcode} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">GitHub Profile URL *</Label>
                                            <Input name="github" placeholder="https://github.com/username" value={formData.github} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">LinkedIn Profile URL *</Label>
                                            <Input name="linkedin" placeholder="https://linkedin.com/in/username" value={formData.linkedin} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Portfolio Website (Optional)</Label>
                                            <Input name="portfolio" placeholder="https://myportfolio.com" value={formData.portfolio} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                    </div>

                                    <div className="p-3 border rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1f2937]/50 space-y-2">
                                        <Label className="text-gray-800 dark:text-gray-200 font-semibold">Resume / CV (Link OR Upload PDF) *</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-gray-500">Resume Link</Label>
                                                <Input name="resumeLink" placeholder="https://drive.google.com/..." value={formData.resumeLink} onChange={changeHandler} className="my-1 bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">Upload PDF File</Label>
                                                <Input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files?.[0])} className="my-1 bg-white dark:bg-[#111827] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Expected CTC (LPA)</Label>
                                            <Input name="expectedSalary" type="number" value={formData.expectedSalary} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Notice Period</Label>
                                            <Input name="noticePeriod" placeholder="Immediate" value={formData.noticePeriod} onChange={changeHandler} className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100" />
                                        </div>
                                        <div>
                                            <Label className="text-gray-700 dark:text-gray-300 font-semibold">Relocate?</Label>
                                            <select name="willingToRelocate" value={formData.willingToRelocate} onChange={changeHandler} className="w-full h-10 px-3 py-2 my-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-sm text-gray-900 dark:text-white">
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stepper Navigation Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                {currentStep > 1 ? (
                                    <Button type="button" variant="outline" onClick={() => { setFormError(""); setCurrentStep(prev => prev - 1); }} className="flex items-center gap-1 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-gray-900 dark:text-gray-100">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </Button>
                                ) : <div />}

                                {currentStep < 4 ? (
                                    <Button type="button" onClick={nextStepHandler} className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white flex items-center gap-1">
                                        Next <ArrowRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={submitApplicationHandler} disabled={loading} className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white flex items-center gap-2">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {loading ? "Submitting..." : "Submit Application"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default JobDescription;