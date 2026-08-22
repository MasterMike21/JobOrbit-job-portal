import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Sent to Candidate on Submission
export const sendApplicationReceivedEmail = async (studentEmail, studentName, jobTitle, companyName) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !studentEmail) return;

        const mailOptions = {
            from: `"JobOrbit Campus Portal" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Application Submitted: ${jobTitle} at ${companyName}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937;">
                    <div style="border-bottom: 2px solid #6A38C2; padding-bottom: 12px; margin-bottom: 20px;">
                        <h2 style="color: #6A38C2; margin: 0; font-size: 22px;">JobOrbit Campus Portal</h2>
                    </div>
                    <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${studentName}</strong>,</p>
                    <p style="font-size: 15px; line-height: 1.6;">Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> through the JobOrbit recruitment drive.</p>
                    <div style="background-color: #f8f4ff; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #ede9fe;">
                        <p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Application Status:</strong> <span style="color: #6A38C2; font-weight: bold;">Under Review</span></p>
                    </div>
                    <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Your academic credentials, verified coursework, and coding profiles are currently being screened by the talent acquisition team.</p>
                    <p style="color: #6b7280; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">Best regards,<br/><strong>JobOrbit Recruitment & Campus Placement Cell</strong></p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Email error (sendApplicationReceivedEmail):", error);
    }
};

// 2. Sent to Candidate on Recruiter Decision (Supports Tailored Recruiter Message & Defaults)
export const sendStatusUpdateEmail = async (studentEmail, studentName, jobTitle, companyName, status, customMessage = "") => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !studentEmail) {
            console.warn("Email aborted: Missing recipient or credentials.");
            return;
        }

        const isAccepted = status.toLowerCase() === "accepted";
        const subject = isAccepted 
            ? `Update: Resume Shortlisted for ${jobTitle} at ${companyName}!` 
            : `Update regarding your application for ${jobTitle} at ${companyName}`;

        const dynamicBody = customMessage && customMessage.trim()
            ? customMessage.replace(/\n/g, "<br/>")
            : (isAccepted 
                ? `We are thrilled to inform you that your resume has cleared primary screening and has been <strong>shortlisted</strong> for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>!<br/><br/><strong>Next Steps & Selection Process:</strong><br/>1. <strong>Round 1: Online Technical Assessment (OA)</strong> — Assessment link will be dispatched shortly.<br/>2. <strong>Round 2: Technical Interview</strong> — Live 1-on-1 coding and systems discussion.<br/>3. <strong>Round 3: Techno-Behavioral / HR Interview</strong>.`
                : `Thank you for taking the time to apply for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> and sharing your academic background with us.<br/><br/>While our hiring team was impressed by your profile, we will not be moving forward with your candidacy for this opening due to high applicant volume and specific role constraints. We encourage you to keep applying for upcoming campus drives on JobOrbit and wish you the very best in your placement journey!`);

        const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937;">
                <div style="border-bottom: 2px solid ${isAccepted ? '#16a34a' : '#6A38C2'}; padding-bottom: 12px; margin-bottom: 20px;">
                    <h2 style="color: ${isAccepted ? '#16a34a' : '#111827'}; margin: 0; font-size: 20px;">
                        ${isAccepted ? 'Congratulations! Application Update 🎉' : 'Application Update'}
                    </h2>
                </div>
                <div style="background-color: ${isAccepted ? '#f0fdf4' : '#f9fafb'}; padding: 18px; border-radius: 8px; margin: 20px 0; border: 1px solid ${isAccepted ? '#bbf7d0' : '#e5e7eb'};">
                    <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #374151;">
                        ${dynamicBody}
                    </p>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    Warm regards,<br/>
                    <strong>${companyName} Talent Acquisition Team</strong><br/>
                    via JobOrbit Campus Portal
                </p>
            </div>
        `;

        const mailOptions = {
            from: `"${companyName} via JobOrbit" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: subject,
            html: emailHtml
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[JobOrbit Mailer] Status update email sent to ${studentEmail} (${info.messageId})`);
    } catch (error) {
        console.error("Email service error (sendStatusUpdateEmail):", error);
    }
};

// 3. Sent to Recruiter on Candidate Submission
export const sendRecruiterAlertEmail = async (recruiterEmail, applicantName, jobTitle, candidateCgpa, branch, collegeName) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !recruiterEmail) return;

        const mailOptions = {
            from: `"JobOrbit Notifications" <${process.env.EMAIL_USER}>`,
            to: recruiterEmail,
            subject: `New Candidate Applied: ${applicantName} for ${jobTitle}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #6A38C2; margin-top: 0;">New Candidate Application Received</h2>
                    <p style="color: #374151; font-size: 14px;">A new applicant has satisfied the screening thresholds for <strong>${jobTitle}</strong>:</p>
                    <div style="background-color: #f8f4ff; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #ede9fe;">
                        <p style="margin: 4px 0; font-size: 13px;"><strong>Candidate:</strong> ${applicantName}</p>
                        <p style="margin: 4px 0; font-size: 13px;"><strong>CGPA:</strong> ${candidateCgpa || "N/A"}</p>
                        ${branch ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Branch:</strong> ${branch}</p>` : ""}
                        ${collegeName ? `<p style="margin: 4px 0; font-size: 13px;"><strong>College:</strong> ${collegeName}</p>` : ""}
                    </div>
                    <p style="color: #374151; font-size: 14px;">Log in to your JobOrbit recruiter dashboard to inspect their full profile, review the resume, and take action.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Email error (sendRecruiterAlertEmail):", error);
    }
};