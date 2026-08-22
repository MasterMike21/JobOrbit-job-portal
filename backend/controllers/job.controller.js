import { Job } from "../models/job.model.js";

// Admin posts a job opening
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
            allowedColleges,
            acceptanceEmailTemplate,
            rejectionEmailTemplate
        } = req.body;
        
        const userId = req.id;
        const targetCompanyId = companyId || company;
        const targetExperience = experience !== undefined ? experience : experienceLevel;

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
            position === undefined || 
            position === null || 
            !targetCompanyId
        ) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            });
        }

        // Format requirements safely
        let formattedRequirements = [];
        if (Array.isArray(requirements)) {
            formattedRequirements = requirements.map(r => String(r).replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
        } else if (typeof requirements === 'string') {
            formattedRequirements = requirements
                .split("\n")
                .flatMap(line => line.split(","))
                .map(r => r.replace(/^[•\-\*]\s*/, '').trim())
                .filter(Boolean);
        }

        // Calculate auto equivalent percentage if minPercentage was not provided but minCgpa exists
        const parsedCgpa = Number(minCgpa) || 0;
        const parsedPercentage = Number(minPercentage) > 0 
            ? Number(minPercentage) 
            : (parsedCgpa > 0 ? parseFloat((parsedCgpa * 10).toFixed(1)) : 0);

        const job = await Job.create({
            title: title.trim(),
            description: description.trim(),
            requirements: formattedRequirements,
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: Number(targetExperience) || 0,
            position: Number(position) || 0,
            company: targetCompanyId,
            created_by: userId,
            minCgpa: parsedCgpa,
            minPercentage: parsedPercentage,
            minTenthPercent: Number(minTenthPercent) || 0,
            minTwelfthPercent: Number(minTwelfthPercent) || 0,
            allowedQualifications: Array.isArray(allowedQualifications) ? allowedQualifications : [],
            allowedDegrees: Array.isArray(allowedDegrees) ? allowedDegrees : [],
            allowedBranches: Array.isArray(allowedBranches) ? allowedBranches : [],
            allowedColleges: Array.isArray(allowedColleges) ? allowedColleges : [],
            acceptanceEmailTemplate: acceptanceEmailTemplate || "",
            rejectionEmailTemplate: rejectionEmailTemplate || ""
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

// Student fetches all jobs with keyword search & company name match fallback
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };

        let jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });

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

// Student & recruiter fetch job by id
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId)
            .populate({ path: "applications" })
            .populate({ path: "company" })
            .populate({ path: "created_by", select: "-password" });

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

// Admin fetches all jobs created by their account
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

// Admin updates existing job opening
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
            companyId,
            company,
            minCgpa, 
            minPercentage, 
            minTenthPercent, 
            minTwelfthPercent, 
            allowedQualifications, 
            allowedDegrees, 
            allowedBranches, 
            allowedColleges,
            acceptanceEmailTemplate,
            rejectionEmailTemplate
        } = req.body;
        
        const jobId = req.params.id;
        const targetExperience = experience !== undefined ? experience : experienceLevel;
        const targetCompany = companyId || company;

        const parsedCgpa = minCgpa !== undefined ? Number(minCgpa) : undefined;
        let parsedPercentage = minPercentage !== undefined ? Number(minPercentage) : undefined;

        if ((parsedPercentage === undefined || parsedPercentage === 0) && parsedCgpa && parsedCgpa > 0) {
            parsedPercentage = parseFloat((parsedCgpa * 10).toFixed(1));
        }

        let formattedRequirements;
        if (requirements !== undefined) {
            if (Array.isArray(requirements)) {
                formattedRequirements = requirements.map(r => String(r).replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
            } else if (typeof requirements === 'string') {
                formattedRequirements = requirements
                    .split("\n")
                    .flatMap(line => line.split(","))
                    .map(r => r.replace(/^[•\-\*]\s*/, '').trim())
                    .filter(Boolean);
            }
        }

        const updateData = {
            title: title !== undefined ? title.trim() : undefined,
            description: description !== undefined ? description.trim() : undefined,
            requirements: formattedRequirements,
            salary: salary !== undefined ? Number(salary) : undefined,
            location: location !== undefined ? location : undefined,
            jobType: jobType !== undefined ? jobType : undefined,
            experienceLevel: targetExperience !== undefined ? Number(targetExperience) : undefined,
            position: position !== undefined ? Number(position) : undefined,
            company: targetCompany !== undefined ? targetCompany : undefined,
            minCgpa: parsedCgpa,
            minPercentage: parsedPercentage,
            minTenthPercent: minTenthPercent !== undefined ? Number(minTenthPercent) : undefined,
            minTwelfthPercent: minTwelfthPercent !== undefined ? Number(minTwelfthPercent) : undefined,
            allowedQualifications: Array.isArray(allowedQualifications) ? allowedQualifications : undefined,
            allowedDegrees: Array.isArray(allowedDegrees) ? allowedDegrees : undefined,
            allowedBranches: Array.isArray(allowedBranches) ? allowedBranches : undefined,
            allowedColleges: Array.isArray(allowedColleges) ? allowedColleges : undefined,
            acceptanceEmailTemplate: acceptanceEmailTemplate !== undefined ? acceptanceEmailTemplate : undefined,
            rejectionEmailTemplate: rejectionEmailTemplate !== undefined ? rejectionEmailTemplate : undefined
        };

        // Strip undefined properties so unchanged fields remain preserved
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const job = await Job.findByIdAndUpdate(jobId, updateData, { new: true });
        
        if (!job) {
            return res.status(404).json({
                message: "Job opening not found.",
                success: false
            });
        }

        return res.status(200).json({
            message: "Job opening updated successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error("Error in updateJob:", error);
        return res.status(500).json({
            message: "Internal server error updating job",
            success: false
        });
    }
};