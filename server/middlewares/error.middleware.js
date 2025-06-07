const errorMiddleware = (error, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    const message = error.message || "Something went wrong";

    return res.status(statusCode).json({
        success: false,
        message,
        stack: error.stack
    });
};

export default errorMiddleware;
