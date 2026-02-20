import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    avatar: {
        public_id: String,
        url: String
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    accountVerified: {
        type: Boolean,
        default: false
    },

    // ✅ OTP Fields (FIXED)
    verificationCode: String,
    verificationCodeExpires: Date,

    otpAttempts: {
        type: Number,
        default: 0
    },

    otpLastSentAt: Date,

    // Password Reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    borrowedBooks: [
        {
            bookId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Borrow"
            },
            returned: {
                type: Boolean,
                default: false
            },
            booktitle: {
                type: String,
                required: true
            },
            borrowedDate: Date,
            dueDate: Date
        }
    ]

}, { timestamps: true });



userSchema.methods.generateVerificationCode = function () {

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.verificationCode = code;
    this.verificationCodeExpires = Date.now() + 15 * 60 * 1000;

    this.otpAttempts = 0;
    this.otpLastSentAt = Date.now();

    return code;
};

userSchema.methods.generateJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
};

userSchema.methods.generatePasswordResetToken = function () {

    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};
export const User = mongoose.model("User", userSchema)
