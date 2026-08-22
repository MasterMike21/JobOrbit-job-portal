import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, updateJob } from "../controllers/job.controller.js";

const router = express.Router();

// Recruiter / Admin routes (Protected)
router.route("/post").post(isAuthenticated, postJob);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/update/:id").put(isAuthenticated, updateJob);

// Public routes (Students and Guests can view)
router.route("/get").get(getAllJobs);
router.route("/get/:id").get(getJobById);

export default router;