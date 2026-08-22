import React, { useState, useEffect } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, CheckSquare, Square, Search, GraduationCap, Mail, Edit3 } from 'lucide-react'
import { City } from 'country-state-city'
import { indianQualifications, indianColleges } from '@/utils/indiaEducationData'

const jobTypeOptions = [
    "Full Time",
    "Part Time",
    "Internship",
    "Contract",
    "Remote",
    "Hybrid"
];

const experienceOptions = [
    { label: "Fresher / Final Year Graduate (0 Yrs)", value: 0 },
    { label: "Internship (Pre-Final / Final Year)", value: 0 },
    { label: "0 - 1 Year (Junior / Entry-Level)", value: 1 }
];

const allQualificationsList = Object.keys(indianQualifications || {});

const allDegreesList = Array.from(new Set(
    Object.values(indianQualifications || {}).flatMap(q => Object.keys(q.degrees || {}))
));

const allBranchesList = Array.from(new Set(
    Object.values(indianQualifications || {}).flatMap(q => 
        Object.values(q.degrees || {}).flatMap(branchArr => branchArr)
    )
));

const PostJob = ({ editMode = false }) => {
    const { id } = useParams();
    const isEditing = Boolean(id) || editMode;
    const { user } = useSelector(store => store.auth);
    const { companies } = useSelector(store => store.company);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchingJob, setFetchingJob] = useState(false);

    const recruiterCompany = user?.profile?.company?._id 
        ? user.profile.company 
        : (companies?.find(c => c._id === user?.profile?.company || c.userId === user?._id) || user?.profile?.company);

    const [allCities, setAllCities] = useState([]);
    const [citySearch, setCitySearch] = useState("");
    const [collegeSearch, setCollegeSearch] = useState("");

    useEffect(() => {
        const inCities = City.getCitiesOfCountry("IN").map(c => `${c.name}, India`);
        const usCities = City.getCitiesOfCountry("US").slice(0, 40).map(c => `${c.name}, United States`);
        const ukCities = City.getCitiesOfCountry("GB").slice(0, 20).map(c => `${c.name}, United Kingdom`);
        setAllCities([...inCities, ...usCities, ...ukCities]);
    }, []);

    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        jobType: "Full Time",
        experience: 0,
        position: 1,
        minCgpa: 0,
        minPercentage: 0,
        minTenthPercent: 0,
        minTwelfthPercent: 0,
        acceptanceEmailTemplate: "",
        rejectionEmailTemplate: ""
    });

    const [disclosePositions, setDisclosePositions] = useState(true);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedQualifications, setSelectedQualifications] = useState([]);
    const [selectedDegrees, setSelectedDegrees] = useState([]);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedColleges, setSelectedColleges] = useState([]);

    const [openAllCriteria, setOpenAllCriteria] = useState(false);
    const [openAllColleges, setOpenAllColleges] = useState(true);
    const [openAllBranches, setOpenAllBranches] = useState(true);
    const [openAllDegrees, setOpenAllDegrees] = useState(true);
    const [openAllQualifications, setOpenAllQualifications] = useState(true);

    const [conversionFactor, setConversionFactor] = useState("10");

    // Fetch existing job details if in Edit Mode
    useEffect(() => {
        if (id) {
            const fetchJobDetails = async () => {
                try {
                    setFetchingJob(true);
                    const res = await axios.get(`${JOB_API_END_POINT}/get/${id}`, { withCredentials: true });
                    if (res.data.success) {
                        const job = res.data.job;
                        setInput({
                            title: job.title || "",
                            description: job.description || "",
                            requirements: Array.isArray(job.requirements) ? job.requirements.join("\n") : (job.requirements || ""),
                            salary: job.salary || "",
                            jobType: job.jobType || "Full Time",
                            experience: job.experienceLevel || 0,
                            position: job.position || 1,
                            minCgpa: job.minCgpa || 0,
                            minPercentage: job.minPercentage || 0,
                            minTenthPercent: job.minTenthPercent || 0,
                            minTwelfthPercent: job.minTwelfthPercent || 0,
                            acceptanceEmailTemplate: job.acceptanceEmailTemplate || "",
                            rejectionEmailTemplate: job.rejectionEmailTemplate || ""
                        });

                        setDisclosePositions(Number(job.position) > 0);
                        if (job.location) {
                            setSelectedLocations(job.location.split(" | ").map(l => l.trim()));
                        }

                        if (job.allowedQualifications && job.allowedQualifications.length > 0) {
                            setSelectedQualifications(job.allowedQualifications);
                            setOpenAllQualifications(false);
                        }
                        if (job.allowedDegrees && job.allowedDegrees.length > 0) {
                            setSelectedDegrees(job.allowedDegrees);
                            setOpenAllDegrees(false);
                        }
                        if (job.allowedBranches && job.allowedBranches.length > 0) {
                            setSelectedBranches(job.allowedBranches);
                            setOpenAllBranches(false);
                        }
                        if (job.allowedColleges && job.allowedColleges.length > 0) {
                            setSelectedColleges(job.allowedColleges);
                            setOpenAllColleges(false);
                        }
                    }
                } catch (error) {
                    console.error("Fetch Job Error:", error);
                    toast.error("Failed to load opening details for editing.");
                } finally {
                    setFetchingJob(false);
                }
            };
            fetchJobDetails();
        }
    }, [id]);

    const calculateEquivalent = (val, isCgpaInput, factor) => {
        const num = parseFloat(val) || 0;
        if (num <= 0) return { cgpa: 0, percent: 0 };

        if (isCgpaInput) {
            let percent = 0;
            if (factor === "10") percent = num * 10;
            else if (factor === "9.5") percent = num * 9.5;
            else if (factor === "pu_formula") percent = Math.max(0, (num - 0.75) * 10);
            return { cgpa: num, percent: parseFloat(percent.toFixed(1)) };
        } else {
            let cgpa = 0;
            if (factor === "10") cgpa = num / 10;
            else if (factor === "9.5") cgpa = num / 9.5;
            else if (factor === "pu_formula") cgpa = (num / 10) + 0.75;
            return { cgpa: parseFloat(cgpa.toFixed(2)), percent: num };
        }
    };

    const handleFactorChange = (newFactor) => {
        setConversionFactor(newFactor);
        if (input.minCgpa > 0) {
            const res = calculateEquivalent(input.minCgpa, true, newFactor);
            setInput(prev => ({ ...prev, minPercentage: res.percent }));
        }
    };

    const handleCgpaChange = (e) => {
        const val = e.target.value;
        const res = calculateEquivalent(val, true, conversionFactor);
        setInput(prev => ({ ...prev, minCgpa: val, minPercentage: res.percent }));
    };

    const handlePercentChange = (e) => {
        const val = e.target.value;
        const res = calculateEquivalent(val, false, conversionFactor);
        setInput(prev => ({ ...prev, minPercentage: val, minCgpa: res.cgpa }));
    };

    const toggleSelection = (item, list, setList) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleMasterOpenAll = (checked) => {
        setOpenAllCriteria(checked);
        setOpenAllColleges(checked);
        setOpenAllBranches(checked);
        setOpenAllDegrees(checked);
        setOpenAllQualifications(checked);
        if (checked) {
            setInput(prev => ({
                ...prev,
                minCgpa: 0,
                minPercentage: 0,
                minTenthPercent: 0,
                minTwelfthPercent: 0
            }));
            setSelectedColleges([]);
            setSelectedBranches([]);
            setSelectedDegrees([]);
            setSelectedQualifications([]);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const assignedCompanyId = recruiterCompany?._id || user?.profile?.company?._id || user?.profile?.company;

            if (!assignedCompanyId) {
                toast.error("Assigned company not found. Please verify your company profile.");
                return;
            }

            if (selectedLocations.length === 0) {
                toast.error("Please select at least one job location.");
                return;
            }

            const formattedRequirements = input.requirements
                .split("\n")
                .map(r => r.replace(/^[•\-\*]\s*/, '').trim())
                .filter(Boolean);

            if (formattedRequirements.length === 0) {
                toast.error("Please provide at least one requirement.");
                return;
            }

            const payload = {
                title: input.title.trim(),
                description: input.description.trim(),
                requirements: formattedRequirements,
                salary: Number(input.salary),
                location: selectedLocations.join(" | "),
                jobType: input.jobType,
                experience: Number(input.experience),
                experienceLevel: Number(input.experience),
                position: disclosePositions ? (Number(input.position) || 1) : 0,
                companyId: assignedCompanyId,
                company: assignedCompanyId,
                minCgpa: openAllCriteria ? 0 : Number(input.minCgpa),
                minPercentage: openAllCriteria ? 0 : Number(input.minPercentage),
                minTenthPercent: openAllCriteria ? 0 : Number(input.minTenthPercent),
                minTwelfthPercent: openAllCriteria ? 0 : Number(input.minTwelfthPercent),
                allowedQualifications: openAllQualifications ? [] : selectedQualifications,
                allowedDegrees: openAllDegrees ? [] : selectedDegrees,
                allowedBranches: openAllBranches ? [] : selectedBranches,
                allowedColleges: openAllColleges ? [] : selectedColleges,
                acceptanceEmailTemplate: input.acceptanceEmailTemplate,
                rejectionEmailTemplate: input.rejectionEmailTemplate
            };

            const endpoint = id 
                ? `${JOB_API_END_POINT}/update/${id}` 
                : `${JOB_API_END_POINT}/post`;

            const res = await axios.post(endpoint, payload, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (res.data.success) {
                toast.success(res.data.message || (id ? "Job updated successfully!" : "Job opening posted successfully!"));
                navigate("/admin/jobs");
            }
        } catch (error) {
            console.error("Post / Update Job Error:", error);
            toast.error(error.response?.data?.message || "Failed to save job opening.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingJob) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#6A38C2]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <div className='flex items-center justify-center my-8 px-4'>
                <form onSubmit={submitHandler} className='p-8 max-w-5xl w-full border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl bg-white dark:bg-[#111827] space-y-6'>
                    
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                {isEditing ? <Edit3 className="w-6 h-6 text-[#6A38C2]" /> : <GraduationCap className="w-6 h-6 text-[#6A38C2]" />}
                                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                                    {isEditing ? "Edit Campus / Recruitment Opening" : "Post Campus / Early-Career Opening"}
                                </h2>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {isEditing ? "Update opening parameters, eligibility cutoffs, and custom email copies." : "Configure opening details tailored for student applicants and set screening rules."}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs uppercase font-semibold text-purple-600 dark:text-purple-400">Assigned Company</span>
                            <div className="font-bold text-lg text-gray-800 dark:text-gray-200">
                                {recruiterCompany?.name || user?.profile?.company?.name || "Company"}
                            </div>
                        </div>
                    </div>

                    {/* Primary Role Details */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <Label className="font-semibold text-gray-700 dark:text-gray-300">Job Title *</Label>
                            <Input
                                type="text"
                                placeholder="e.g. Graduate Software Engineer / SDE-1"
                                value={input.title}
                                onChange={(e) => setInput({ ...input, title: e.target.value })}
                                className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-purple-500"
                                required
                            />
                        </div>

                        <div>
                            <Label className="font-semibold text-gray-700 dark:text-gray-300">Job Type *</Label>
                            <select
                                value={input.jobType}
                                onChange={(e) => setInput({ ...input, jobType: e.target.value })}
                                className="w-full h-10 px-3 py-2 my-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {jobTypeOptions.map((type, idx) => (
                                    <option key={idx} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="font-semibold text-gray-700 dark:text-gray-300">Salary Package / CTC (LPA) *</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 12"
                                value={input.salary}
                                onChange={(e) => setInput({ ...input, salary: e.target.value })}
                                className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-purple-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="font-semibold text-gray-700 dark:text-gray-300">Experience Tier *</Label>
                                <select
                                    value={input.experience}
                                    onChange={(e) => setInput({ ...input, experience: Number(e.target.value) })}
                                    className="w-full h-10 px-3 py-2 my-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {experienceOptions.map((opt, idx) => (
                                        <option key={idx} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <Label className="font-semibold text-gray-700 dark:text-gray-300">Positions</Label>
                                    <button
                                        type="button"
                                        onClick={() => setDisclosePositions(!disclosePositions)}
                                        className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 hover:underline"
                                    >
                                        {disclosePositions ? <CheckSquare className="w-3 h-3 text-purple-600" /> : <Square className="w-3 h-3 text-gray-400" />}
                                        Disclose
                                    </button>
                                </div>
                                <Input
                                    type={disclosePositions ? "number" : "text"}
                                    min="1"
                                    disabled={!disclosePositions}
                                    value={disclosePositions ? input.position : "Undisclosed / Multiple"}
                                    onChange={(e) => setInput({ ...input, position: e.target.value })}
                                    className="h-10 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-purple-500"
                                    required={disclosePositions}
                                />
                            </div>
                        </div>

                        {/* Description & Requirements */}
                        <div className="col-span-2">
                            <Label className="font-semibold text-gray-700 dark:text-gray-300">Job Description *</Label>
                            <Textarea
                                rows={4}
                                placeholder="Enter detailed job overview, responsibilities, and team benefits..."
                                value={input.description}
                                onChange={(e) => setInput({ ...input, description: e.target.value })}
                                className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-purple-500"
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <Label className="font-semibold text-gray-700 dark:text-gray-300">Key Technical Requirements (Bullet points) *</Label>
                            <Textarea
                                rows={4}
                                placeholder={"• Strong proficiency in React, TypeScript, and Node.js\n• Solid understanding of Data Structures & Algorithms\n• Experience building RESTful APIs"}
                                value={input.requirements}
                                onChange={(e) => setInput({ ...input, requirements: e.target.value })}
                                className="my-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-purple-500"
                                required
                            />
                        </div>

                        {/* Locations */}
                        <div className="col-span-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="font-semibold text-gray-700 dark:text-gray-300">
                                    Work Locations *
                                </Label>
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                    {selectedLocations.length} selected
                                </span>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search global cities (e.g. Bangalore, Chandigarh, Hyderabad, San Francisco)..."
                                    value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                    className="pl-9 my-1 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-purple-500"
                                />
                            </div>

                            <div className="h-32 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50/50 dark:bg-[#1f2937]/30 grid grid-cols-3 gap-2">
                                {allCities
                                    .filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
                                    .slice(0, 100)
                                    .map((city, idx) => {
                                        const isSelected = selectedLocations.includes(city);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => toggleSelection(city, selectedLocations, setSelectedLocations)}
                                                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                                                    isSelected ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" /> : <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                                                <span className="truncate">{city}</span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>

                    {/* Candidate Screening & Cutoffs Section */}
                    <div className="p-5 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-sm text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                                    Student Academic Eligibility & Cutoffs
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Set academic cutoffs or allow universal campus eligibility with one click.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleMasterOpenAll(!openAllCriteria)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-purple-300 dark:border-purple-700 bg-white dark:bg-[#1f2937] hover:bg-purple-50 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                            >
                                {openAllCriteria ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                                Open For All (No Academic Cutoffs)
                            </button>
                        </div>

                        {/* CGPA & Percentage Converter */}
                        <div className="grid grid-cols-5 gap-3 bg-white dark:bg-[#111827] p-3 rounded-lg border border-purple-100 dark:border-purple-900">
                            <div>
                                <Label className="text-xs font-semibold">Scale / Formula</Label>
                                <select
                                    value={conversionFactor}
                                    disabled={openAllCriteria}
                                    onChange={(e) => handleFactorChange(e.target.value)}
                                    className="w-full h-9 px-2 my-1 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-gray-900 dark:text-white"
                                >
                                    <option value="10">Scale: × 10 (e.g. 8.0 = 80%)</option>
                                    <option value="9.5">Scale: × 9.5 (CBSE/VTU)</option>
                                    <option value="pu_formula">(CGPA - 0.75) × 10 (PU)</option>
                                </select>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Min CGPA</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    disabled={openAllCriteria}
                                    placeholder="e.g. 7.5"
                                    value={input.minCgpa || ""}
                                    onChange={handleCgpaChange}
                                    className="my-1 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Equivalent %</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    disabled={openAllCriteria}
                                    placeholder="e.g. 75%"
                                    value={input.minPercentage || ""}
                                    onChange={handlePercentChange}
                                    className="my-1 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Min 10th %</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    disabled={openAllCriteria}
                                    placeholder="0 = No Cutoff"
                                    value={input.minTenthPercent || ""}
                                    onChange={(e) => setInput({ ...input, minTenthPercent: e.target.value })}
                                    className="my-1 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Min 12th %</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    disabled={openAllCriteria}
                                    placeholder="0 = No Cutoff"
                                    value={input.minTwelfthPercent || ""}
                                    onChange={(e) => setInput({ ...input, minTwelfthPercent: e.target.value })}
                                    className="my-1 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Scrollable Checkbox Selectors */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Qualifications */}
                            <div className="space-y-1 bg-white dark:bg-[#111827] p-3 rounded-lg border border-purple-100 dark:border-purple-900">
                                <div className="flex justify-between items-center mb-1">
                                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Allowed Qualifications</Label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenAllQualifications(!openAllQualifications)}
                                        className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1"
                                    >
                                        {openAllQualifications ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />} All Qualifications
                                    </button>
                                </div>
                                <div className="h-28 overflow-y-auto border border-gray-300 dark:border-gray-800 rounded p-1.5 space-y-1">
                                    {allQualificationsList.map((qual, i) => {
                                        const isSel = selectedQualifications.includes(qual);
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => !openAllQualifications && toggleSelection(qual, selectedQualifications, setSelectedQualifications)}
                                                className={`flex items-center gap-2 p-1 rounded text-xs cursor-pointer ${
                                                    openAllQualifications ? 'opacity-50' : isSel ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold' : ''
                                                }`}
                                            >
                                                {openAllQualifications || isSel ? <CheckSquare className="w-3 h-3 text-purple-600 shrink-0" /> : <Square className="w-3 h-3 text-gray-400 shrink-0" />}
                                                <span>{qual}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Degrees */}
                            <div className="space-y-1 bg-white dark:bg-[#111827] p-3 rounded-lg border border-purple-100 dark:border-purple-900">
                                <div className="flex justify-between items-center mb-1">
                                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Allowed Degrees</Label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenAllDegrees(!openAllDegrees)}
                                        className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1"
                                    >
                                        {openAllDegrees ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />} All Degrees
                                    </button>
                                </div>
                                <div className="h-28 overflow-y-auto border border-gray-300 dark:border-gray-800 rounded p-1.5 space-y-1">
                                    {allDegreesList.map((deg, i) => {
                                        const isSel = selectedDegrees.includes(deg);
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => !openAllDegrees && toggleSelection(deg, selectedDegrees, setSelectedDegrees)}
                                                className={`flex items-center gap-2 p-1 rounded text-xs cursor-pointer ${
                                                    openAllDegrees ? 'opacity-50' : isSel ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold' : ''
                                                }`}
                                            >
                                                {openAllDegrees || isSel ? <CheckSquare className="w-3 h-3 text-purple-600 shrink-0" /> : <Square className="w-3 h-3 text-gray-400 shrink-0" />}
                                                <span>{deg}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Branches */}
                            <div className="space-y-1 bg-white dark:bg-[#111827] p-3 rounded-lg border border-purple-100 dark:border-purple-900">
                                <div className="flex justify-between items-center mb-1">
                                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Eligible Branches</Label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenAllBranches(!openAllBranches)}
                                        className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1"
                                    >
                                        {openAllBranches ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />} All Branches
                                    </button>
                                </div>
                                <div className="h-32 overflow-y-auto border border-gray-300 dark:border-gray-800 rounded p-1.5 space-y-1">
                                    {allBranchesList.map((branch, i) => {
                                        const isSel = selectedBranches.includes(branch);
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => !openAllBranches && toggleSelection(branch, selectedBranches, setSelectedBranches)}
                                                className={`flex items-center gap-2 p-1 rounded text-xs cursor-pointer ${
                                                    openAllBranches ? 'opacity-50' : isSel ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold' : ''
                                                }`}
                                            >
                                                {openAllBranches || isSel ? <CheckSquare className="w-3 h-3 text-purple-600 shrink-0" /> : <Square className="w-3 h-3 text-gray-400 shrink-0" />}
                                                <span>{branch}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Colleges */}
                            <div className="space-y-1 bg-white dark:bg-[#111827] p-3 rounded-lg border border-purple-100 dark:border-purple-900">
                                <div className="flex justify-between items-center mb-1">
                                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">Eligible Colleges</Label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenAllColleges(!openAllColleges)}
                                        className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1"
                                    >
                                        {openAllColleges ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />} All Colleges
                                    </button>
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Search college directory..."
                                    value={collegeSearch}
                                    onChange={(e) => setCollegeSearch(e.target.value)}
                                    className="h-7 text-[11px] mb-1 bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-purple-500"
                                />
                                <div className="h-24 overflow-y-auto border border-gray-300 dark:border-gray-800 rounded p-1.5 space-y-1">
                                    {(indianColleges || [])
                                        .filter(col => col.toLowerCase().includes(collegeSearch.toLowerCase()))
                                        .map((college, i) => {
                                            const isSel = selectedColleges.includes(college);
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => !openAllColleges && toggleSelection(college, selectedColleges, setSelectedColleges)}
                                                    className={`flex items-center gap-2 p-1 rounded text-[11px] cursor-pointer ${
                                                        openAllColleges ? 'opacity-50' : isSel ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold' : ''
                                                    }`}
                                                >
                                                    {openAllColleges || isSel ? <CheckSquare className="w-3 h-3 text-purple-600 shrink-0" /> : <Square className="w-3 h-3 text-gray-400 shrink-0" />}
                                                    <span className="truncate">{college}</span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pre-configured Custom Email Templates */}
                    <div className="p-5 bg-gray-50 dark:bg-[#111827]/90 border border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
                                Custom Email Notifications (Optional)
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500">
                            Pre-set custom acceptance & rejection messages for this specific job opening.
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-1">
                            <div>
                                <Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Default Shortlist / Acceptance Email Body</Label>
                                <Textarea 
                                    rows={4}
                                    placeholder="We are thrilled to shortlist your resume! Next steps: Online Assessment link will be shared shortly..."
                                    value={input.acceptanceEmailTemplate}
                                    onChange={(e) => setInput({ ...input, acceptanceEmailTemplate: e.target.value })}
                                    className="my-1 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold text-red-700 dark:text-red-400">Default Rejection Email Body</Label>
                                <Textarea 
                                    rows={4}
                                    placeholder="Thank you for applying. While we were impressed with your profile, we will not be moving forward at this time..."
                                    value={input.rejectionEmailTemplate}
                                    onChange={(e) => setInput({ ...input, rejectionEmailTemplate: e.target.value })}
                                    className="my-1 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    {loading ? (
                        <Button className="w-full bg-[#6A38C2] text-white py-6" disabled>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> {isEditing ? "Saving Changes..." : "Posting Campus Drive..."}
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white font-semibold py-6 text-base shadow-lg">
                            {isEditing ? "Save & Update Opening" : "Post Opening"}
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PostJob;