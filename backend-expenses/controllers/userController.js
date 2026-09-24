const jwt = require('jsonwebtoken')
const User = require("../models/userSchema")
const bcrypt = require("bcrypt")
const asyncHandler = require("express-async-handler")

const register = asyncHandler(async (req, res) => {
    const { userName, email, password } =  req.body
    if (!userName || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!")
    }
    const userAvailable = await User.findOne({ where: { email: email.trim().toLowerCase() } })
    if (userAvailable) {
        res.status(400)
        throw new Error("User already registered!");
    }
    const hashedPass = await bcrypt.hash(password, 10);
    console.log("hashed password: ", hashedPass);
    const user = await User.create({
        userName: userName,
        email: email,
        password: hashedPass
    })
    console.log("User created", user);
    if (user) {
        res.status(201).json({ userName: user.userName, email: user.email });
    }
    else {
        res.status(400).json("The data is incorrect");
    }
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!")
    }
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } })
    if (!user) {
        res.status(400)
        throw new Error("User not registered!");
    }
    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
            {
                user: {
                    _id: user.id,
                    userName: user.userName,
                    email: user.email
                }
            },
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        )
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24*60*60*1000,
        })
        res.json({token: token, user: user.email})
    }
    else{
        res.status(400);
        throw new Error("Email or password is incorrect!")
    }
})

const logout = asyncHandler(async(req, res)=>{
    res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
    res.status(200).json({ message: "Logged out" });
})

const info = asyncHandler(async(req, res)=>{
    console.log(req.cookies.token);
    if(!req.user) {
        return res.status(400).json("User is not authorized!")
    }
    res.status(200).json({
        _id: req.user._id,
        userName: req.user.userName,
        email: req.user.email,
    });
})

module.exports = { register, login, info, logout}