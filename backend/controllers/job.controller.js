import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            requirements, 
            salary, 
            location, 
            jobType, 
            experience, 
            experienceLevel,
            position, 
            companyId,
            company,
            minCgpa,
            minPercentage,
            minTenthPercent,
            minTwelfthPercent,
            allowedQualifications,
            allowedDegrees,
            allowedBranches,
            allowedColleges
        } = req.body;
        
        const userId = req.id;
        const targetCompanyId = companyId || company;
        const targetExperience = experience !== undefined ? experience : experienceLevel;

        // Note: salary and targetExperience can be 0 (for freshers/unpaid internships)
        if (
            !title || 
            !description || 
            !requirements || 
            salary === undefined || 
            salary === null || 
            !location || 
            !jobType || 
            targetExperience === undefined || 
            targetExperience === null || 
            !position || 
            !targetCompanyId
        ) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            });
        }

        const job = await Job.create({
            title,
            description,
            requirements: Array.isArray(requirements) ? requirements : (typeof requirements === 'string' ? requirements.split(",") : []),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(targetExperience),
            position: Number(position),
            company: targetCompanyId,
            created_by: userId,
            minCgpa: Number(minCgpa) || 0,
            minPercentage: Number(minPercentage) || 0,
            minTenthPercent: Number(minTenthPercent) || 0,
            minTwelfthPercent: Number(minTwelfthPercent) || 0,
            allowedQualifications: allowedQualifications || [],
            allowedDegrees: allowedDegrees || [],
            allowedBranches: allowedBranches || [],
            allowedColleges: allowedColleges || []
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error("Error in postJob:", error);
        return res.status(500).json({
            message: "Internal server error creating job",
            success: false
        });
    }
};

// student k liye (Always returns 200 with an array, never 404)
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };

        // Find jobs matching title or description and populate company details
        let jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });

        // If no direct title/description match was found, filter by populated company name
        if (!jobs || jobs.length === 0) {
            const allJobs = await Job.find({}).populate({
                path: "company"
            }).sort({ createdAt: -1 });

            jobs = allJobs.filter(job => 
                job.company?.name?.toLowerCase().includes(keyword.toLowerCase())
            );
        }

        return res.status(200).json({
            jobs: jobs || [],
            success: true
        });
    } catch (error) {
        console.error("Error in getAllJobs:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// student job by id
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        }).populate({
            path: "company"
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.error("Error in getJobById:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company'
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            jobs: jobs || [],
            success: true
        });
    } catch (error) {
        console.error("Error in getAdminJobs:", error);
        return res.status(500).json({
            message: "Internal server error fetching admin jobs",
            success: false
        });
    }
};

// update job
export const updateJob = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            requirements, 
            salary, 
            location, 
            jobType, 
            experience, 
            experienceLevel,
            position,
            minCgpa,
            minPercentage,
            minTenthPercent,
            minTwelfthPercent,
            allowedQualifications,
            allowedDegrees,
            allowedBranches,
            allowedColleges
        } = req.body;
        
        const jobId = req.params.id;
        const targetExperience = experience !== undefined ? experience : experienceLevel;

        const updateData = {
            title,
            description,
            requirements: requirements ? (Array.isArray(requirements) ? requirements : requirements.split(",")) : undefined,
            salary: salary !== undefined ? Number(salary) : undefined,
            location,
            jobType,
            experienceLevel: targetExperience !== undefined ? Number(targetExperience) : undefined,
            position: position !== undefined ? Number(position) : undefined,
            minCgpa: minCgpa !== undefined ? Number(minCgpa) : undefined,
            minPercentage: minPercentage !== undefined ? Number(minPercentage) : undefined,
            minTenthPercent: minTenthPercent !== undefined ? Number(minTenthPercent) : undefined,
            minTwelfthPercent: minTwelfthPercent !== undefined ? Number(minTwelfthPercent) : undefined,
            allowedQualifications,
            allowedDegrees,
            allowedBranches,
            allowedColleges
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const job = await Job.findByIdAndUpdate(jobId, updateData, { new: true });
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job updated successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error("Error in updateJob:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};