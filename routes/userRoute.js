var express = require('express');
var user_route = express.Router();
user_route.use('/node_modules', express.static('./node_modules'));
const userController=require('../controllers/userController')
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
user_route.get('/addtocart/:id',userController.addToCart)
user_route.get('/checkproduct/:id',userController.checkproduct)
user_route.get('/cartDelete',userController.cartDelete)
user_route.patch('/changecount/:id/:count',userController.changeCount)
user_route.get('/addresspage',userController.addressload)
user_route.post('/addAddressprofile',userController.addAddressProfile)
user_route.post('/editCartAddress',userController.editAddress)
user_route.get('/deleteAddress',userController.deleteAddress)
user_route.get('/userprofile',userController.userprofile)
user_route.get('/logout',userController.logout)
user_route.post('/logout',userController.logout)
module.exports=user_route;
