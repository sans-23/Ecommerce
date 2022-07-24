const Product = require("../models/productModel")
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const ApiFeatures = require("../utils/apiFeatures")

// Create Product --Admin
exports.createProduct = catchAsyncErrors(async (req, res, next)=>{
    req.body.user = req.user.id
    const product = await Product.create(req.body)

    res.status(201).json({
        success:true,
        product
    })
})
//get All products
exports.getAllProducts = catchAsyncErrors(async (req, res, next)=>{
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter();
    let products = await apiFeature.query;
    let filteredProductsCount = products.length;
    apiFeature.pagination(resultPerPage);
    products = await apiFeature.query.clone();

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
})
//Upate Product --Admin
exports.updateProduct  = catchAsyncErrors(async (req, res, next)=>{
    let product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product not found!", 404))
    }
    product = await Product.findByIdAndUpdate(req.params.id, res.body, {
        new:true, 
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        product
    })
})
//delete product --Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next)=>{
    const product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product not found!", 404))
    }

    await product.remove()

    res.status(200).json({
        success:true,
        message:"product deleted"
    })
})
//get product
exports.getProductDetails = catchAsyncErrors(async (req, res, next)=>{
    const product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product not found!", 404))
    }

    res.status(200).json({
        success:true,
        product
    })
})