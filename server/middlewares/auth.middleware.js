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

const authorizedRoles = (...roles) => (req, res, next) => {
    const currentRole = req.user.role;

    if(!roles.includes(currentRole)) {
        return next(new appError(`You do  not have permission to access this route`, 403));
    };

    next();
};

const authorizedSubscribers = async(req, res) => {
    const subscriptionStatus = req.user.subscription.status;
    const currentRole = req.user.role;

    if(currentRole !== 'ADMIN' && subscriptionStatus !== 'active') {
        return next(new appError("Please subscribe to access the course", 403));
    };

    next();
};

export { isLoggedIn, authorizedRoles, authorizedSubscribers };
