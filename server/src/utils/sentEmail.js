import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, message }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "makky.cse@gmail.com",
                pass: "hroc mgye ttai driw"
            }
        });

        const mailOptions = {
            from: "makky.cse@gmail.com",
            to: to,
            subject: subject,
            html: message
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Reset Email sent successfully to ", to);
        return info;
    } catch (error) {
        console.error("Error in sendEmail:", error);
        throw error;
    }
};
