const User = require("../models/userModel");
const bcrypt = require('bcrypt')
const saltRounds = 10;
const { ObjectId } = require('mongodb')

//user load home page
const home = async (req, res) => {
    try {
        res.render('user/index', { user: req.session.userData })
    } catch (error) {
        console.log(error.message)

    }
}

// loading login page
const loadLoginPage = async (req, res) => {
    try {
        if (req.session.userStatus) {
            res.redirect('/')
        } else {
            if (req.session.userLoginError)
                var error = "email or password is incorrect"
            req.session.userLoginError = false
            const messages = req.flash('message')
            res.render('user/login', { error, messages })
        }

    } catch (error) {
        console.log("error at loadLoginPage");
        console.log(error.message);
    }
};

//verify user

const verifyUser = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email });
        console.log("User verfifcation went successfull");
        console.log(userData);
        if (userData) {
            const match = await bcrypt.compare(req.body.password, userData.password);
            if (match) {

                if (!userData.is_blocked && userData.is_verified) {
                    req.session.userData = userData
                    req.session.userStatus = true
                    res.redirect('/')
                } else {
                    req.session.userLoginError = true
                    req.flash('message', 'Your account is blocked. Please contact support for assistance.')
                    res.redirect("/login")
                }
            } else {
                req.session.userLoginError = true
                res.redirect("/login")
            }
        } else {
            req.session.userLoginError = true
            res.redirect("/login")
        }
    } catch (error) {
        console.log("error at verifyUser login");
        console.log(error);
    }
};

// loading registration page
const loadSignupPage = async (req, res) => {
    try {
        if (req.session.userStatus) {
            res.redirect('/')
        } else {
            console.log("Signup page is loaded");
            res.render("./user/registration");
        }
    } catch (error) {
        console.log("error at loadSignupPage ");
        console.log(error.message);
    }
};

//signup validation
const signUpValidation = async (req, res, next) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.log(result.array());
            return res.render('user/registration', { message: result.array()[0].msg });
        }
        const Email = req.body.email;
        const userData = await User.findOne({ email: Email });
        if (userData && userData.email) {
            return res.render("user/registration", { message: "Email already exist" });
        } else {
            next();
        }
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
};

//inserting users 
const insertUser = async (req, res, next) => {
    try {
        //hash
        const hash = await bcrypt.hash(req.body.password, saltRounds)
        const user = new User({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            gender: req.body.gender,
            password: hash,
            mobile: req.body.mobile,
            isVerified: false,
        });
        // checking session exists or not
        req.session ? console.log("session exists") : console.log("session error");
        req.session.userData = user;
        const userData = await user.save();
        next()
    } catch (error) {
        console.log(error.message);

    }
};





//logout
const logout = async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    })
}


const userprofile = async (req, res, next) => {
    try {
        res.render("user/userprofile", { user: req.session.userData })
    } catch (error) {
        console.log("error at loading add products page");
        console.log(error.message);
    }
}
const updateUser = async (req, res, next) => {
    try {
        const user = req.session.userData._id
        const userDoc = await User.findOne({ _id: user })
        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.log(result.array());
            return res.render('user/userprofile', { userDoc, message: result.array()[0].msg });
        }

        console.log(req.body);
        const updatedUser = await User.updateOne({ _id: user }, {
            $set: {
                fname: req.body.fname,
                lname: req.body.lname,
                gender: req.body.gender,
                mobilenumber: req.body.mobilenumber
            }

        })
        console.log(updatedUser);
        res.redirect('/userprofile')
    } catch (error) {
        console.log(error);
    }
}
const loadUserDashboard = async (req, res) => {
    try {
        userData = await User.find({});
        console.log(userData);
        // const order = await Order.find({ user: userData._id })
        // console.log(order);
        res.render("admin/users/userdashboard", { admin: true, user: userData });

    } catch (error) {
        console.log("error at loading user dashboard");
        console.log(error.message);
    }
};

const blockUser = async (req, res) => {
    try {
        const userId = new ObjectId(req.params.id);
        console.log(userId);
        const userData = await User.updateOne(
            { _id: userId },
            { $set: { is_blocked: true } }
        );
        console.log(userData);
        res.redirect("/admin/userdashboard");
    } catch (error) {
        console.log("error at blocking user");
        console.log(error.message);
    }
};
const unblockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = await User.findByIdAndUpdate(
            { _id: userId },
            { $set: { is_blocked: false } }
        );
        console.log(`${userData.name} has been succesfully unblocked`);
        res.redirect("/admin/userdashboard");
    } catch (error) {
        console.log("error at unblocking user");
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
    logout,
    userprofile,
    updateUser,
    loadUserDashboard,
    blockUser,
    unblockUser,

}