import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { LogOut, User2, Sun, Moon, Building2, Briefcase } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import { useTheme } from '@/context/ThemeContext'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Logout failed");
        }
    };

    return (
        <nav className='bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4 md:px-8'>
                {/* Logo */}
                <div>
                    <Link to="/">
                        <h1 className='text-2xl font-black tracking-tight text-gray-900 dark:text-white'>
                            Job<span className='text-[#6A38C2]'>Orbit</span>
                        </h1>
                    </Link>
                </div>

                {/* Navigation Links & Action Controls */}
                <div className='flex items-center gap-6 md:gap-8'>
                    <ul className='flex font-medium items-center gap-6 text-sm text-gray-700 dark:text-gray-200'>
                        {user && user.role === 'recruiter' ? (
                            <>
                                <li>
                                    <Link to="/" className="hover:text-[#6A38C2] transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin/jobs" className="hover:text-[#6A38C2] transition-colors flex items-center gap-1.5">
                                        Jobs
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/admin/company" className="hover:text-[#6A38C2] transition-colors flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        Company Profile
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/" className="hover:text-[#6A38C2] transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/jobs" className="hover:text-[#6A38C2] transition-colors">
                                        Jobs
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/browse" className="hover:text-[#6A38C2] transition-colors">
                                        Browse
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* Theme Switcher Button */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                        className='p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-700 dark:text-gray-200 hover:text-[#6A38C2] dark:hover:text-[#6A38C2] transition-colors'
                    >
                        {theme === 'dark' ? (
                            <Sun className='w-4 h-4 text-amber-400' />
                        ) : (
                            <Moon className='w-4 h-4 text-slate-700' />
                        )}
                    </button>

                    {/* Auth Status Check */}
                    {!user ? (
                        <div className='flex items-center gap-2.5'>
                            <Link to="/login">
                                <Button variant="outline" className="text-xs font-semibold px-4 h-9">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white text-xs font-semibold px-4 h-9 shadow-sm">
                                    Signup
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Avatar className="cursor-pointer ring-2 ring-purple-600/20 hover:ring-purple-600/50 transition-all w-9 h-9">
                                    <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                    <AvatarFallback className="bg-[#6A38C2] text-white font-bold text-xs uppercase">
                                        {user?.fullname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl">
                                <div className='flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3'>
                                    <Avatar className="w-10 h-10 ring-1 ring-gray-200 dark:ring-gray-700">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname} />
                                        <AvatarFallback className="bg-[#6A38C2] text-white font-bold uppercase">
                                            {user?.fullname?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <h4 className='font-bold text-sm text-gray-900 dark:text-white truncate'>
                                            {user?.fullname}
                                        </h4>
                                        <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
                                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-[#6A38C2] dark:text-purple-300">
                                            {user?.role === 'recruiter' ? 'Recruiter / Employer' : 'Student / Candidate'}
                                        </span>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-1.5 mt-3 text-gray-700 dark:text-gray-200'>
                                    {user && user.role === 'student' ? (
                                        <Link 
                                            to="/profile" 
                                            className='flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                                        >
                                            <User2 className="w-4 h-4 text-purple-600" />
                                            <span>View Student Profile</span>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link 
                                                to="/admin/jobs" 
                                                className='flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                                            >
                                                <Briefcase className="w-4 h-4 text-purple-600" />
                                                <span>Manage Job Openings</span>
                                            </Link>
                                            <Link 
                                                to="/admin/company" 
                                                className='flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                                            >
                                                <Building2 className="w-4 h-4 text-purple-600" />
                                                <span>Manage Company Details</span>
                                            </Link>
                                        </>
                                    )}

                                    <button 
                                        onClick={logoutHandler}
                                        className='flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left'
                                    >
                                        <LogOut className="w-4 h-4 text-red-500" />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;