import { Router } from 'express';
import { getRazorpayApiKey, buySubscription, verifySubscription, cancelSubscription, getAllPayments } from '../controllers/payment.controller.js';
import { isLoggedIn, authorizedRoles } from '../middlewares/auth.middleware.js';


const router = Router();

router.route('/razorpay-key')
     .get(isLoggedIn, getRazorpayApiKey);

router.route('/subscribe')
     .post(isLoggedIn, buySubscription);

router.route('/verify')
     .post(isLoggedIn, verifySubscription);

router.route('/unsubscribe')
     .post(isLoggedIn, cancelSubscription);

router.route('/')
     .get(isLoggedIn, authorizedRoles, getAllPayments);


export default router;