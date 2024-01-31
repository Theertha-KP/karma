var express = require('express');
var user_route = express.Router();
user_route.use('/node_modules', express.static('./node_modules'));
const userController=require('../controllers/userController')
user_route.get('/',userController.home);
user_route.get('/login',userController.loadLoginPage);
user_route.post('/login',userController.verifyUser);
user_route.get('/registration',userController.loadSignupPage);
user_route.post('/registration',userController.signUpValidation,userController.insertUser,userController.otpGenerator,userController.verifyOtpLoad);
user_route.post('/verifyotp',userController.verifyOtp)

module.exports=user_route;
