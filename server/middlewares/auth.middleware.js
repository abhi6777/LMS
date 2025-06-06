const appError = require("../utils/appError");
const jwt = require("jsonwebtoken");

const isLoggedIn = function(req, res, next) {
     const { token } = req.cookies;

     if(!token) {
          return next(new appError("unauthenticated, please login: ", 401));
     };

     const tokenDetails = jwt.verify(token, process.env.JWT_SECRET);
     if(!tokenDetails) {
          return next(new appError("No token found: ", 400));
     };

     req.user = tokenDetails;

     next();
}

module.exports = {
     isLoggedIn
}