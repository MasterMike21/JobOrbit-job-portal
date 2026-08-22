import React, { useEffect, useState, useMemo } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { ArrowLeft, Loader2, Building2, MapPin } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSelector, useDispatch } from 'react-redux'
import { Country, State, City } from 'country-state-city'

const CompanyProfile = () => {
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    const companyId = user?.profile?.company?._id || user?.profile?.company;
    const allCountries = useMemo(() => Country.getAllCountries(), []);

    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        file: null
    });

    // 3-Tier Cascading Location State
    const [compCountryName, setCompCountryName] = useState("India");
    const [compCountryCode, setCompCountryCode] = useState("IN");
    const [compStateName, setCompStateName] = useState("");
    const [compStateCode, setCompStateCode] = useState("");
    const [compCityName, setCompCityName] = useState("");

    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Company Details
    useEffect(() => {
        const fetchCompanyDetails = async () => {
            if (!companyId) return;
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get/${companyId}`, { withCredentials: true });
                if (res.data.success && res.data.company) {
                    const comp = res.data.company;
                    setCompanyData(comp);
                    setInput({
                        name: comp.name || "",
                        description: comp.description || "",
                        website: comp.website || "",
                        file: null
                    });

                    if (comp.location) {
                        const parts = comp.location.split(",").map(p => p.trim());
                        if (parts.length >= 3) {
                            setCompCityName(parts[0]);
                            setCompStateName(parts[1]);
                            setCompCountryName(parts[2]);
                            const matchedCountry = allCountries.find(c => c.name.toLowerCase() === parts[2].toLowerCase());
                            if (matchedCountry) setCompCountryCode(matchedCountry.isoCode);
                        } else if (parts.length === 2) {
                            setCompCityName(parts[0]);
                            setCompCountryName(parts[1]);
                            const matchedCountry = allCountries.find(c => c.name.toLowerCase() === parts[1].toLowerCase());
                            if (matchedCountry) setCompCountryCode(matchedCountry.isoCode);
                        } else if (parts.length === 1) {
                            setCompCountryName(parts[0]);
                            const matchedCountry = allCountries.find(c => c.name.toLowerCase() === parts[0].toLowerCase());
                            if (matchedCountry) setCompCountryCode(matchedCountry.isoCode);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchCompanyDetails();
    }, [companyId, allCountries]);

    // 2. Sync States on Country Change
    useEffect(() => {
        if (compCountryCode) {
            const states = State.getStatesOfCountry(compCountryCode);
            setStatesList(states);
            const matchState = states.find(s => s.name.toLowerCase() === compStateName.toLowerCase());
            if (matchState) {
                setCompStateCode(matchState.isoCode);
            } else if (states.length > 0 && !compStateName) {
                setCompStateName(states[0].name);
                setCompStateCode(states[0].isoCode);
            } else if (states.length === 0) {
                setCompStateName("");
                setCompStateCode("");
                setCitiesList([]);
                setCompCityName("");
            }
        }
    }, [compCountryCode]);

    // 3. Sync Cities on State Change
    useEffect(() => {
        if (compCountryCode && compStateCode) {
            const cities = City.getCitiesOfState(compCountryCode, compStateCode);
            setCitiesList(cities);
            if (!cities.some(c => c.name.toLowerCase() === compCityName.toLowerCase())) {
                setCompCityName(cities[0]?.name || "");
            }
        } else {
            setCitiesList([]);
            setCompCityName("");
        }
    }, [compCountryCode, compStateCode]);

    const handleCompCountryChange = (e) => {
        const val = e.target.value;
        setCompCountryName(val);
        const match = allCountries.find(
            c => c.name.toLowerCase() === val.trim().toLowerCase() || c.isoCode.toLowerCase() === val.trim().toLowerCase()
        );
        if (match) setCompCountryCode(match.isoCode);
    };

    const handleCompStateChange = (e) => {
        const val = e.target.value;
        setCompStateName(val);
        const match = statesList.find(
            s => s.name.toLowerCase() === val.trim().toLowerCase() || s.isoCode.toLowerCase() === val.trim().toLowerCase()
        );
        if (match) setCompStateCode(match.isoCode);
    };

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formattedLocation = [compCityName, compStateName, compCountryName].filter(Boolean).join(", ");
        
        if (!formattedLocation.trim()) {
            return toast.error("Headquarters location is required.");
        }

        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", formattedLocation);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${companyId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                if (res.data.company) {
                    setCompanyData(res.data.company);
                }
                navigate("/admin/jobs");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update company");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <div className='max-w-2xl mx-auto my-10 px-4'>
                <form onSubmit={submitHandler} className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl bg-white dark:bg-[#111827] space-y-6">
                    <div className='flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4'>
                        <Button 
                            type="button"
                            onClick={() => navigate("/admin/jobs")} 
                            variant="outline" 
                            size="icon"
                            className="rounded-full h-9 w-9 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className='font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2'>
                                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                Assigned Company Profile
                            </h1>
                            <p className="text-xs text-gray-500">Your recruiter account is strictly bound to this organization.</p>
                        </div>
                    </div>

                    {/* Company Overview Header */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 rounded-xl">
                        {companyData?.logo ? (
                            <img 
                                src={companyData.logo} 
                                alt={companyData.name} 
                                className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-200 p-1"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
                                {input.name?.charAt(0) || "C"}
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{input.name || "Company"}</h3>
                            <p className="text-xs text-gray-500">
                                {[compCityName, compStateName, compCountryName].filter(Boolean).join(", ") || "Location not configured"}
                            </p>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Company Name *</Label>
                            <Input
                                type="text"
                                name="name"
                                value={input.name}
                                onChange={changeEventHandler}
                                className="my-1 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Website URL</Label>
                            <Input
                                type="url"
                                name="website"
                                placeholder="https://company.com"
                                value={input.website}
                                onChange={changeEventHandler}
                                className="my-1 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-purple-500"
                            />
                        </div>

                        {/* 3-Tier Scrollable and Typeable Location Cascader */}
                        <div className="col-span-2 p-3 bg-gray-50/50 dark:bg-[#1f2937]/30 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-purple-600" /> Headquarters Location Hierarchy *
                            </Label>

                            <div className="grid grid-cols-3 gap-2.5">
                                {/* 1. Country */}
                                <div>
                                    <Label className="text-[11px] text-gray-500 mb-1 block font-medium">1. Country</Label>
                                    <Input
                                        list="profile-country-datalist"
                                        value={compCountryName}
                                        onChange={handleCompCountryChange}
                                        placeholder="Type country..."
                                        className="h-8 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                    <datalist id="profile-country-datalist">
                                        {allCountries.map(c => (
                                            <option key={c.isoCode} value={c.name} />
                                        ))}
                                    </datalist>
                                </div>

                                {/* 2. State */}
                                <div>
                                    <Label className="text-[11px] text-gray-500 mb-1 block font-medium">2. State</Label>
                                    <Input
                                        list="profile-state-datalist"
                                        value={compStateName}
                                        onChange={handleCompStateChange}
                                        disabled={statesList.length === 0}
                                        placeholder="Type state..."
                                        className="h-8 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                                    />
                                    <datalist id="profile-state-datalist">
                                        {statesList.map(s => (
                                            <option key={s.isoCode} value={s.name} />
                                        ))}
                                    </datalist>
                                </div>

                                {/* 3. City */}
                                <div>
                                    <Label className="text-[11px] text-gray-500 mb-1 block font-medium">3. City</Label>
                                    <Input
                                        list="profile-city-datalist"
                                        value={compCityName}
                                        onChange={(e) => setCompCityName(e.target.value)}
                                        disabled={citiesList.length === 0}
                                        placeholder="Type city..."
                                        className="h-8 text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                                    />
                                    <datalist id="profile-city-datalist">
                                        {citiesList.map((ct, idx) => (
                                            <option key={idx} value={ct.name} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <p className="text-[10px] text-gray-500 pt-0.5">
                                Current Location: <strong className="text-purple-600 dark:text-purple-400">{[compCityName, compStateName, compCountryName].filter(Boolean).join(", ") || "None"}</strong>
                            </p>
                        </div>

                        <div className="col-span-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">About Company</Label>
                            <textarea
                                rows={3}
                                name="description"
                                placeholder="Brief overview of the company, mission, and work culture..."
                                value={input.description}
                                onChange={changeEventHandler}
                                className="w-full my-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1f2937] p-2.5 text-xs text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Update Company Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={changeFileHandler}
                                className="my-1 cursor-pointer text-xs bg-white dark:bg-[#1f2937] border-gray-300 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <Button className="w-full bg-[#6A38C2] text-white py-5" disabled>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Updating Company Profile...
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-5 font-semibold shadow-md">
                            Update Company Profile
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CompanyProfile;