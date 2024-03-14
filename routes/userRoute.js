var express = require('express');
var user_route = express.Router();
user_route.use('/node_modules', express.static('./node_modules'));
const userController=require('../controllers/userController')
const userMiddleware=require('../middleware/usermiddleware')
const validation=require('../middleware/validation');
const { checkSchema } = require('express-validator');
user_route.get('/',userController.home);
user_route.get('/login',userController.loadLoginPage);
user_route.post('/login',userController.verifyUser);
user_route.get('/registration',userController.loadSignupPage);
user_route.post('/registration',checkSchema(validation.userValidate()),userController.signUpValidation,userController.insertUser,userController.otpGenerator);
user_route.get('/otp',userController.verifyOtpLoad)
user_route.post('/verifyotp',userController.verifyOtp)
user_route.get('/resendotp',userController.resendOTP)
user_route.get('/shop',userController.productlist)
user_route.get('/singleproduct/:id',userController.singleproduct)
user_route.get('/cart',userMiddleware.checkUser,userController.cart)
user_route.get('/addtocart/:id',userMiddleware.checkUser,userController.addToCart)

user_route.get('/checkproduct/:id',userMiddleware.checkUser,userController.checkproduct)
user_route.get('/cartDelete',userMiddleware.checkUser,userController.cartDelete)
user_route.patch('/changecount/:id/:count',userMiddleware.checkUser,userController.changeCount)
//order
user_route.get('/checkout',userMiddleware.checkUser,userController.checkoutPage)
user_route.get('/orderstatus',userMiddleware.checkUser,userController.orderPage)
user_route.post('/cashondelivery',userMiddleware.checkUser,userController.cashOnDelivery)
user_route.get('/orders',userMiddleware.checkUser,userController.orders)

user_route.get('/manageaddress',userMiddleware.checkUser,userController.addressload)
user_route.get('/addresspage',userMiddleware.checkUser,userController.newaddress)
user_route.post('/addresssave',userMiddleware.checkUser,userController.addAddress)
user_route.get('/deleteaddress/:id',userMiddleware.checkUser,userController.deleteAddress)
//
user_route.get('/editaddress/:id',userMiddleware.checkUser,userController.editAddress)
user_route.post('/updateaddress/:address_id/:user_id',userMiddleware.checkUser,userController.updateAddress)

user_route.get('/userprofile',userMiddleware.checkUser,userController.userprofile)
user_route.post('/saveuser',checkSchema(validation.userProfileValidate()),userMiddleware.checkUser,userController.updateUser)
user_route.get('/logout',userController.logout)

//forgetpassword
user_route.get('/forgetpassword',userController.forgetpw)
user_route.post('/verifyemail',userController.emailVerify)
user_route.get('/otppage/:id',userController.otpPage)
user_route.post('/otpverification',userController.otpVerification)
user_route.get('/newpassword/:id',userController.newpassword)
user_route.post('/savepassword',userController.saveNewPassword)
user_route.post('/resendnewotp',userController.resendNewotp)

//search
user_route.post('/search',userController.searchItem)
//coupons
user_route.get('/coupons',userMiddleware.checkUser,userController.couponList)
user_route.get('/applycoupon/:id',userMiddleware.checkUser,userController.applyCoupon)

module.exports=user_route;
