const BASE_URL = "https://joborbit-job-portal.onrender.com/api/v1";
export const USER_API_END_POINT = import.meta.env.VITE_USER_API_END_POINT || `${BASE_URL}/user`;
export const JOB_API_END_POINT = import.meta.env.VITE_JOB_API_END_POINT || `${BASE_URL}/job`;
export const APPLICATION_API_END_POINT = import.meta.env.VITE_APPLICATION_API_END_POINT || `${BASE_URL}/application`;
export const COMPANY_API_END_POINT = import.meta.env.VITE_COMPANY_API_END_POINT || `${BASE_URL}/company`;