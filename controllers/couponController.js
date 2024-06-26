const Coupons = require('../models/couponModel')
const Cart = require('../models/cartModel')
const { ObjectId } = require('mongodb')
const couponList = async (req, res, next) => {
    try {
        const coupons = await Coupons.find({})
        console.log(coupons);
        res.render('user/coupon', { coupons: coupons })

    } catch (error) {
        console.log(error.message);

    }
}



const applyCoupon = async (req, res, next) => {
    try {

        const user = new ObjectId(req.session.userData._id);
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
                    from: "productvarients",
                    localField: "product.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productDetails.product_id",
                    foreignField: "_id",
                    as: "mainproduct"
                }
            },
            {
                $unwind: "$mainproduct"
            },
            {
                $lookup: {
                    from: "offers",
                    let: { productId: "$productDetails.product_id", categoryId: "$mainproduct.categoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{
                                        $or: [
                                            { $in: ["$$productId", "$applicables"] },
                                            { $in: ["$$categoryId", "$applicables"] },
                                        ]
                                    },
                                    { $gte: ["$endDate", new Date()] }
                                    ]
                                }
                            }
                        },
                        {
                            $sort: { discount: -1 }
                        },
                        {
                            $group: {
                                _id: "$offerType",
                                highestDiscountOffer: { $first: "$$ROOT" }
                            }
                        },
                        {
                            $replaceRoot: { newRoot: "$highestDiscountOffer" }
                        }
                    ],
                    as: "offers"
                }
            },
            {
                $project: {
                    "product": 1,
                    "productDetails": 1,
                    "mainproduct": 1,
                    offers: 1,
                    "price": {
                        $ifNull: [
                            {
                                $subtract: [
                                    "$productDetails.cost",
                                    {
                                        $max: {
                                            $map: {
                                                input: "$offers", // Iterate over the offers array
                                                as: "offer",
                                                in: {
                                                    $cond: {
                                                        if: { $eq: ["$$offer.discountType", "Percent"] }, // Check if offer type is "percentage"
                                                        then: {
                                                            $multiply: [
                                                                "$$offer.discount", // Percentage value
                                                                { $divide: ["$productDetails.cost", 100] } // Convert percentage to a decimal
                                                            ]
                                                        },
                                                        else: "$$offer.discount" // Use the discount amount as is
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            "$productDetails.cost"
                        ]
                    },
                    "totalPrice": {
                        $ifNull: [
                            {
                                $subtract: [
                                    { $multiply: ["$product.count", "$productDetails.cost"] },
                                    {
                                        $multiply: [
                                            {
                                                $max: {
                                                    $map: {
                                                        input: "$offers", // Iterate over the offers array
                                                        as: "offer",
                                                        in: {
                                                            $cond: {
                                                                if: { $eq: ["$$offer.discountType", "Percent"] }, // Check if offer type is "percentage"
                                                                then: {
                                                                    $multiply: [
                                                                        "$$offer.discount", // Percentage value
                                                                        { $divide: ["$productDetails.cost", 100] } // Convert percentage to a decimal
                                                                    ]
                                                                },
                                                                else: "$$offer.discount" // Use the discount amount as is
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            "$product.count"
                                        ]
                                    }
                                ]
                            },
                            { $multiply: ["$product.count", "$productDetails.cost"] }// If totalPrice is null, set it to zero
                        ]
                    }
                }

            },
        ]).exec()

        console.log(cartData);
        let totalAmount = cartData.reduce((acc, val) => {
            return acc + val.totalPrice
        }, 0)
        console.log(totalAmount);
        console.log('applycoupon');
        const coupon_id = req.params.id;
        console.log(coupon_id + "coupon id");
        let date = new Date()
        const couponFound = await Coupons.findOne({ couponId: coupon_id });
        console.log('coponFound', couponFound);

        if (!couponFound) {
            res.json({ success: false, message: 'Invalid coupon' });
            return; // Exit the function early
        }

        // Fetch discount type from couponFound object or somewhere else
        let discountType = couponFound.discountType;

        // //checks if the coupon is already used by the user  
        const usedUser = couponFound.claimedUser.includes(user);
        console.log(usedUser);
        if (usedUser) {
            res.json({ success: false, message: "Coupon is already used by the user" });
            return; // Exit the function early
        }

        if (couponFound?.expiryDate < date) {
            res.json({ success: false, message: 'Coupon Expired' });
            return; // Exit the function early
        }

        if (totalAmount < couponFound.minimumPurchase) {
            res.json({ success: false, message: 'Less amount to apply' });
            return; // Exit the function early
        }

        // // At this point, all checks are passed, apply the coupon
        await Cart.findOneAndUpdate({ user }, { $set: { isCouponApplied: coupon_id } });

        if (discountType === "Percent") {
            totalAmount = totalAmount - (totalAmount * couponFound.discount) / 100;
            console.log(totalAmount);
            if (totalAmount >= 0) {
                res.json({ success: true, message: 'Coupon applied', discount: couponFound.discount, totalAmount,couponId:couponFound._id });
            } else {
                res.json({ success: false, message: 'Error applying coupon' });
            }
        } else if (discountType === "Amount") {
            totalAmount = totalAmount - couponFound.discount;
            if (totalAmount >= 0) {
                res.json({ success: true, message: 'Coupon applied', discount: couponFound.discount, totalAmount,couponId:couponFound._id });
            } else {
                res.json({ success: false, message: 'Error applying coupon' });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: 'An error occurred while applying the coupon' });
    }
}



//remove coupon
const removeCoupon = async (req, res) => {
    try {
        console.log("coupon remove");
        const user = new ObjectId(req.session.userData._id)
        console.log(user);
        await Cart.updateOne({ user }, { $set: { isCouponApplied: "" } })
        // res.json({ success: true })
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
                    from: "productvarients",
                    localField: "product.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productDetails.product_id",
                    foreignField: "_id",
                    as: "mainproduct"
                }
            },
            {
                $unwind: "$mainproduct"
            },
            {
                $lookup: {
                    from: "offers",
                    let: { productId: "$productDetails.product_id", categoryId: "$mainproduct.categoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{
                                        $or: [
                                            { $in: ["$$productId", "$applicables"] },
                                            { $in: ["$$categoryId", "$applicables"] },
                                        ]
                                    },
                                    { $gte: ["$endDate", new Date()] }
                                    ]
                                }
                            }
                        },
                        {
                            $sort: { discount: -1 }
                        },
                        {
                            $group: {
                                _id: "$offerType",
                                highestDiscountOffer: { $first: "$$ROOT" }
                            }
                        },
                        {
                            $replaceRoot: { newRoot: "$highestDiscountOffer" }
                        }
                    ],
                    as: "offers"
                }
            },
            {
                $project: {
                    "product": 1,
                    "productDetails": 1,
                    "mainproduct": 1,
                    offers: 1,
                    "price": {
                        $ifNull: [
                            {
                                $subtract: [
                                    "$productDetails.cost",
                                    {
                                        $max: {
                                            $map: {
                                                input: "$offers", // Iterate over the offers array
                                                as: "offer",
                                                in: {
                                                    $cond: {
                                                        if: { $eq: ["$$offer.discountType", "Percent"] }, // Check if offer type is "percentage"
                                                        then: {
                                                            $multiply: [
                                                                "$$offer.discount", // Percentage value
                                                                { $divide: ["$productDetails.cost", 100] } // Convert percentage to a decimal
                                                            ]
                                                        },
                                                        else: "$$offer.discount" // Use the discount amount as is
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            "$productDetails.cost"
                        ]
                    },
                    "totalPrice": {
                        $ifNull: [
                            {
                                $subtract: [
                                    { $multiply: ["$product.count", "$productDetails.cost"] },
                                    {
                                        $multiply: [
                                            {
                                                $max: {
                                                    $map: {
                                                        input: "$offers",
                                                        as: "offer",
                                                        in: {
                                                            $cond: {
                                                                if: { $eq: ["$$offer.discountType", "Percent"] },
                                                                then: {
                                                                    $multiply: [
                                                                        "$$offer.discount",
                                                                        { $divide: ["$productDetails.cost", 100] } 
                                                                    ]
                                                                },
                                                                else: "$$offer.discount"
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            "$product.count"
                                        ]
                                    }
                                ]
                            },
                            { $multiply: ["$product.count", "$productDetails.cost"] }// If totalPrice is null, set it to zero
                        ]
                    }
                }

            },
        ]).exec()
        console.log(cartData);
        let totalAmount = cartData.reduce((acc, val) => {
            return acc + val.totalPrice
        }, 0)

        res.json({success:true,data:totalAmount})
        // res.rediect('/cart')
    } catch (error) {
        console.log(error.message);
    }
}

//coupons

const couponDashboard = async (req, res) => {
    try {
        const couponData = await Coupons.find({});

        console.log(couponData);
        res.render('admin/coupons/couponDashboard', { admin: true, coupon: couponData })
    } catch (error) {
        console.log(error);

    }
}
const addCoupon = async (req, res) => {
    try {
        res.render('admin/coupons/addcoupon', { admin: true })
    } catch (error) {
        console.log(error);

    }
}
const insertCoupon = async (req, res, next) => {
    try {
        const coupon = new Coupons({
            name: req.body.name,
            couponId: req.body.couponId,
            expiryDate: req.body.expiryDate,
            discountType: req.body.state,
            discount: req.body.discount,
            description: req.body.description,
            minPurchase: req.body.minPurchase,
            maxUsers: req.body.maxUser
        })
        if (coupon)
            var couponData = await coupon.save();

        res.redirect("/admin/couponlist")

    } catch (error) {
        console.log(error);

    }
}
const editCoupon = async (req, res, next) => {
    try {
        const couponId = new ObjectId(req.params.id)
        const couponData = await Coupons.find({ _id: couponId });
        console.log(couponData);
        res.render("admin/coupons/editcoupon", { admin: true, coupon: couponData })
    } catch (error) {
        console.log(error);

    }
}
const updateCoupon = async (req, res, next) => {
    try {
        const couponId = new ObjectId(req.params.id)
        const couponData = await Coupons.updateOne(
            { _id: couponId },
            {
                $set: {
                    name: req.body.name,
                    couponId: req.body.couponId,
                    expiryDate: req.body.expiryDate,
                    discountType: req.body.state,
                    discount: req.body.discount,
                    description: req.body.description,
                    minPurchase: req.body.minPurchase,
                    maxUsers: req.body.maxUser
                }
            }
        );
        console.log(couponData);
        res.redirect("/admin/couponlist")

    } catch (error) {
        console.log(error);

    }
}
const deleteCoupon = async (req, res, next) => {
    try {
        console.log('jodhuiwhdjqdiqhd');
        const couponId = new ObjectId(req.params.id);
        console.log("Deleting coupon with ID:", couponId);
        await Coupons.deleteOne({ _id: couponId });
        console.log("Coupon has been deleted");
        res.redirect("/admin/couponlist");
    } catch (error) {
        console.error("Error deleting coupon:", error);
        // Handle the error or add more detailed logging.
    }
};
module.exports = {
    couponList,
    applyCoupon,
    removeCoupon,
    couponDashboard,
    addCoupon,
    insertCoupon,
    editCoupon,
    updateCoupon,
    deleteCoupon,
}