import express from "express"
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getProductsByCategory, getRecommendedProducts, toggleFeaturedProduct } from "../controllers/productController.js"
import { adminRout, protectRout } from "../middleware/authMidleware.js"

const router = express.Router()

router.get('/', protectRout, adminRout, getAllProducts)

router.get('/featured', getFeaturedProducts)

router.get('/recommendations', getRecommendedProducts)

router.get('/category/:category', getProductsByCategory)

router.post('/', protectRout, adminRout, createProduct)

router.patch('/:id', protectRout, adminRout, toggleFeaturedProduct)

router.delete('/:id', protectRout, adminRout, deleteProduct)

export default router
