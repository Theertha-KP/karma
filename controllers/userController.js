const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const otpModal = require("../models/otpModel");
const Product = require("../models/productModel");
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const { ObjectId } = require('mongodb')
// loading login page
const loadLoginPage = async (req, res) => {
    try {
        if (req.session.userStatus) {
            res.redirect('/')
        } else {
            if (req.session.userLoginError)
                var error = "email or password is incorrect"
            req.session.userLoginError = false
            console.log("Login page is loaded");
            // res.set('Cache-Control', 'no-store')
            res.render('user/login', { error })
        }
    } catch (error) {
        console.log("error at loadLoginPage");
        console.log(error.message);
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

//user load home page
const home = async (req, res) => {
    try {
        res.render('user/index', { user: req.session.userData })
    } catch (error) {
        console.log(error.message)

    }

}
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
        console.log(req.session.userData);

        // Send a success response

        next()
    } catch (error) {
        console.log("error at insertuser ");
        console.log(error.message);
        // Send an error response

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
//signup validation
const signUpValidation = async (req, res, next) => {
    try {
        const Email = req.body.email;
        console.log("Sign-up validation loaded succesfully");

        const userData = await User.findOne({ email: Email });

        if (userData && userData.email) {
            console.log("Existing email account with input email");
            return res.render("user/registration", { message: "Email is already taken" });
        } else if (req.body.password.length < 6) {
            console.log("input password is small");
            return res.render("user/registration", { message: "Password is too short" });
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
    console.log(`req body in otp generator`);
    console.log(req.body);

    // const otpDB = new otpModal({
    //     userId: req.session.userData._id,
    //     otp: otp,
    // });
    // console.log("Otp database is created");
    // await otpDB.save();
    await otpModal.updateOne({ userId: req.session.userData._id }, { $set: { otp: otp } }, { upsert: true })

    // console.log(otpDB);
    // console.log("otp from otpdb" + otpDB.otp);
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
    res.redirect('/otp')
}
//Verifying Otp
const verifyOtp = async (req, res, next) => {
    try {
        console.log("verify otp section----");
        console.log(Object.values(req.body).join(""));
        const userInputOtp = Object.values(req.body).join("");
        console.log(req.session);
        const otp = await otpModal.findOne({ userId: req.session.userData._id });
        // const userData = await User.find({});
        console.log(otp.otp);
        console.log(
            `otp verification of userinput otp & otp from otpDb : ${otp.otp == userInputOtp
            }`
        );
        console.log(userInputOtp);
        if (otp.otp == userInputOtp) {
            console.log("same user");
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

//listing product
const productlist = async (req, res, next) => {
    try {

        const productDoc = await Product.find({ isListed: false }).populate("categoryId");
        res.render("user/productlist", { products: productDoc });
    } catch (error) {
        console.log("error at loading add products page");
        console.log(error.message);
    }
}

//logout
const logout = async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    })
}

//singleproduct
const singleproduct = async (req, res, next) => {
    try {
        const _id = new ObjectId(req.params.id);
        console.log(_id);
        const productDoc = await Product.findOne({ _id: _id })
        console.log(productDoc);
        res.render("user/singleproduct", { product: productDoc });
    } catch (error) {
        console.log("error at loading add products page");
        console.log(error.message);
    }
}
const userprofile = async (req, res, next) => {
    try {
        //   const_id=new ObjectId(req.params.id)
        //   const userDoc=await User.findOne({_id:_id})
        res.render("user/userprofile")
    } catch (error) {
        console.log("error at loading add products page");
        console.log(error.message);
    }
}

const resendOTP = async function (req, res, next) {
    try {

        console.log("otp generated ");
        email = req.session.userData.email;
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

//cart 


const cart = async function (req, res, next) {
    try {
        //wraning mesage
        console.log('hai');
        var context = req.app.locals.specialContext
        req.app.locals.specialContext = ""
        //we need an user to logged in to go cart


        const user = new ObjectId(req.session.userData._id)
        console.log(user);

        //getting cart product count
        let cartCount = 0
        if (user) {
            // const cart = await Cart.findOne({ _id:user });
            // // Assuming you want to calculate cartCount based on the user's cart items
            // if (cart) {
            //     cartCount = cart.product.length;
            //     console.log(cartCount + '0000');
            // }
        }

        const cartData = await Cart.aggregate([
            {
                $match: {
                    user: user
                }
            },
            {
                $unwind: "$product"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },{
                $project:{
                    _id:1,
                    user:1,
                    product:1,
                    productDetails:1,
                    total:{$multiply:['$product.count','$productDetails.price']}
                }
            }
        ]).exec()
        console.log(cartData);
        const total=cartData.reduce((acc,val)=>{
            return acc+val.total
        },0)
        res.render('user/cart', { cartData,total })
    }
    catch (error) {
        console.log('Error sending OTP', error);
        // req.flash('fmessage', 'Internal server error');
        return res.json({ success: false, message: 'Internal server error' });
    }
}

//check product in cart
const checkproduct = async (req, res) => {
    try {
        if (req.session.userData) {
            console.log(req.params.id);
            const user = new ObjectId(req.session.userData._id)
            const productId = new ObjectId(req.params.id)

            const cart = await Cart.findOne({ user: user, product: { $elemMatch: { product_id: productId } } })
            console.log(cart);
            if (cart) {
                res.status(200).json({ success: true })
            } else {
                res.status(200).json({ success: false, msg: 'product not found' })
            }
        } else {
            res.status(200).json({ success: false, msg: 'user not found' })
        }

    } catch (error) {
        console.log(error);
    }
}


//add to cart
const addToCart = async (req, res) => {
    try {
        //searching for the user
        if (!req.session.userData) {
            req.app.locals.specialContext = "Please Login"
            return res.redirect('/login')
        }
        const user = req.session.userData._id;
        console.log(user);
        //get the id by the params in a tag
        const productId = new ObjectId(req.params.id)
        //finding the product by the product id
        // const product = await Product.findById(productId)
        // //find the user already exist in the cart
        // console.log(product);
        let userFound = await Cart.findOne({ user })
        console.log(userFound);
        if (!userFound) {
            //creating a new cart
            const newCart = new Cart({
                user,
                product: [{
                    product_id: productId,
                    count: 1
                }]
            })

            await newCart.save();
        } else {
            if(userFound.product.find(product=>productId.equals(product.product_id))){
                return false
            }
            //checking for already existing products in the cart
            await Cart.updateOne({ user }, {
                $push: {
                    product: {
                        product_id: productId, count: 1
                    }
                }
            })

        }

        res.redirect(`/singleproduct/${productId}`)

    } catch (error) {
        console.log(error);
    }
}

//change items count in the cart
// const changeCount = async (req, res) => {
//     try {
//         console.log("changecount");
//         const user = new ObjectId(req.session.userData._id)
//         const productId = new ObjectId(req.params.id)
//         const count=Number(req.params.count)
//         const cart = await Cart.aggregate([
//             { $match: { user: user } },
//             { $unwind: "$product" },
//             { $match: { 'product.product_id': productId } },

//             {
//                 $lookup: {
//                     from: "products",
//                     localField: "product.product_id",
//                     foreignField: "_id",
//                     as: "productDetails"
//                 }
//             },

//             { $unwind: "$productDetails" },

           
//         ]).exec()
//         // console.log(cart);
//         console.log(cart[0].product.count+count);
//         if((cart[0].product.count+count>cart[0].productDetails.quantity&&count>0)||cart[0].product.count+count>5||cart[0].product.count+count<1){
//             return false
//         }
//         const res= await Cart.updateOne({user:user},{
//             $inc:{'product.$[elem].count':count}},{ arrayFilters: [{ "elem.product_id": productId }] })

        
//         console.log(res);

//     } catch (error) {
//         console.log(error);
//     }
// }

const changeCount = async (req, res) => {
    try {
        console.log("changecount");
        const user = new ObjectId(req.session.userData._id)
        const productId = new ObjectId(req.params.id)
        const count=Number(req.params.count)
        const cart = await Cart.aggregate([
            { $match: { user: user } },
            { $unwind: "$product" },
            { $match: { 'product.product_id': productId } },

            {
                $lookup: {
                    from: "products",
                    localField: "product.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },

            { $unwind: "$productDetails" },

           
        ]).exec()
        // console.log(cart);
        console.log(cart[0].product.count+count);
        if((cart[0].product.count+count>cart[0].productDetails.quantity&&count>0)||cart[0].product.count+count>5||cart[0].product.count+count<1){
            return false
        }
        const res= await Cart.updateOne({user:user},{
            $inc:{'product.$[elem].count':count}},{ arrayFilters: [{ "elem.product_id": productId }] })

        
        console.log(res);

    } catch (error) {
        console.log(error);
    }
}





//deleting items in the cart
const cartDelete = async (req, res, next) => {
    try {

        const id = new ObjectId(req.query.productId)
        console.log(id)
        // const product = await Product.findOne({ _id: id })
        // console.log(product);
        const deleteItem = await Cart.findOneAndUpdate({ user: new ObjectId(req.session.userData._id) }, {
            $pull: { product: { product_id: id } }
        })
        console.log(deleteItem);
        res.redirect('/cart')
    } catch (error) {
        console.log(error)
        
    }
}




//deleting items in the cart
// const cartDelete = async (req, res, next) => {
//     try {

//         const id = new ObjectId(req.query.productId)
//         console.log(id)
//         // const product = await Product.findOne({ _id: id })
//         // console.log(product);
//         const deleteItem = await Cart.findOneAndUpdate({ user: new ObjectId(req.session.userData._id) }, {
//             $pull: { product: { product_id: id } }
//         })
//         console.log(deleteItem);
//         res.redirect('/cart')
//     } catch (error) {
//         console.log(error)
        
//     }
// }

//adding cart items from wishlist
exports.addToCartWishlist = async (req, res, next) => {
    try {
        const user = req.session.userData;
        if (!user) {
            req.app.locals.specialContext = "Please Login"
            return res.redirect('/login')
        }
        //get the id by the query in a tag
        const productId = req.query.productId;

        //finding the product by the product
        const product = await Product.findById(productId)

        //find the user already exist in the cart
        let userFound = await Cart.findOne({ user })
        if (!userFound) {
            //creating a new cart
            const newCart = new Cart({
                user,
                product: [{
                    product_id: productId,
                    count: 1,
                    price: product.sellingPrice
                }]
            })
            await newCart.save();
        } else {
            //checking for already existing products in the cart
            await Cart.updateOne({ user }, {
                $push: { product: { product_id: productId, count: 1, price: product.sellingPrice } }
            })
            console.log("pulled from wishlist");
        }


        // Now, remove the product from the wishlist
        //  await Wishlist.updateOne({ _id: user }, {
        //     $pull: { product: { product_id: productId } }
        // });
        await Wishlist.findOneAndUpdate({ user: req.session.userId }, {
            $pull: { product: { product_id: productId } }
        })
        console.log("Item removed");
        res.redirect('/wishlist');

    } catch (error) {
        console.log(error.message);
        error(next)
    }
}
// add address
const addressload = async (req, res, next) => {
    try {
        const user = req.session.userId
        const address = req.session.addresId
        const addressData = await Address.findOne({ user })
        //   console.log(addressData);




        //getting cart product count - badge
        let cartCount = 0
        if (user) {
            const cart = await Cart.findOne({ user });
            // Assuming you want to calculate cartCount based on the user's cart items
            if (cart) {
                cartCount = cart.product.length;
            }
        }
        res.render('addresspage', { addressData, cartCount })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

const addAddressProfile = async (req, res) => {
    try {
        const user = req.session.userData
        // console.log(user);
        const userFound = await Address.findOne({ user })
        //console.log(userFound)
        const { name, phone, address, locality, pincode, city, state } = req.body;
        if (!userFound) {
            console.log("user not found");
            const newAddress = await new Address({
                user,
                address: [{
                    name,
                    phone,
                    address,
                    locality,
                    pincode,
                    city,
                    state
                }]
            })
            await newAddress.save()
            console.log("data saved");
        }
        else {
            console.log("userfound");
            await Address.updateOne({ user }, {
                $push: { address: { name, phone, address, locality, pincode, city, state } }
            })
            console.log("data pushed");
        }
        res.redirect('/addresspage')

    } catch (error) {
        console.log(error);
    }
}


//delete address -profile side side
const deleteAddress = async (req, res, next) => {
    try {
        const user = req.session.userData
        const id = req.query._id;
        console.log(id);
        await Address.findOneAndUpdate({ user, 'address._id': id }, { $pull: { address: { _id: id } } })
        res.redirect('/addresspage')
        console.log("pulled");
    } catch (error) {
        console.log(error);
        next(error)
    }
}

//cvbjtudfyklkignkgjyjkb

//shipping address - get in cart side
exports.shippingAddress = async (req, res, next) => {
    try {

        const user = req.session.userData;
        //console.log(user);


        //getting cart product count - badge
        let cartCount = 0
        if (user) {
            const cart = await Cart.findOne({ user });
            // Assuming you want to calculate cartCount based on the user's cart items
            if (cart) {
                cartCount = cart.product.length;
            }
        }
        const addressData = await Address.findOne({ user })
        // console.log(addressData);
        const cartData = await Cart.findOne({ user }).populate('product.product_id')
        // console.log(cartData);
        let subTotal = cartData?.product.reduce((acc, item) => {
            const totalItem = item.price * item.count;
            return acc + totalItem
        }, 0)

        //coupon
        //  const coupons = await Coupon.find({})
        // console.log('coupons',coupons);
        let total;
        let discount = 0
        const couponFound = await Coupon.findOne({ couponName: cartData?.isCouponApplied })
        console.log('couponFound', couponFound);
        if (couponFound) {
            discount = couponFound.maximumDiscount;
            total = subTotal - couponFound.maximumDiscount
        } else {
            total = subTotal
        }

        res.render('shippingAddress', { addressData, subTotal, cartCount, total, discount })

    } catch (error) {
        console.log(error);
        next(error)
    }
}






//edit adress post - cart side
const editAddress = async (req, res) => {
    try {
        const id = req.body.id;
        const user = req.session.userData
        const { name, phone, address, locality, pincode, city, state } = req.body;
        // console.log(name,phone,address,locality,pincode,city,state);
        await Address.findOneAndUpdate({ user, 'address._id': id }, {
            $set: {
                'address.$.name': name,
                'address.$.phone': phone,
                'address.$.address': address,
                'address.$.locality': locality,
                'address.$.pincode': pincode,
                'address.$.city': city,
                'address.$.state': state,
            }
        })
        res.redirect('/shippingAddress')
        console.log("edited");

    } catch (error) {
        console.log(error);
    }
}



//selecting address
const addressSelector = async (req, res) => {
    try {
        const user = req.session.userData
        // console.log(user)
        const address = req.body.address;
        req.session.addressId = address
        console.log(req.session.addressId);
        return res.redirect('/checkout')

    } catch (error) {
        console.log(error);
    }
}


//payment
const payment = async (req, res) => {
    try {
        const user = req.session.userData
        const payment = req.body.payment
        console.log(payment + "-payment");
        req.session.paymentId = payment

    } catch (error) {
        console.log(error);
    }
}




//editAddress profile
const editAddressProfileLoad = async (req, res, next) => {
    try {
        const user = req.session.userData
        const id = req.query._id;
        console.log(id);
        const address = await Address.findOne({ user }, { address: { $elemMatch: { _id: id } } });
        //   console.log(address);
        res.render('editAddressProfile', { address: address.address[0] })
    } catch (error) {
        console.log(error);
        next(error)
    }
}



//edit address post
const editAddressProfile = async (req, res) => {
    try {
        const id = req.body.id;
        const user = req.session.userData
        const { name, phone, address, locality, pincode, city, state } = req.body;
        // console.log(name,phone,address,locality,pincode,city,state);
        await Address.findOneAndUpdate({ user, 'address._id': id }, {
            $set: {
                'address.$.name': name,
                'address.$.phone': phone,
                'address.$.address': address,
                'address.$.locality': locality,
                'address.$.pincode': pincode,
                'address.$.city': city,
                'address.$.state': state,
            }
        })
        res.redirect('/addresspage')

    } catch (error) {
        console.log(error);

    }
}







//Address in profile
const addAddressProfileLoad = async (req, res, next) => {
    try {
        const user = req.session.userData;

        //getting cart product count
        let cartCount = 0;
        if (user) {
            const cart = await Cart.findOne({ user });
            // Assuming you want to calculate cartCount based on the user's cart items
            if (cart) {
                cartCount = cart.product.length;
            }
        }
        res.render('addAddressProfile', { cartCount })
    } catch (error) {
        console.log(error);
        next(error)
    }
}




module.exports = {
    home,
    loadLoginPage,
    insertUser,
    verifyUser,
    signUpValidation,
    loadSignupPage,
    verifyOtpLoad,
    verifyOtp,
    otpGenerator,
    productlist,
    logout,
    singleproduct,
    userprofile,
    resendOTP,
    cart,
    addToCart,
    checkproduct,
    addressload,
    addAddressProfile,
    deleteAddress,
    editAddress,
    cartDelete,
    changeCount


};