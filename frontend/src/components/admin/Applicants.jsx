import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAllApplicants } from '@/redux/applicationSlice'

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { 
                    withCredentials: true 
                });
                if (res.data.success) {
                    dispatch(setAllApplicants(res.data.job));
                }
            } catch (error) {
                console.error("Fetch applicants error:", error);
            }
        };
        if (params.id) {
            fetchAllApplicants();
        }
    }, [params.id, dispatch]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <h1 className='font-bold text-2xl mb-6 text-gray-900 dark:text-white'>
                    Applicants ({applicants?.applications?.length || 0})
                </h1>
                <ApplicantsTable />
            </div>
        </div>
    );
};

export default Applicants;