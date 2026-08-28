import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// Cookie options for cross-domain auth (Vercel <-> Render)
const COOKIE_OPTIONS = {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production' ? true : false
};

export const register = async (req, res) => {
    try {
        const {
            fullname,
            email,
            phoneNumber,
            password,
            role,
            companyId,
            companyName,
            isNewCompany,
            newCompanyName,
            newCompanyDescription,
            newCompanyLocation,
            newCompanyWebsite
        } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email.',
                success: false
            });
        }

        let profilePhotoUrl = "";
        const file = req.file;
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let assignedCompanyId = null;

        if (role === 'recruiter') {
            const isNew = isNewCompany === 'true' || isNewCompany === true;
            
            if (isNew) {
                if (!newCompanyName || !newCompanyLocation) {
                    return res.status(400).json({
                        message: "Company Name and Headquarters Location are required.",
                        success: false
                    });
                }

                let company = await Company.findOne({
                    name: new RegExp(`^${newCompanyName.trim()}$`, 'i')
                });

                if (!company) {
                    company = await Company.create({
                        name: newCompanyName.trim(),
                        description: newCompanyDescription || "",
                        location: newCompanyLocation.trim(),
                        website: newCompanyWebsite || ""
                    });
                }
                assignedCompanyId = company._id;
            } else {
                if (companyId && companyId.trim() !== "") {
                    assignedCompanyId = companyId;
                } else if (companyName && companyName.trim() !== "") {
                    let company = await Company.findOne({
                        name: new RegExp(`^${companyName.trim()}$`, 'i')
                    });

                    if (!company) {
                        company = await Company.create({
                            name: companyName.trim(),
                            location: "India",
                            description: `${companyName.trim()} Organization`
                        });
                    }
                    assignedCompanyId = company._id;
                } else {
                    return res.status(400).json({
                        message: "Please choose your company or select 'Company not listed' to register a new one.",
                        success: false
                    });
                }
            }
        }

        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl,
                company: assignedCompanyId
            }
        });

        if (role === 'recruiter' && assignedCompanyId) {
            await Company.findByIdAndUpdate(assignedCompanyId, {
                $setOnInsert: { userId: newUser._id }
            });
        }

        const tokenData = { userId: newUser._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });
        const populatedUser = await User.findById(newUser._id).populate('profile.company');

        const userResponse = {
            _id: populatedUser._id,
            fullname: populatedUser.fullname,
            email: populatedUser.email,
            phoneNumber: populatedUser.phoneNumber,
            role: populatedUser.role,
            profile: populatedUser.profile
        };

        return res.status(201)
            .cookie("token", token, COOKIE_OPTIONS)
            .json({
                message: `Account created successfully. Welcome, ${populatedUser.fullname}!`,
                user: userResponse,
                success: true
            });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            message: "Internal server error during registration",
            success: false
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Email, password, and role are required.",
                success: false
            });
        }

        let user = await User.findOne({ email }).populate('profile.company');

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email. Please sign up first.",
                notFound: true,
                success: false
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect password. Please try again.",
                success: false
            });
        }

        if (role !== user.role) {
            return res.status(400).json({
                message: `Account exists, but not with the ${role} role.`,
                success: false
            });
        }

        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200)
            .cookie("token", token, COOKIE_OPTIONS)
            .json({
                message: `Welcome back, ${user.fullname}`,
                user: userResponse,
                success: true
            });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            message: "Internal server error during login",
            success: false
        });
    }
};

export const logout = async (req, res) => {
    try {
        return res.status(200)
            .cookie("token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
            .json({
                message: "Logged out successfully.",
                success: true
            });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            message: "Internal server error during logout",
            success: false
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;

        let cloudResponse;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        let skillsArray;
        if (skills) {
            skillsArray = Array.isArray(skills)
                ? skills
                : skills.split(",").map(s => s.trim()).filter(Boolean);
        }

        const userId = req.id;
        let user = await User.findById(userId).populate('profile.company');

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            });
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;

        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        await user.save();

        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user: userResponse,
            success: true
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            message: "Internal server error during profile update",
            success: false
        });
    }
};