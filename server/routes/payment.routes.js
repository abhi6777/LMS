import { Router } from 'express';
import { getRazorpayApiKey, buySubscription, verifySubscription, cancelSubscription, getAllPayments } from '../controllers/payment.controller.js';


const router = Router();

router.route('/razorpay-key')
     .get(getRazorpayApiKey);

router.route('/subscribe')
     .post(buySubscription);

router.route('/verify')
     .post(verifySubscription);

router.route('/unsubscribe')
     .post(cancelSubscription);

route.route('/')
     .get(getAllPayments);


export default router;