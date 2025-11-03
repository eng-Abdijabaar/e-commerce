import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from"cors";
import path from "path";

import authRoutes from "./routes/auth.js" 
import productRoutes from "./routes/product.js" 
import cartRoutes from "./routes/cartRoutes.js"
import couponsRoutes from "./routes/couponRoutes.js"
import paymentRoutes from "./routes/paymentRouts.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"

import { connectDb } from "./lib/db.js"
dotenv.config()

const app = express()

app.use(express.json({limit: '20mb'}))
app.use(cors())

app.use(cookieParser())

const __dirname = path.resolve()

const PORT = process.env.PORT || 3000

app.use('/api/auth', authRoutes)

app.use('/api/products', productRoutes)

app.use('/api/cart', cartRoutes)

app.use('/api/coupons', couponsRoutes)

app.use('/api/payment', paymentRoutes)

app.use('/api/analytics', analyticsRoutes)

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectDb()
})