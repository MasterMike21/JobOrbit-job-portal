import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "student"
    });
    const { loading } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                navigate("/");
                toast.success(res.data.message || "Logged in successfully");
            }
        } catch (error) {
            console.error("Login Error:", error);
            const errorMsg = error.response?.data?.message || "Login failed";
            const isNotFound = error.response?.status === 404 || error.response?.data?.notFound;

            if (isNotFound) {
                toast.error("No account found with this email. Redirecting to Sign Up...", {
                    duration: 3000
                });
                navigate("/signup", { 
                    state: { 
                        prefillEmail: input.email, 
                        prefillRole: input.role,
                        fromLoginRedirect: true 
                    } 
                });
            } else {
                toast.error(errorMsg);
            }
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto px-4 my-10'>
                <form onSubmit={submitHandler} className='w-full sm:w-[480px] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl bg-white dark:bg-[#111827] space-y-4'>
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                        <h1 className='font-bold text-2xl text-gray-900 dark:text-white'>Login</h1>
                        <p className="text-xs text-gray-500">Welcome back! Sign in to access your dashboard.</p>
                    </div>

                    <div>
                        <Label className="font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
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

                    <div>
                        <Label className="font-semibold text-gray-700 dark:text-gray-300">Password</Label>
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

                    <div>
                        <Label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Login as:</Label>
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
                                <Label htmlFor="r-student" className="cursor-pointer font-medium">Student</Label>
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

                    {loading ? (
                        <Button className="w-full bg-[#6A38C2] text-white py-5" disabled>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Logging in...
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5b30a6] text-white py-5 font-semibold shadow-md">
                            Login
                        </Button>
                    )}

                    <p className='text-xs text-center text-gray-500'>
                        Don't have an account? <Link to="/signup" className='text-purple-600 font-semibold hover:underline'>Sign Up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;