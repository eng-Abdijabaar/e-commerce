import express from 'express';
import { getCoupon, validateCoupon } from '../controllers/couponController.js';
import { protectRout } from '../middleware/authMidleware.js';

const router = express.Router();

router.get('/', protectRout, getCoupon);

router.post('/validate', protectRout, validateCoupon);

export default router;