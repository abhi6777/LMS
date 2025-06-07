import appError from '../utils/appError.js';
import jwt from 'jsonwebtoken';

const isLoggedIn = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new appError("Unauthenticated, please login", 401));
    }

    const tokenDetails = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDetails) {
        return next(new appError("Invalid token", 400));
    }

    req.user = tokenDetails;

    next();
};

export { isLoggedIn };
