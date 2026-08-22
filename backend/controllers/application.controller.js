import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

// Student applies for a job with full multi-step details, CGPA screening & file uploads
export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        const {
            fullName,
            email,
            phoneNumber,
            age,
            country,
            state,
            city,
            qualification,
            degree,
            branch,
            graduationYear,
            cgpa,
            skills,
            tenthSchool,
            tenthBoard,
            tenthPercentage,
            twelfthSchool,
            twelfthBoard,
            twelfthPercentage,
            collegeCountry,
            collegeName,
            leetcode,
            github,
            linkedin,
            portfolio,
            expectedSalary,
            noticePeriod,
            willingToRelocate,
            resumeLink
        } = req.body;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required.",
                success: false
            });
        }

        // Validate mandatory details
        if (
            !fullName ||
            !email ||
            !phoneNumber ||
            !age ||
            !country ||
            !state ||
            !city ||
            !qualification ||
            !degree ||
            !branch ||
            !graduationYear ||
            !cgpa ||
            !tenthSchool ||
            !tenthBoard ||
            !tenthPercentage ||
            !twelfthSchool ||
            !twelfthBoard ||
            !twelfthPercentage ||
            !collegeName
        ) {
            return res.status(400).json({
                message: "Please fill in all mandatory application fields.",
                success: false
            });
        }

        // Check if user has already applied
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job",
                success: false
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // --- Screening Criteria Checks ---
        const candidateCgpa = parseFloat(cgpa);
        const candidate10th = parseFloat(tenthPercentage);
        const candidate12th = parseFloat(twelfthPercentage);

        if (job.minCgpa && job.minCgpa > 0 && candidateCgpa < job.minCgpa) {
            return res.status(400).json({
                message: `Not eligible due to low CGPA. Minimum required CGPA is ${job.minCgpa}.`,
                success: false
            });
        }

        if (job.minTenthPercent && job.minTenthPercent > 0 && candidate10th < job.minTenthPercent) {
            return res.status(400).json({
                message: `Not eligible due to 10th percentage. Minimum required is ${job.minTenthPercent}%.`,
                success: false
            });
        }

        if (job.minTwelfthPercent && job.minTwelfthPercent > 0 && candidate12th < job.minTwelfthPercent) {
            return res.status(400).json({
                message: `Not eligible due to 12th percentage. Minimum required is ${job.minTwelfthPercent}%.`,
                success: false
            });
        }

        if (job.allowedQualifications && job.allowedQualifications.length > 0 && !job.allowedQualifications.includes(qualification)) {
            return res.status(400).json({
                message: `Qualification not eligible for this role. Allowed: ${job.allowedQualifications.join(", ")}`,
                success: false
            });
        }

        if (job.allowedDegrees && job.allowedDegrees.length > 0 && !job.allowedDegrees.includes(degree)) {
            return res.status(400).json({
                message: `Degree not eligible for this role. Allowed: ${job.allowedDegrees.join(", ")}`,
                success: false
            });
        }

        if (job.allowedBranches && job.allowedBranches.length > 0 && !job.allowedBranches.includes(branch)) {
            return res.status(400).json({
                message: `Branch/Specialization not eligible for this role. Allowed: ${job.allowedBranches.join(", ")}`,
                success: false
            });
        }

        if (job.allowedColleges && job.allowedColleges.length > 0 && !job.allowedColleges.includes(collegeName)) {
            return res.status(400).json({
                message: `This drive is restricted to specific campuses/colleges.`,
                success: false
            });
        }

        // Handle Resume Upload / Resume Link
        let resumeUrl = resumeLink || "";
        let resumeOriginalName = "Resume Link";

        if (req.files && req.files.resumeFile && req.files.resumeFile[0]) {
            const resumeDataUri = getDataUri(req.files.resumeFile[0]);
            const cloudResponse = await cloudinary.uploader.upload(resumeDataUri.content);
            resumeUrl = cloudResponse.secure_url;
            resumeOriginalName = req.files.resumeFile[0].originalname;
        }

        // Handle Applicant Photo Upload
        let applicantPhoto = "";
        if (req.files && req.files.applicantPhoto && req.files.applicantPhoto[0]) {
            const photoDataUri = getDataUri(req.files.applicantPhoto[0]);
            const photoResponse = await cloudinary.uploader.upload(photoDataUri.content);
            applicantPhoto = photoResponse.secure_url;
        }

        // Format skills into clean array
        const formattedSkills = Array.isArray(skills)
            ? skills
            : (typeof skills === "string" ? skills.split(",").map(skill => skill.trim()).filter(Boolean) : []);

        // Create new application record
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
            fullName,
            email,
            phoneNumber,
            age: Number(age),
            country: country || "India",
            state,
            city,
            applicantPhoto,
            qualification,
            degree,
            branch,
            graduationYear: Number(graduationYear),
            cgpa: candidateCgpa,
            skills: formattedSkills,
            tenthSchool,
            tenthBoard,
            tenthPercentage: candidate10th,
            twelfthSchool,
            twelfthBoard,
            twelfthPercentage: candidate12th,
            collegeCountry: collegeCountry || "India",
            collegeName,
            leetcode: leetcode || "",
            github: github || "",
            linkedin: linkedin || "",
            portfolio: portfolio || "",
            expectedSalary: Number(expectedSalary) || 0,
            noticePeriod: noticePeriod || "Immediate",
            willingToRelocate: willingToRelocate || "Yes",
            resumeUrl,
            resumeOriginalName
        });

        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Application submitted successfully!",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Student fetches their applied jobs history
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'company',
                    options: { sort: { createdAt: -1 } },
                }
            });

        if (!application || application.length === 0) {
            return res.status(404).json({
                message: "No Applications found",
                success: false
            });
        }

        return res.status(200).json({
            application,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Recruiter fetches applicants for a specific job
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant'
            }
        });

        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Recruiter updates candidate application status (Accepted / Rejected)
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: 'Status is required',
                success: false
            });
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};