var express = require('express');
var user_route = express.Router();
user_route.use('/node_modules', express.static('./node_modules'));
const userController=require('../controllers/userController')
const otpController=require('../controllers/otpController')
const productController=require('../controllers/productController')
const cartController=require('../controllers/cartController')
const addressController=require("../controllers/addressController")
const orderController=require('../controllers/orderController')
const searchController=require('../controllers/searchController')
const couponController=require('../controllers/couponController')
const userMiddleware=require('../middleware/usermiddleware')
const validation=require('../middleware/validation');
const { checkSchema } = require('express-validator');
//home
user_route.get('/',userController.home);
//login
user_route.get('/login',userController.loadLoginPage);
user_route.post('/login',userController.verifyUser);
//signup
user_route.get('/registration',userController.loadSignupPage);
//verification using otp
user_route.post('/registration',checkSchema(validation.userValidate()),userController.signUpValidation,userController.insertUser,otpController.otpGenerator);
user_route.get('/otp',otpController.verifyOtpLoad)
user_route.post('/verifyotp',otpController.verifyOtp)
user_route.get('/resendotp',otpController.resendOTP)
//product
user_route.get('/shop',productController.productlist)
user_route.get('/singleproduct/:id/:color/:size',productController.singleproduct)
//cart
user_route.get('/cart',cartController.cart)
user_route.post('/addtocart/:id',userMiddleware.checkUser,cartController.addToCart)
user_route.get('/checkproduct/:id',userMiddleware.checkUser,cartController.checkproduct)
user_route.get('/cartDelete',userMiddleware.checkUser,cartController.cartDelete)
user_route.patch('/changecount/:id/:count',userMiddleware.checkUser,cartController.changeCount)
//address
user_route.get('/manageaddress',userMiddleware.checkUser,addressController.addressload)
user_route.get('/addresspage',userMiddleware.checkUser,addressController.newaddress)
user_route.post('/addresssave',userMiddleware.checkUser,addressController.addAddress)
user_route.get('/deleteaddress/:id',userMiddleware.checkUser,addressController.deleteAddress)
user_route.get('/editaddress/:id',userMiddleware.checkUser,addressController.editAddress)
user_route.post('/updateaddress/:address_id/:user_id',userMiddleware.checkUser,addressController.updateAddress)
//profile
user_route.get('/userprofile',userMiddleware.checkUser,userController.userprofile)
user_route.post('/saveuser',checkSchema(validation.userProfileValidate()),userMiddleware.checkUser,userController.updateUser)
//order
user_route.get('/checkout',userMiddleware.checkUser,orderController.checkoutPage)
user_route.post('/cashondelivery',userMiddleware.checkUser,orderController.cashOnDelivery)
user_route.get('/orderstatus',userMiddleware.checkUser,orderController.orderPage)
user_route.get('/orders',userMiddleware.checkUser,orderController.orders)
// user_route.get('/fetchProductDetails/:orderId',userMiddleware.checkUser,orderController.fetchProducts)
user_route.get('/orderedproducts/:orderId',userMiddleware.checkUser, orderController.orderedProducts);
user_route.post('/razorpay',userMiddleware.checkUser,orderController.razorpay)
user_route.post('/cancelOrder',userMiddleware.checkUser,orderController.cancelOrder)
user_route.post('/verifyRazorpay',userMiddleware.checkUser,orderController.verifyRazorpay)
//logout
user_route.get('/logout',userController.logout)
//forgetpassword
user_route.get('/forgetpassword',otpController.forgetpw)
user_route.post('/verifyemail',otpController.emailVerify)
user_route.get('/otppage',otpController.otpPage)
user_route.post('/otpverification/:userId',otpController.otpVerification)
user_route.get('/newpassword/:id',otpController.newpassword)
user_route.post('/savepassword',otpController.saveNewPassword)
user_route.post('/resendnewotp',otpController.resendNewotp)
//search
user_route.post('/search',searchController.searchItem)
//coupons
user_route.get('/coupons',userMiddleware.checkUser,couponController.couponList)
user_route.get('/applycoupon/:id',userMiddleware.checkUser,couponController.applyCoupon)
user_route.get('/removecoupon',userMiddleware.checkUser,couponController.removeCoupon)
//wallet
user_route.get('/walletbalance',userMiddleware.checkUser,userController.walletBalance)
user_route.post('/walletapply',userMiddleware.checkUser,userController.walletApply)


module.exports=user_route;
