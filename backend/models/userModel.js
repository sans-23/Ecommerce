const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter Your name"],
        maxLength:[30, "Max lenght 30 character"],
        minLength:[4, "Name should be atleast 4 character long"]
    },
    email:{
        type:String,
        required:[true, "Please enter Your email"],
        unique:true,
        validate:[validator.isEmail, "Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true, "Please enter Your password"],
        minLength:[8, "Password should be atleast 4 character long"],
        select:false,
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:String,
})

//function keyword for acessing "this"
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

//JWT Token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    })
}

//compare Password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model("User", userSchema)