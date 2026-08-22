import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    salary: {
        type: Number,
        required: true
    },
    experienceLevel: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    jobType: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: Number,
        required: true
    },

    // Screening Cutoffs & Criteria (0 or empty array = open to all)
    minCgpa: {
        type: Number,
        default: 0
    },
    minTenthPercent: {
        type: Number,
        default: 0
    },
    minTwelfthPercent: {
        type: Number,
        default: 0
    },
    allowedQualifications: [{
        type: String,
        trim: true
    }],
    allowedDegrees: [{
        type: String,
        trim: true
    }],
    allowedBranches: [{
        type: String,
        trim: true
    }],
    allowedColleges: [{
        type: String,
        trim: true
    }],

    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application'
        }
    ]
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);