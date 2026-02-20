import {catchAsyncError} from "./catchAsyncError.js";
import jwt from "jsonwebtoken";
import ErrorHandler from '../middlewares/errorMiddleWares.js';
import { User } from "../models/user.model.js";
export const isAuthenticated = catchAsyncError(async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
});