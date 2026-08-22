import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
    applyJob, 
    getApplicants, 
    getAppliedJobs, 
    updateStatus 
} from "../controllers/application.controller.js";
import { applicationUpload } from "../middlewares/mutler.js"; // adjust file name if your file is multer.js

const router = express.Router();

router.route("/apply/:id").post(isAuthenticated, applicationUpload, applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, updateStatus);

export default router;