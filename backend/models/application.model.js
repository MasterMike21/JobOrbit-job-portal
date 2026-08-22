import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Step 1: Personal Details & Photo
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: "India",
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    applicantPhoto: {
        type: String,
        default: ""
    },

    // Step 2: Academic Hierarchy, Degrees, Branch, CGPA & Skills
    qualification: {
        type: String,
        required: true,
        trim: true
    },
    degree: {
        type: String,
        required: true,
        trim: true
    },
    branch: {
        type: String,
        required: true,
        trim: true
    },
    graduationYear: {
        type: Number,
        required: true
    },
    cgpa: {
        type: Number,
        required: true
    },
    skills: {
        type: [String],
        default: []
    },

    // Step 3: Schooling (10th, 12th) & College Details
    tenthSchool: {
        type: String,
        required: true,
        trim: true
    },
    tenthBoard: {
        type: String,
        required: true,
        trim: true
    },
    tenthPercentage: {
        type: Number,
        required: true
    },
    twelfthSchool: {
        type: String,
        required: true,
        trim: true
    },
    twelfthBoard: {
        type: String,
        required: true,
        trim: true
    },
    twelfthPercentage: {
        type: Number,
        required: true
    },
    collegeCountry: {
        type: String,
        default: "India",
        trim: true
    },
    collegeName: {
        type: String,
        required: true,
        trim: true
    },

    // Step 4: Coding Profiles, Links, Work Preferences & Resume
    leetcode: {
        type: String,
        default: "",
        trim: true
    },
    github: {
        type: String,
        default: "",
        trim: true
    },
    linkedin: {
        type: String,
        default: "",
        trim: true
    },
    portfolio: {
        type: String,
        default: "",
        trim: true
    },
    expectedSalary: {
        type: Number,
        default: 0
    },
    noticePeriod: {
        type: String,
        default: "Immediate",
        trim: true
    },
    willingToRelocate: {
        type: String,
        enum: ["Yes", "No"],
        default: "Yes"
    },
    resumeUrl: {
        type: String,
        default: ""
    },
    resumeOriginalName: {
        type: String,
        default: ""
    },

    // Recruiter Review Status
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);