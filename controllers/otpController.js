const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const otpModal = require("../models/otpModel");
const { ObjectId } = require('mongodb')


//load otp page
const verifyOtpLoad = async (req, res, next) => {
    try {
        if (req.session.userData) {
            console.log("otp page is loaded succesfully");
            res.render("user/verifyotp");
        } else {
            res.redirect('/registration')
        }

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
    email = req.session.userData.email;
    // checking input email for otp verification NotImp
    console.log("input email is " + email);
    const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
    });
    await otpModal.updateOne({ userId: req.session.userData._id }, { $set: { otp: otp } }, { upsert: true })
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


        }
    });
    res.redirect('/otp')
}

//Verifying Otp
const verifyOtp = async (req, res, next) => {
    try {
        
        const userInputOtp = Object.values(req.body).join("");
        const otp = await otpModal.findOne({ userId: req.session.userData._id });
        console.log(otp.otp);
        if (otp.otp == userInputOtp) {
            await User.updateOne({ _id: req.session.userData._id }, { $set: { is_verified: true } })
            req.session.destroy()
            res.redirect('/login')
        } else {
            res.render('user/verifyotp', { message: 'Incorrect OTP ' })
        }
    } catch (error) {
        console.log(error.message);

    }
};

//resend otp
const resendOTP = async function (req, res, next) {
    try {


        email = req.session.userData.email;
        // checking input email for otp verification NotImp
        console.log("input email is " + email);
        const otp = speakeasy.totp({
            secret: secret.base32,
            encoding: "base32",
        });
    
        const otpDB = new otpModal({
            userId:req.session.userData._id,
            otp: otp,
        });
        await otpDB.save();
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
            }
        });
        // req.flash('fmessage','OTP resend successfully.');
        return res.json({ success: true });
    } catch (error) {
        console.log('Error sending OTP', error);
        // req.flash('fmessage', 'Internal server error');
        return res.json({ success: false, message: 'Internal server error' });

    }
};
//forgetpassword
const forgetpw = async (req, res, next) => {
    try {
        res.render('user/forgetpassword')
    } catch (error) {
        console.log(error);
    }
}

const emailVerify = async (req, res, next) => {
    try {

        const email = req.body.email
        console.log(email);
        const userAc = await User.findOne({ email: email })
        console.log(userAc);
        if (userAc) {
            const otp = speakeasy.totp({
                secret: secret.base32,
                encoding: "base32",
            });
            console.log(`req body in otp generator`);
            console.log(req.body);
            await otpModal.updateOne({ userId: userAc._id }, { $set: { otp: otp } }, { upsert: true })
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


                }
            });
            // if( )
            res.redirect(`/otppage/${userAc}`)
        }


    } catch (error) {
        console.log(error);
    }
}

const otpPage = async (req, res, next) => {
    try {
        const email = req.params.email
        console.log("otp page is loaded succesfully");
        res.render("user/otpverification");


    } catch (error) {
        console.log(error.message);
    }
};


const otpVerification = async (req, res, next) => {
    try {

        console.log(Object.values(req.body).join(""));
        const userInputOtp = Object.values(req.body).join("");
        const userid = req.body.userId
        console.log(userid);
        const otp = await otpModal.findOne({ userId: userid });
        // const userData = await User.find({});
        console.log(otp.otp);
        console.log(
            `otp verification of userinput otp & otp from otpDb : ${otp.otp == userInputOtp
            }`
        );
        console.log(userInputOtp);
        if (otp.otp == userInputOtp) {
            console.log("same user");
            await User.updateOne({ _id: userid }, { $set: { is_verified: true } })
            req.session.destroy()
            res.redirect('/login')
        } else {
            res.render('user/verifyotp', { message: 'Incorrect OTP ' })
        }
    } catch (error) {
        console.log(error.message);

    }
};

const newpassword = async (req, res, next) => {
    try {
        const id = req.params.id
        console.log("otp page is loaded succesfully");
        res.render("user/newpassword", { id });

    } catch (error) {
        console.log(error.message);

    }
}

const saveNewPassword = async (req, res, next) => {
    try {

        const userid = new ObjectId(req.body.userId)
        const newpassword = await bcrypt.hash(req.body.password, saltRounds)
        await User.updateOne({ _id: userid }, { $set: { password: newpassword } })
        res.redirect('/login')

    } catch (error) {
        console.log(error.message);

    }
}
const resendNewotp = async (req, res, next) => {
    try {
        console.log(req.body)
        const userid = new ObjectId(req.body.userId)

        const userAc = await User.findOne({ _id: userid })
        console.log(userAc);
        if (userAc) {
            const otp = speakeasy.totp({
                secret: secret.base32,
                encoding: "base32",
            });
            console.log(`req body in otp generator`);
            console.log(req.body);
            await otpModal.updateOne({ userId: userAc._id }, { $set: { otp: otp } }, { upsert: true })
            const mailOptions = {
                from: "theerthatkp28@gmail.com",
                to: userAc.email,
                subject: "OTP Verification",
                text: `Your OTP for verification is: ${otp}`,
            };

            console.log(otp + "generated otp");
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error.message);
                }
            });
            // if( )
            res.redirect(`/otppage/${userAc._id}`)
        }

    } catch (error) {
        console.log(error.message);

    }



}

module.exports = {
    verifyOtpLoad,
    verifyOtp,
    otpGenerator,
    resendOTP,
    forgetpw,
    emailVerify,
    otpPage,
    otpVerification,
    newpassword,
    saveNewPassword,
    resendNewotp 
}