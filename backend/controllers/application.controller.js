import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import { 
    sendApplicationReceivedEmail, 
    sendStatusUpdateEmail, 
    sendRecruiterAlertEmail 
} from "../utils/emailservice.js";

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
                message: "You have already applied for this job.",
                success: false
            });
        }

        const job = await Job.findById(jobId)
            .populate("company")
            .populate("created_by");

        if (!job) {
            return res.status(404).json({
                message: "Job opening not found.",
                success: false
            });
        }

        // Academic Screening Criteria Checks
        const candidateCgpa = parseFloat(cgpa);
        const candidate10th = parseFloat(tenthPercentage);
        const candidate12th = parseFloat(twelfthPercentage);

        if (job.minCgpa && job.minCgpa > 0 && candidateCgpa < job.minCgpa) {
            return res.status(400).json({
                message: `Not eligible due to CGPA cutoff. Minimum required is ${job.minCgpa} CGPA.`,
                success: false
            });
        }

        if (job.minTenthPercent && job.minTenthPercent > 0 && candidate10th < job.minTenthPercent) {
            return res.status(400).json({
                message: `Not eligible due to 10th score cutoff. Minimum required is ${job.minTenthPercent}%.`,
                success: false
            });
        }

        if (job.minTwelfthPercent && job.minTwelfthPercent > 0 && candidate12th < job.minTwelfthPercent) {
            return res.status(400).json({
                message: `Not eligible due to 12th score cutoff. Minimum required is ${job.minTwelfthPercent}%.`,
                success: false
            });
        }

        if (job.allowedQualifications && job.allowedQualifications.length > 0 && !job.allowedQualifications.includes(qualification)) {
            return res.status(400).json({
                message: `Qualification ineligible for this role. Allowed: ${job.allowedQualifications.join(", ")}`,
                success: false
            });
        }

        if (job.allowedDegrees && job.allowedDegrees.length > 0 && !job.allowedDegrees.includes(degree)) {
            return res.status(400).json({
                message: `Degree ineligible for this role. Allowed: ${job.allowedDegrees.join(", ")}`,
                success: false
            });
        }

        if (job.allowedBranches && job.allowedBranches.length > 0 && !job.allowedBranches.includes(branch)) {
            return res.status(400).json({
                message: `Branch ineligible for this role. Allowed: ${job.allowedBranches.join(", ")}`,
                success: false
            });
        }

        if (job.allowedColleges && job.allowedColleges.length > 0 && !job.allowedColleges.includes(collegeName)) {
            return res.status(400).json({
                message: `This campus drive is restricted to selected partner institutions.`,
                success: false
            });
        }

        // Handle Resume File Upload vs Resume Link
        let resumeUrl = resumeLink || "";
        let resumeOriginalName = "Resume Link";

        if (req.files && req.files.resumeFile && req.files.resumeFile[0]) {
            const resumeDataUri = getDataUri(req.files.resumeFile[0]);
            const cloudResponse = await cloudinary.uploader.upload(resumeDataUri.content, {
                resource_type: "auto",
                flags: "attachment:false",
                folder: "joborbit_resumes"
            });
            
            let finalUrl = cloudResponse.secure_url;
            if (!finalUrl.endsWith('.pdf') && cloudResponse.format === 'pdf') {
                finalUrl = `${finalUrl}.pdf`;
            }
            
            resumeUrl = finalUrl;
            resumeOriginalName = req.files.resumeFile[0].originalname;
        }

        // Handle Applicant Photo Upload
        let applicantPhoto = "";
        if (req.files && req.files.applicantPhoto && req.files.applicantPhoto[0]) {
            const photoDataUri = getDataUri(req.files.applicantPhoto[0]);
            const photoResponse = await cloudinary.uploader.upload(photoDataUri.content, {
                folder: "joborbit_applicant_photos"
            });
            applicantPhoto = photoResponse.secure_url;
        }

        // Format skills cleanly into array
        const formattedSkills = Array.isArray(skills)
            ? skills
            : (typeof skills === "string" ? skills.split(",").map(skill => skill.trim()).filter(Boolean) : []);

        // Create new application record
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
            fullName: fullName.trim(),
            email: email.trim(),
            phoneNumber: phoneNumber.trim(),
            age: Number(age),
            country: country || "India",
            state: state || "",
            city: city || "",
            applicantPhoto,
            qualification,
            degree,
            branch,
            graduationYear: Number(graduationYear),
            cgpa: candidateCgpa,
            skills: formattedSkills,
            tenthSchool: tenthSchool.trim(),
            tenthBoard,
            tenthPercentage: candidate10th,
            twelfthSchool: twelfthSchool.trim(),
            twelfthBoard,
            twelfthPercentage: candidate12th,
            collegeCountry: collegeCountry || "India",
            collegeName: collegeName.trim(),
            leetcode: leetcode || "",
            github: github || "",
            linkedin: linkedin || "",
            portfolio: portfolio || "",
            resumeLink: resumeUrl,
            resumeUrl,
            resumeOriginalName,
            expectedSalary: Number(expectedSalary) || 0,
            noticePeriod: noticePeriod || "Immediate",
            willingToRelocate: willingToRelocate || "Yes",
            status: "pending"
        });

        job.applications.push(newApplication._id);
        await job.save();

        // 1. Confirmation email to student
        await sendApplicationReceivedEmail(
            email.trim(),
            fullName.trim(),
            job.title,
            job.company?.name || "the recruiting company"
        );

        // 2. Alert notification to recruiter
        const recruiterEmail = job.created_by?.email;
        if (recruiterEmail) {
            await sendRecruiterAlertEmail(
                recruiterEmail,
                fullName.trim(),
                job.title,
                candidateCgpa,
                branch,
                collegeName.trim()
            );
        }

        return res.status(201).json({
            message: "Application submitted successfully!",
            application: newApplication,
            success: true
        });
    } catch (error) {
        console.error("Error in applyJob:", error);
        return res.status(500).json({
            message: "Internal server error submitting application.",
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

        return res.status(200).json({
            application: application || [],
            success: true
        });
    } catch (error) {
        console.error("Error in getAppliedJobs:", error);
        return res.status(500).json({
            message: "Internal server error fetching application history.",
            success: false
        });
    }
};

// Recruiter fetches all applicants for a specific job
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant',
                select: '-password'
            }
        }).populate("company");

        if (!job) {
            return res.status(404).json({
                message: 'Job opening not found.',
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });
    } catch (error) {
        console.error("Error in getApplicants:", error);
        return res.status(500).json({
            message: "Internal server error fetching applicants.",
            success: false
        });
    }
};

// Recruiter updates candidate application status (Accepted / Rejected) with custom message
export const updateStatus = async (req, res) => {
    try {
        const { status, customMessage } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: 'Status is required.',
                success: false
            });
        }

        const application = await Application.findById(applicationId)
            .populate("applicant")
            .populate({
                path: "job",
                populate: { path: "company" }
            });

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        application.status = status.toLowerCase();
        await application.save();

        const recipientEmail = application.email || application.applicant?.email;
        const recipientName = application.fullName || application.applicant?.fullname || "Candidate";
        const jobTitle = application.job?.title || "Applied Position";
        const companyName = application.job?.company?.name || "Company Recruitment";

        if (recipientEmail) {
            await sendStatusUpdateEmail(
                recipientEmail,
                recipientName,
                jobTitle,
                companyName,
                application.status,
                customMessage
            );
        } else {
            console.warn("[JobOrbit Mailer] No recipient email found on application record.");
        }

        return res.status(200).json({
            message: `Candidate status updated to ${status}.`,
            application,
            success: true
        });
    } catch (error) {
        console.error("Error in updateStatus:", error);
        return res.status(500).json({
            message: "Internal server error updating candidate status.",
            success: false
        });
    }
};