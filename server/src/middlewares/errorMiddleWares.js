class ErrorHandler extends Error {
    constructor(message = "Something went wrong", statusCode) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorMiddleWare = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    if (err.code === 11000) {
        err = new ErrorHandler("Duplicate Field Value Entered", 400);
    }

    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map(
            (value) => value.message
        );
        err = new ErrorHandler(messages.join(", "), 400);
    }

    if (err.name === "JsonWebTokenError") {
        err = new ErrorHandler("Json Web Token is invalid. Try again", 401);
    }

    if (err.name === "TokenExpiredError") {
        err = new ErrorHandler("Json Web Token is expired. Try again", 401);
    }

    if (err.name === "CastError") {
        err = new ErrorHandler(`Resource not found. Invalid: ${err.path}`, 400);
    }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};

export default ErrorHandler;
