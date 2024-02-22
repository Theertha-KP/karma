var express = require('express');
var user_route = express.Router();
user_route.use('/node_modules', express.static('./node_modules'));
const userController=require('../controllers/userController')
const userMiddleware=require('../middleware/usermiddleware')
user_route.get('/',userController.home);
user_route.get('/login',userController.loadLoginPage);
user_route.post('/login',userController.verifyUser);
user_route.get('/registration',userController.loadSignupPage);
user_route.post('/registration',userController.signUpValidation,userController.insertUser,userController.otpGenerator);
user_route.get('/otp',userController.verifyOtpLoad)
user_route.post('/verifyotp',userController.verifyOtp)
user_route.get('/resendotp',userController.resendOTP)
user_route.get('/shop',userController.productlist)
user_route.get('/singleproduct/:id',userController.singleproduct)
user_route.get('/cart',userController.cart)
user_route.get('/addtocart/:id',userMiddleware.checkUser,userController.addToCart)

user_route.get('/checkproduct/:id',userController.checkproduct)
user_route.get('/cartDelete',userController.cartDelete)
user_route.patch('/changecount/:id/:count',userController.changeCount)
//order
user_route.get('/checkout/:id',userMiddleware.checkUser,userController.checkoutPage)
user_route.get('/orderstatus',userMiddleware.checkUser,userController.orderPage)
user_route.post('/cashondelivery',userMiddleware.checkUser,userController.cashOnDelivery)

user_route.get('/manageaddress',userMiddleware.checkUser,userController.addressload)
user_route.get('/addresspage',userMiddleware.checkUser,userController.newaddress)
user_route.post('/addresssave',userMiddleware.checkUser,userController.addAddress)
user_route.get('/deleteaddress/:id',userMiddleware.checkUser,userController.deleteAddress)
//
user_route.get('/editaddress/:id',userMiddleware.checkUser,userController.editAddress)
user_route.post('/updateaddress/:address_id/:user_id',userMiddleware.checkUser,userController.updateAddress)

user_route.get('/userprofile',userController.userprofile)
user_route.get('/logout',userController.logout)
user_route.post('/logout',userController.logout)
module.exports=user_route;
