import ErrorHandler from '../middlewares/errorMiddleWares.js';
import { User } from '../models/user.model.js';
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import bcrypt from 'bcryptjs';
import { sentVerificationEmail } from '../utils/sentVerificationCode.js';
import { sentToken } from '../utils/sentToken.js';
import { sendEmail } from '../utils/sentEmail.js';
import { generateForgetPasswordEmailTemplate } from '../utils/emailTemplates.js';
import crypto from 'crypto';
import { log } from 'console';


// ================= REGISTER =================

export const register = catchAsyncError(async (req, res, next) => {

    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
        return next(new ErrorHandler(
            'Please provide name, email and password',
            400
        ));
    }

    let user = await User.findOne({ email });

    if (user && user.accountVerified) {
        return next(new ErrorHandler('User already exists', 400));
    }

    if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            name,
            email,
            password: hashedPassword
        });
    }

    const verificationCode = user.generateVerificationCode();
    await user.save();

    await sentVerificationEmail(user.email, verificationCode);

    res.status(201).json({
        success: true,
        message: 'OTP sent successfully',
        userId: user._id
    });
});

// ================= VERIFY OTP =================

export const verifyEmail = catchAsyncError(async (req, res, next) => {

    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
        return next(new ErrorHandler(
            "Please provide email and verification code",
            400
        ));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.accountVerified) {
        return next(new ErrorHandler("Account already verified", 400));
    }

    if (user.verificationCode !== (verificationCode)) {
        return next(new ErrorHandler("Invalid verification code", 400));
    }

    if (Date.now() > user.verificationCodeExpires) {
        return next(new ErrorHandler("Verification code expired", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    await user.save({ validateModifiedOnly: true });

    sentToken(user, 200, "Account verified successfully", res);
});

// ================= LOGIN =================

export const login = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler(
            "Please provide email and password",
            400
        ));
    }

    const user = await User.findOne({ email, accountVerified: true }).select('+password');

    if (!user) {
        return next(new ErrorHandler(
            'Invalid email or password',
            401
        ));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return next(new ErrorHandler(
            'Invalid email or password',
            401
        ));
    }

    sentToken(user, 200, "Login successful", res);
});

// ================= LOGOUT =================

export const logout = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Already logged out", 400));
    }

    res.status(200)
    .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    .json({
        success: true,
        message: "Logged out successfully"
    });
});

// ================= GETUSER =================

export const getUser = catchAsyncError(async (req, res, next) => {

    const user = req.user;

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

// ================= FORGET_PASSWORD =================

export const forgetPassword = catchAsyncError(async (req, res, next) => {

    if (!req.body.email) {
        return next(new ErrorHandler("Please provide email", 400));
    }

    const user = await User.findOne({ email: req.body.email, accountVerified: true });

    if (!user) {
        return next(new ErrorHandler("Invalid email", 404));
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateModifiedOnly: true });

    const resetPasswordURL = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    const message = generateForgetPasswordEmailTemplate(resetPasswordURL);

    try {
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            message
        });

        res.status(200).json({
            success: true,
            message: `Password reset email sent to ${user.email} successfully`
        });
 
    } catch (error) {
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save({ validateModifiedOnly: true });

        return next(new ErrorHandler("Failed to send email. Please try again later.", 500));
    }
});

// ================= RESET_PASSWORD_UPDATE =================

export const resetPasswordUpdate = catchAsyncError(async (req, res, next) => {

    const { token } = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    

    if (!user) {
        return next(new ErrorHandler("Invalid or expired password reset token", 400));
    }

    if (!req.body.password || !req.body.confirmPassword) {
        return next(new ErrorHandler("Please provide new password and confirm password", 400));
    }
    
    if (req.body.password.length < 8 || 
        req.body.confirmPassword.length < 8 || 
        req.body.password.length > 16 || 
        req.body.confirmPassword.length > 16) {
        return next(new ErrorHandler("Password must be at least 8 characters long and at most 16 characters long", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password and confirm password do not match", 400));
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    sentToken(user, 200, "Password reset successful", res);
});

// ================= PASSWORD_UPDATE =================

export const passwordUpdate = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (!req.body.oldPassword || !req.body.newPassword || !req.body.confirmNewPassword) {
        return next(new ErrorHandler("Please enter all field", 400));
    }

    const isOldPasswordValid = await bcrypt.compare(req.body.oldPassword, user.password);

    if (!isOldPasswordValid) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword.length < 8 || 
        req.body.confirmNewPassword.length < 8 || 
        req.body.newPassword.length > 16 || 
        req.body.confirmNewPassword.length > 16) {
        return next(new ErrorHandler("New password must be at least 8 characters long and at most 16 characters long", 400));
    }

    if (req.body.newPassword !== req.body.confirmNewPassword) {
        return next(new ErrorHandler("New password and confirm new password do not match", 400));
    }

    user.password = await bcrypt.hash(req.body.newPassword, 10);

    await user.save();

    sentToken(user, 200, "Password updated successfully", res);
});