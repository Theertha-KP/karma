const User = require("../models/userModel");

const checkUser = async (req, res, next) => {
    if (req.session.userData) {
        const email = req.session.userData.email;
        const userData = await User.findOne({ email: email });

        if (!userData.is_blocked) {
            next();
        } else {
            // Set a flash message and redirect to login
            req.flash('message', 'Your account is blocked. Please contact support for assistance.');
            res.redirect('/logout');
        }
    } else {
        res.redirect('/login');
    }
};

module.exports = {
    checkUser
};
