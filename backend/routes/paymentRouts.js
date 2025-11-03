import express from "express";

import { protectRout } from '../middleware/authMidleware.js';
import { checkoutSuccess, createCheckoutSession } from "../controllers/paymentController.js";


const router = express.Router();

router.post("/create-checkout-session", protectRout, createCheckoutSession);
router.post("/checkout-success", protectRout, checkoutSuccess);



export default router;