import Payment from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import appError from "../utils/appError.js";

const getRazorpayApiKey = async (req, res, next) => {
     try {
          res.status(200).json({
               success: true,
               message: "Razorpay Api Key",
               key: process.env.RAZORPAY_KEY_ID
          })
     } catch (error) {
          return next(new appError(error.message, 500));
     };
};

const buySubscription = async (req, res, next) => {
     try {
          const { id } = req.user;
          const user = await User.findById(id);

          if(!user) {
               return next(new appError("Unauthorized Please,Login ", 500));
          };

          if(user.role === "ADMIN") {
               return next(new appError("Admin cannot purchase a subscription", 400));
          };

          const subscription = await razorpay.subscription.create({
               plan_id: process.env.RAZORPAY_PLAN_ID,
               customer_notify: 1
          });

          // update user model with subscription 
          user.subscription.id = subscription.id;
          user.subscription.status = subscription.status;

          await user.save();

          res.status(200).json({
               success: true,
               message: "Subscribed Successful",
          });

     } catch (error) {
          return next(new appError(error.message, 500));
     };
};

const verifySubscription = async (req, res, next) => {
     try {
          const { id } = req.user;
          const user = await User.findById(id);

          if(!user) {
               return next(new appError("unauthorized Access, please Login", 500));
          };

          const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;

          const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(`${razorpay_payment_id}|${razorpay_subscription_id}`);

          if(generatedSignature !== razorpay_signature) {
               return next(new appError("payment not verified pls try again", 500));
          };

          // Record payment details
          await Payment.create({
               razorpay_payment_id,
               razorpay_signature,
               razorpay_subscription_id
          });
          
          // Update user record with subscription status
          user.subscription.status = 'active';
          await user.save();

          res.status(200).json({
               success: true,
               message: "Payment verified Successfully"
          });
          
     } catch (error) {
          return next(new appError(error.message, 500));
     };
};

const cancelSubscription = async (req, res, next) => {
     try {
          const { id } = req.user;
          const user = await User.findById(id);

          if(!user) {
               return next(new appError("Unauthorized access, Login pls", 500));
          };

          if(user.role === 'ADMIN') {
               return next(new appError("Admin cannot cancel Subscription", 403));
          };

          const subscriptionId = user.subscription.id;

          const subscription = await razorpay.subscriptions.cancel(subscriptionId);

          user.subscription.status = subscription.status;

          await user.save();

          res.status(200).json({
               success: true,
               message: "Subscription cancelled"
          });
          
     } catch (error) {
          return next(new appError(error.message, 500));
     };
};

const getAllPayments = async (req, res, next) => {
     try {
          const { count } = req.query;

          const subscription = await razorpay.subscription.all({
               count: count || 10,
          });

          res.status(200).json({
               success: true,
               message: "All Payments",
               payments: subscription
          });
          
     } catch (error) {
          return next(new appError(error.message, 500));
     };
};

export { getRazorpayApiKey, buySubscription, verifySubscription, cancelSubscription, getAllPayments };