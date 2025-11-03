import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protectRout = async (req, res, next) =>{
    try {
        const accessToken = req.cookies.accessToken

        if(!accessToken) {
            return res.status(401).json({message: "Unauthorized - No access token provided!"})
        }

        try {
            
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN)

        const user = await User.findById(decoded.id).select("-password")

        if(!user) {
            return res.status(401).json({message: "Unauthorized - User not found!"})
        }

        req.user = user
        
        next()

        } catch (error) {

            if(error.name === "TokenExpiredError") {
                return res.status(401).json({message: "Unauthorized - Token expired!"})
        }

        throw error
    }

    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Server Error", error: error.message})
    }
}

export const adminRout = (req, res, next) => {
    if(req.user && req.user.role === "admin") {
        next()
    }
    else {
        res.status(403).json({message: "Forbidden - Admins only!"})
    }
}