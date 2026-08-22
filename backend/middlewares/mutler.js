import multer from "multer";

const storage = multer.memoryStorage();

// Single upload (used by legacy routes like profile/company setup)
export const singleUpload = multer({ storage }).single("file");

// Multi-field upload for student job applications
export const applicationUpload = multer({ storage }).fields([
    { name: "resumeFile", maxCount: 1 },
    { name: "applicantPhoto", maxCount: 1 }
]);