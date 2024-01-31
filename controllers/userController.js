const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const otpModal = require("../models/otpModel");
const userModal = require("../models/userModel");

// loading login page
const loadLoginPage = async (req, res) => {
    try {
        console.log("Login page is loaded");
        res.render('./user/login', { message: req.session.message })
    } catch (error) {
        console.log("error at loadLoginPage");
        console.log(error.message);
    }
};
// loading registration page
const loadSignupPage = async (req, res) => {
    try {
        console.log("Signup page is loaded");
        res.render("./user/registration");
    } catch (error) {
        console.log("error at loadSignupPage ");
        console.log(error.message);
    }
};

//user load home page
const home = async (req, res) => {
    try {
        const user = req.user || null;
        res.locals.user = user;
        console.log(user)
        if (req.user) {
            res.render('user/index', { user: true, message: `hai, ${user}` })
        } else {
            res.render('user/index', { user: false, message: "please login" })
        }
    } catch (error) {
        console.log(error.message)
 
    }

}
//inserting users 
const insertUser = async (req, res, next) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            gender: req.body.gender,
            password: req.body.password,
            mobile: req.body.mobile,
            isVerified: false,
        });
        // checking session exists or not
        req.session ? console.log("session exists") : console.log("session error");

        req.session.userData = user;
        const userData = await user.save();
        console.log(req.session.userData);

        // Send a success response
        res.status(200).json({ message: "User inserted successfully!" });
    } catch (error) {
        console.log("error at insertuser ");
        console.log(error.message);
        // Send an error response
        res.status(500).json({ error: "Internal server error" });
    }
};

//verifying users

const verifyUser = async (req, res) => {
    try {

        const userData = await User.findOne({ email: req.body.email, password: req.body.password });
        console.log("User verfifcation went successfull");
        if (userData) {
            console.log(userData);
            req.session.user = User;
            res.redirect('/')
        } else {
           if(req.session.userLoginError){
            var error='Invalid useranme or password '
            req.session.userLoginError=false
           }
            res.render("./user/login");
        }
    } catch (error) {
        console.log("error at verifyUser login  ");
        console.log(error);
        req.session.message = 'Internal server error';
        res.redirect('/login');
    }
};
//signup validation
const signUpValidation = async (req, res, next) => {
    try {
        const Email = req.body.email;
        console.log("Sign-up validation loaded succesfully");

        const userData = await User.findOne({ email: Email });

        if (userData && userData.email) {
            console.log("Existing email account with input email");
            return res.render("./user/registration", { message: "Email is already taken" });
        } else if (req.body.password.length < 8) {
            console.log("input password is small");
            return res.render("./user/registration", { message: "Password is too short" });
        } else {
            console.log("Signup validation went succesfull");
            next();
        }
    } catch (error) {
        console.log("error at signup Validation ");
        console.error(error.message);
        return res.status(500).send("Internal Server Error");
    }
};
//load otp page
const verifyOtpLoad = async (req, res, next) => {
    try {
        console.log("otp page is loaded succesfully");
        res.render("./user/verifyotp");

    } catch (error) {
        console.log(error.message);
    }
};

//   nodemailer

require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.useremail,
        pass: process.env.password,
    },
});

const secret = speakeasy.generateSecret({ length: 20 });
//send otp

const otpGenerator = async (req, res, next) => {
    console.log("otp generated ");
    email = req.body.email;
    // checking input email for otp verification NotImp
    console.log("input email is " + email);
    const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
    });
    console.log(`req body in otp generator`);
    console.log(req.body);

    const otpDB = new otpModal({
        userId: req.session.userData._id,
        otp: otp,
    });
    console.log("Otp database is created");
    await otpDB.save();
    console.log(otpDB);
    console.log("otp from otpdb" + otpDB.otp);
    const mailOptions = {
        from: "theerthatkp28@gmail.com",
        to: email,
        subject: "OTP Verification",
        text: `Your OTP for verification is: ${otp}`,
    };

    console.log(otp + "generated otp");
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error.message);

            return res.status(500).json({ error: "Failed to send OTP" });
        }
    });
    // if( )
    next();
}
//Verifying Otp
const verifyOtp = async (req, res, next) => {
    try {
        console.log("verify otp section----");
        console.log(Object.values(req.body).join(""));
        const userInputOtp = Object.values(req.body).join("");
        console.log(req.session);
        const otp = await otpModal.findOne({ userId: req.session.userData._id });
        const userData = await userModal.find({});
        console.log(otp.otp);
        console.log(
            `otp verification of userinput otp & otp from otpDb : ${otp.otp == userInputOtp
            }`
        );
        if (otp.otp == userInputOtp) {
            console.log("sameuser");
            res.redirect('/')
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    home,
    loadLoginPage,
    insertUser,
    verifyUser,
    signUpValidation,
    loadSignupPage,
    verifyOtpLoad,
    verifyOtp,
    otpGenerator
};