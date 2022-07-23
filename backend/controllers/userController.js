const User = require("../models/userModel")
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const sendToken = require("../utils/jwtToken")


//Register a User

exports.registerUser = catchAsyncErrors( async(req,res,next)=>{
    const {name, email, password} = req.body

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"this is a sample",
            url:"kjbdwjbjbd"
        }
    })

    sendToken(user,201,res)
})

exports.loginuser = catchAsyncErrors(async (req, res,next)=>{
    const {email, password} = req.body

    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password"))
    }

    const user = await User.findOne({email:email}).select("+password")

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401))
    }

    const isPasswordMatched = user.comparePassword(password)

    if(!user){
        return next(new ErrorHandler("Invalid email or password",401))
    }

    sendToken(user,200,res)
})
