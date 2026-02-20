export const sentToken = (user, statusCode, message, res) => {

    const token = user.generateJWTToken();
    const cookieExpireDays = Number(process.env.COOKIE_EXPIRES_TIME) || 3;

    res.cookie("token", token, {
        expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    res.status(statusCode).json({
        success: true,
        message,
        token
    });
};
