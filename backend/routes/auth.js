import express from "express"
import { getProfile, login, logout, refreshToken, signup,  } from "../controllers/authController.js"
import { protectRout} from "../middleware/authMidleware.js";
const router = express.Router()

router.post('/login', login);

router.post('/signup', signup);

router.post('/logout', logout);

router.post('/refresh-token', refreshToken)

router.get('/profile', protectRout, getProfile)

export default router