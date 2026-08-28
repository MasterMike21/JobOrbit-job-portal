import React, { useEffect, useState, useMemo } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT, COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import { Loader2, Building2, PlusCircle, AlertCircle, MapPin, Search, Check, Globe } from 'lucide-react'
import { Country, State, City } from 'country-state-city'
import { searchGlobalCompaniesLive } from '@/utils/companyAutocomplete'

const Signup = () => {
    const locationState = useLocation().state;
    const allCountries = useMemo(() => Country.getAllCountries(), []);

    const [input, setInput] = useState({
        fullname: "",
        email: locationState?.prefillEmail || "",
        phoneNumber: "",
        password: "",
        role: locationState?.prefillRole || "student",
        file: "",
        selectedCompany: "",
        companyId: "",
        companyWebsite: "",
        isNewCompany: false,
        newCompanyName: "",
        newCompanyDescription: "",
        newCompanyWebsite: ""
    });

    // Cascading Location States
    const [compCountryName, setCompCountryName] = useState("India");
    const [compCountryCode, setCompCountryCode] = useState("IN");
    const [compStateName, setCompStateName] = useState("");
    const [compStateCode, setCompStateCode] = useState("");
    const [compCityName, setCompCityName] = useState("");
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    // Live Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dbCompanies, setDbCompanies] = useState([]);

    const { loading } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Fetch local DB companies using dynamic endpoint
    useEffect(() => {
        const fetchAllCompanies = async () => {
            try {
                const res = await axios.get(`${COMPANY_API_END_POINT}/get`, { withCredentials: true });
                if (res.data.success && res.data.companies?.length > 0) {
                    setDbCompanies(res.data.companies);
                }
            } catch (err) {
                console.error("Fetch DB Companies Error:", err);
            }
        };
        fetchAllCompanies();
    }, []);

    // Debounced Live Worldwide Autocomplete
    useEffect(() => {
        if (!searchTerm || searchTerm.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            
            // 1. Check local DB matches first
            const localMatches = dbCompanies
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(c => ({
                    name: c.name,
                    domain: c.website ? c.website.replace(/(^\w+:|^)\/\//, '').replace(/\/.*$/, '') : '',
                    logo: c.logo || `https://img.logo.dev/${c.name.toLowerCase().replace(/\s+/g, '')}.com?token=pk_anonymous`,
                    location: c.location || "Database Registered",
                    _id: c._id
                }));

            // 2. Fetch live worldwide results
            const liveMatches = await searchGlobalCompaniesLive(searchTerm);

            // Combine and eliminate duplicates
            const combined = [...localMatches, ...liveMatches];
            const seen = new Set();
            const unique = combined.filter(c => {
                const k = c.name.toLowerCase().trim();
                if (seen.has(k)) return false;
                seen.add(k);
                return true;
            });

            setSearchResults(unique);
            setIsSearching(false);
        }, 250);

        return () => clearTimeout(timer);
    }, [searchTerm, dbCompanies]);

    // Location Cascaders
    useEffect(() => {
        if (compCountryCode) {
            const states = State.getStatesOfCountry(compCountryCode);
            setStatesList(states);
            const firstState = states[0];
            if (firstState) {
                setCompStateName(firstState.name);
                setCompStateCode(firstState.isoCode);
                const cities = City.getCitiesOfState(compCountryCode, firstState.isoCode);
                setCitiesList(cities);
                setCompCityName(cities[0]?.name || "");
            } else {
                setCompStateName("");
                setCompStateCode("");
                setCitiesList([]);
                setCompCityName("");
            }
        }
    }, [compCountryCode]);

    useEffect(() => {
        if (compCountryCode && compStateCode) {
            const cities = City.getCitiesOfState(compCountryCode, compStateCode);
            setCitiesList(cities);
            setCompCityName(cities[0]?.name || "");
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

    const selectCompanyHandler = (comp) => {
        setInput(prev => ({
            ...prev,
            selectedCompany: comp.name,
            companyId: comp._id || "",
            companyWebsite: comp.domain ? `https://${comp.domain}` : ""
        }));
        setSearchTerm(comp.name);
        setDropdownOpen(false);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("file", input.file);
        }

        if (input.role === "recruiter") {
            formData.append("isNewCompany", input.isNewCompany);
            if (input.isNewCompany) {
                if (!input.newCompanyName.trim()) {
                    return toast.error("Company Name is required.");
                }
                const formattedLocation = [compCityName, compStateName, compCountryName].filter(Boolean).join(", ");
                if (!formattedLocation.trim()) {
                    return toast.error("Company Location is required.");
                }

                formData.append("newCompanyName", input.newCompanyName);
                formData.append("newCompanyDescription", input.newCompanyDescription);
                formData.append("newCompanyLocation", formattedLocation);
                formData.append("newCompanyWebsite", input.newCompanyWebsite);
            } else {
                const companyNameToSubmit = input.selectedCompany || searchTerm;
                if (!companyNameToSubmit.trim()) {
                    return toast.error("Please search/type a company or register a custom one.");
                }
                formData.append("companyId", input.companyId);
                formData.append("companyName", companyNameToSubmit.trim());
                formData.append("newCompanyWebsite", input.companyWebsite || "");
            }
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message || "Account created successfully");
                if (res.data.user.role === 'recruiter') {
                    navigate('/admin/jobs');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            console.error("Registration Error:", error);
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto px-4 py-8'>
                <form onSubmit={submitHandler} className='w-full sm:w-[560px] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl bg-white dark:bg-[#111827] space-y-4'>
                    
                    {locationState?.fromLoginRedirect && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>No account found for <strong>{locationState.prefillEmail}</strong>. Please complete sign up below.</span>
                        </div>
                    )}

                    <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                        <h1 className='font-bold text-2xl text-gray-900 dark:text-white'>Create Account</h1>
                        <p className="text-xs text-gray-500">Sign up to apply for roles or post campus hiring drives</p>
                    </div>

                    <div>
                        <Label className="font-semibold text-gray-700 dark:text-gray-300">Full Name *</Label>
                        <Input
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            placeholder="e.g. Rahul Sharma"
                            className="my-1 dark:bg-[#1f2937] dark:border-gray-700"
                            required
                        />
                    </div>

                    <div>
                        <Label className="font-semibold text-gray-700 dark:text-gray-300">Email Address *</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="name@example.com"
                            className="my-1 dark:bg-[#1f2937] dark:border-gray-700"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="font-semibold text-gray-700 dark:text-gray-300">Phone Number *</Label>
                            <Input
                                type="number"
                                value={input.phoneNumber}
                                name="phoneNumber"
                                onChange={changeEventHandler}
                                placeholder="9876543210"
                                className="my-1 dark:bg-[#1f2937] dark:border-gray-700"
                                required
                            />
                        </div>
                        <div>
                            <Label className="font-semibold text-gray-700 dark:text-gray-300">Password *</Label>
                            <Input
                                type="password"
                                value={input.password}
                                name="password"
                                onChange={changeEventHandler}
                                placeholder="••••••••"
                                className="my-1 dark:bg-[#1f2937] dark:border-gray-700"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">I am registering as: *</Label>
                        <RadioGroup className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer w-4 h-4 accent-[#6A38C2]"
                                    id="r-student"
                                />
                                <Label htmlFor="r-student" className="cursor-pointer font-medium">Student / Fresher</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer w-4 h-4 accent-[#6A38C2]"
                                    id="r-recruiter"
                                />
                                <Label htmlFor="r-recruiter" className="cursor-pointer font-medium">Recruiter</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* LIVE WORLDWIDE COMPANY ASSIGNMENT */}
                    {input.role === 'recruiter' && (
                        <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl space-y-3">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <h3 className="font-bold text-sm text-purple-950 dark:text-purple-300">
                                    Global Company Search & Verification
                                </h3>
                            </div>

                            {!input.isNewCompany ? (
                                <div className="space-y-1 relative">
                                    <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Search Global Database (Live Autocomplete) *
                                    </Label>
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                        <Input
                                            type="text"
                                            value={searchTerm}
                                            onFocus={() => setDropdownOpen(true)}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setInput(prev => ({ ...prev, selectedCompany: e.target.value, companyId: "" }));
                                                setDropdownOpen(true);
                                            }}
                                            placeholder="Type any company name (e.g. OpenAI, Nvidia, Razorpay, Spotify)..."
                                            className="pl-9 bg-white dark:bg-[#1f2937] dark:border-gray-700"
                                            required={!input.isNewCompany}
                                        />
                                        {isSearching && (
                                            <Loader2 className="w-4 h-4 text-purple-600 animate-spin absolute right-3 top-3" />
                                        )}
                                    </div>

                                    {/* DYNAMIC AUTOCOMPLETE DROPDOWN */}
                                    {dropdownOpen && (
                                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#182234] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                                            {searchResults.length > 0 ? (
                                                searchResults.map((comp, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => selectCompanyHandler(comp)}
                                                        className="flex items-center justify-between p-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/40 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {comp.logo ? (
                                                                <img 
                                                                    src={comp.logo} 
                                                                    alt={comp.name} 
                                                                    className="w-6 h-6 rounded object-contain bg-white border border-gray-200 p-0.5" 
                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                                                                    {comp.name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{comp.name}</p>
                                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                    <Globe className="w-2.5 h-2.5" /> {comp.domain || comp.location}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {input.selectedCompany === comp.name && (
                                                            <Check className="w-4 h-4 text-purple-600" />
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-3 text-xs text-gray-500 text-center">
                                                    {searchTerm.length < 2 
                                                        ? "Type at least 2 characters to search global companies..."
                                                        : `No exact match for "${searchTerm}". You can register it below.`
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            setInput({ ...input, isNewCompany: true, newCompanyName: searchTerm });
                                        }}
                                        className="text-xs text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 pt-1.5 font-medium"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" /> Company not listed? Register custom organization
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-1">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase">
                                            Register Custom Company
                                        </Label>
                                        <button
                                            type="button"
                                            onClick={() => setInput({ ...input, isNewCompany: false })}
                                            className="text-xs text-gray-500 hover:underline"
                                        >
                                            Back to Global Search
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Company Name *</Label>
                                            <Input
                                                type="text"
                                                name="newCompanyName"
                                                placeholder="e.g. Acme Innovations"
                                                value={input.newCompanyName}
                                                onChange={changeEventHandler}
                                                className="my-1 h-9 text-xs bg-white dark:bg-[#1f2937]"
                                                required={input.isNewCompany}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Website URL</Label>
                                            <Input
                                                type="url"
                                                name="newCompanyWebsite"
                                                placeholder="https://company.com"
                                                value={input.newCompanyWebsite}
                                                onChange={changeEventHandler}
                                                className="my-1 h-9 text-xs bg-white dark:bg-[#1f2937]"
                                            />
                                        </div>
                                    </div>

                                    {/* Location Cascader */}
                                    <div className="p-2.5 bg-white dark:bg-[#111827] rounded-lg border border-purple-100 dark:border-purple-900 space-y-2">
                                        <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-purple-600" /> Headquarters Location *
                                        </Label>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <Label className="text-[11px] text-gray-500 mb-0.5 block">1. Country</Label>
                                                <Input
                                                    list="company-country-datalist"
                                                    value={compCountryName}
                                                    onChange={handleCompCountryChange}
                                                    placeholder="Country..."
                                                    className="h-8 text-xs bg-gray-50 dark:bg-[#1f2937]"
                                                    required={input.isNewCompany}
                                                />
                                                <datalist id="company-country-datalist">
                                                    {allCountries.map(c => (
                                                        <option key={c.isoCode} value={c.name} />
                                                    ))}
                                                </datalist>
                                            </div>

                                            <div>
                                                <Label className="text-[11px] text-gray-500 mb-0.5 block">2. State</Label>
                                                <Input
                                                    list="company-state-datalist"
                                                    value={compStateName}
                                                    onChange={handleCompStateChange}
                                                    disabled={statesList.length === 0}
                                                    placeholder="State..."
                                                    className="h-8 text-xs bg-gray-50 dark:bg-[#1f2937] disabled:opacity-50"
                                                    required={input.isNewCompany}
                                                />
                                                <datalist id="company-state-datalist">
                                                    {statesList.map(s => (
                                                        <option key={s.isoCode} value={s.name} />
                                                    ))}
                                                </datalist>
                                            </div>

                                            <div>
                                                <Label className="text-[11px] text-gray-500 mb-0.5 block">3. City</Label>
                                                <Input
                                                    list="company-city-datalist"
                                                    value={compCityName}
                                                    onChange={(e) => setCompCityName(e.target.value)}
                                                    disabled={citiesList.length === 0}
                                                    placeholder="City..."
                                                    className="h-8 text-xs bg-gray-50 dark:bg-[#1f2937] disabled:opacity-50"
                                                    required={input.isNewCompany}
                                                />
                                                <datalist id="company-city-datalist">
                                                    {citiesList.map((ct, idx) => (
                                                        <option key={idx} value={ct.name} />
                                                    ))}
                                                </datalist>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs">Short Description</Label>
                                        <Input
                                            type="text"
                                            name="newCompanyDescription"
                                            placeholder="Brief overview of domain and mission"
                                            value={input.newCompanyDescription}
                                            onChange={changeEventHandler}
                                            className="my-1 h-9 text-xs bg-white dark:bg-[#1f2937]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <Label className="font-semibold text-gray-700 dark:text-gray-300">Profile Photo</Label>
                        <Input
                            accept="image/*"
                            type="file"
                            onChange={(e) => setInput({ ...input, file: e.target.files?.[0] })}
                            className="my-1 cursor-pointer dark:bg-[#1f2937] dark:border-gray-700"
                        />
                    </div>

                    {loading ? (
                        <Button className="w-full bg-[#6A38C2] text-white py-5" disabled>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Creating Account...
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-5 font-semibold shadow-md">
                            Sign Up
                        </Button>
                    )}

                    <p className='text-xs text-center text-gray-500'>
                        Already have an account? <Link to="/login" className='text-purple-600 font-semibold hover:underline'>Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;