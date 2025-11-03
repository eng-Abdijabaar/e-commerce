import User from "../models/User.js"
import jwt from "jsonwebtoken"
import { redis } from "../lib/redis.js"


//generate tokens
const generateTokens = (id) => {
    const accessToken = jwt.sign({id}, process.env.ACCESS_TOKEN, {expiresIn: '15m'})
    const refreshToken = jwt.sign({id}, process.env.REFRESH_TOKEN, {expiresIn: '7d'})

    return {accessToken, refreshToken}
}

//store refresh token
const storeRefreshToken = async (id,refreshToken) => {
    await redis.set(`refresh_token:${id}`, refreshToken, 'EX', 7*24*60*60)
}

//set cookies
const setCookie = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true, //prevent xss attacks. cross site scripting
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', // prevent csrf attacks. cross site request forgery
        maxAge: 15 * 60 * 1000 // 15 minutes
    })

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, //prevent xss attacks. cross site scripting
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', // prevent csrf attacks. cross site request forgery
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
}

//signup
export const signup =  async (req, res) => {

    const {name, email, password} = req.body

    try {

        //check if user exists
        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.status(400).json({message: 'User already exists'})
        }

        //create user
        const user = await User.create({name, email, password})

        //generate tokens
        const {accessToken, refreshToken} = generateTokens(user._id)

        //store refresh token
        await storeRefreshToken(user._id, refreshToken)

        // set cookies
        setCookie(res, accessToken, refreshToken)

        res.status(201).json({message: 'User created successfully', user:{
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }})

    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
}

//login
export const login =  async (req, res) => {
    try {
        const {email, password} = req.body

        const user = await User.findOne({email})

        if(user && (await user.comparePassword(password))) {
            const {accessToken, refreshToken} = generateTokens(user._id)

            await storeRefreshToken(user._id, refreshToken)

            setCookie(res, accessToken, refreshToken)

            res.status(200).json({message: 'User logged in successfully', user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }})
        }else{
            res.status(400).json({message: 'Invalid credentials'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'User login failed', error: error.message})
    }
}

//logout
export const logout =  async (req, res) => {
    try {
       const refreshToken = req.cookies.refreshToken
       if(refreshToken) {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN)
        await redis.del(`refresh_token:${decoded.id}`)
       }
       res.clearCookie('accessToken')
       res.clearCookie('refreshToken')
       res.status(200).json({message: 'User logged out successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'User logout failed', error: error.message})
    }
}

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if(!refreshToken) {
            return res.status(401).json({message: 'no refresh token found!'})
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN)

        const storedRefreshToken = await redis.get(`refresh_token:${decoded.id}`)

        if(storedRefreshToken !== refreshToken) {
            return res.status(401).json({message: 'Invalid refresh token'})
        }

        const accessToken = jwt.sign({id: decoded.id}, process.env.ACCESS_TOKEN, {expiresIn: '15m'})

        res.cookie('accessToken', accessToken, {
            httpOnly: true, //prevent xss attacks. cross site scripting
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict', // prevent csrf attacks. cross site request forgery
            maxAge: 15 * 60 * 1000 // 15 minutes
        })

        res.status(200).json({message: 'token refresh successfully'})

    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'token refresh failed', error: error.message})
    }
}

export const getProfile = async(req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({message: 'Fetching profile failed', error: error.message})
    }
}
