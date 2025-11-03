import express from 'express'
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from '../controllers/cartController.js'
import { protectRout } from '../middleware/authMidleware.js'
const router = express.Router()

router.get('/', protectRout, getCartProducts)

router.post('/', protectRout,addToCart)

router.delete('/', protectRout, removeAllFromCart)

router.put('/:id', protectRout, updateQuantity)

export default router