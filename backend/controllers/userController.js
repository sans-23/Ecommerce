const User = require("../models/userModel")
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")

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

    if(!email || !password) return next(new ErrorHandler("Please enter email and password"))
    const user = await User.findOne({email:email}).select("+password")

    if(!user) return next(new ErrorHandler("Invalid email or password",401))
    const isPasswordMatched = user.comparePassword(password)

    if(!isPasswordMatched) return next(new ErrorHandler("Invalid email or password",401))
    sendToken(user,200,res)
})

exports.logout = catchAsyncErrors(async (req,res,next)=>{
    res.cookie("token", null, {
        expire :new Date(Date.now()),
        httpOnly: true,
    })
    res.status(200).json({
        success:true,
        message: "Logged Out",
    })
})

exports.forgotPassword = catchAsyncErrors(async (req,res,next)=>{
    const user = await User.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorHandler("User not Found", 404))
    }

    // Get RESETPASSWORD TOKEN
    const resetToken  = user.getResetPasswordToken()

    await user.save({validateBeforeSave:false})

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
    console.log(resetPasswordUrl)
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`

    try{
        await sendEmail({
            email : user.email,
            subject : `Ecommerce Password Recovery`,
            message
        })
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
        })
    }catch(error){
        // user.resetPasswordToken = undefined
        // user.resetPasswordExpire = undefined
        // await user.save({validateBeforeSave:false})
        return next(new ErrorHandler(error.message, 500))
    }
})

exports.resetPassword = catchAsyncErrors(async (req,res,next)=>{
    //creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt : Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Reset Password token is invalid or has been expired", 404))
    }

    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("Password doesn't match", 404))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200, res)
})
