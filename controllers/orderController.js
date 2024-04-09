const Order = require('../models/orderModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const Coupons = require('../models/couponModel')
const { ObjectId } = require('mongodb')
const productVarient = require('../models/productVariantModel')
const Razorpay = require('razorpay');
const User = require("../models/userModel");
const { listenerCount } = require('../models/userModel')
const { response } = require('express')


let instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
});

const checkoutPage = async (req, res, next) => {
    try {

        console.log('addressdata');
        const userdata = new ObjectId(req.session.userData._id)


        const addressData = await Address.aggregate([
            {
                $match: {
                    user: userdata
                }
            },
            {
                $unwind: "$address"
            }
        ])
        console.log(addressData);
        const cartData = await Cart.aggregate([
            {
                $match: {
                    user: userdata
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
                                                input: "$offers",
                                                as: "offer",
                                                in: {
                                                    $cond: {
                                                        if: { $eq: ["$$offer.discountType", "Percent"] }, // Check if offer type is "percentage"
                                                        then: {
                                                            $multiply: [
                                                                "$$offer.discount", // Percentage value
                                                                { $divide: ["$productDetails.cost", 100] }
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
        let total = cartData.reduce((acc, val) => {
            return acc + val.totalPrice
        }, 0)
        let totalAmount = total
        if (req.query.couponid) {
            const couponFound = await Coupons.findOne({ _id: new ObjectId(req.query.couponid) })
            console.log(couponFound)
            let discountType = couponFound.discountType;

            if (discountType === "Percent") {
                totalAmount = totalAmount - (totalAmount * couponFound.discount) / 100;


            } else if (discountType === "Amount") {
                totalAmount = totalAmount - couponFound.discount;


            }
        }
        console.log(cartData);

        const cartCount = cartData.length
        if (cartData.length > 0) {

            res.render("user/checkout", { address: addressData, user: req.session.userData, total: totalAmount, cartCount, cartData })
        } else {
            res.redirect("/cart")
        }

    } catch (error) {
        console.log(error);
        next(error)
    }
}

//orderpage
const orderPage = async (req, res, next) => {
    try {

        res.render('user/orderstatus')

    } catch (error) {
        console.log(error);

    }
}

//place order
const cashOnDelivery = async (req, res, next) => {
    try {
        console.log('hiiorder');
        const user = req.session.userData._id;

        console.log(req.body);
        console.log(req.body.productIds);
        console.log(req.body.count);
        console.log(req.body.totalPrice);

        // Split  into arrays
        const countArray = req.body.count.split(',').filter(value => value !== '');
        const totalPriceArray = req.body.totalPrice.split(',').filter(value => value !== '');
        // items array
        const items = req.body.productIds.map((productId, index) => ({
            product_id: productId,
            count: countArray[index] || 0,
            price: totalPriceArray[index] || 0,
            orderStatus: 1
        }));

        console.log(items);

        const newOrder = await new Order({
            user: user,
            address: req.body.addressId,
            payment: req.body.payment,
            totalAmount: req.body.totalAmount,
            items: items,
            paymentStatus: "COD"
        });

        await newOrder.save();
        console.log(newOrder);

        res.json({ success: true });
        await Cart.deleteOne({ user: user });


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



const orders = async (req, res, next) => {
    try {
        const user = new ObjectId(req.session.userData._id)
        // const address = req.session.addressId

        const orderData = await Order.aggregate([
            { $match: { user: user } },
            { $unwind: "$items" },

            {
                $lookup: {
                    from: "productvarients",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "productdetails"
                }
            },
            { $unwind: "$productdetails" },
        ])



       
        res.render('user/orderpage', { orderData, user: req.session.userData })

    } catch (error) {
        console.log(error);
    }
}
const orderList = async (req, res, next) => {
    try {
        const order = await Order.aggregate([{ $unwind: "$items" }])
       
        res.render('admin/order/orderlist', { admin: true, order })
    } catch (error) {
        console.log(error);

    }
}
const status = async (req, res, next) => {
    try {
        const productId = new ObjectId(req.params.productId)
        const orderId = new ObjectId(req.params.id)
        const newStatus = req.params.status
        const orderstatus = await Order.updateOne({ _id: orderId }, {
            $set: { 'items.$[elem].orderStatus': newStatus }
        }, { arrayFilters: [{ "elem.product_id": productId }] })
        console.log(orderstatus);
        res.json({ success: true })
    } catch (error) {
        console.log(error);

    }
}

const razorpay = async (req, res, next) => {
    console.log("logging razorpay");
    const totalAmount = req.body.totalAmount;
    console.log(totalAmount);
    const user = req.session.userData._id;
    console.log(req.body.count);
    console.log(req.body.totalPrice)

    // Split  into arrays
    const countArray = req.body.count.split(',').filter(value => value !== '');
    const totalPriceArray = req.body.totalPrice.split(',').filter(value => value !== '');
    // items array
    const items = req.body.productIds.map((productId, index) => ({
        product_id: productId,
        count: countArray[index] || 0,
        price: totalPriceArray[index] || 0,
        orderStatus: "order confirmed"
    }));

    console.log(items);

    const newOrder = await new Order({
        user: user,
        address: req.body.addressId,
        payment: req.body.payment,
        totalAmount: req.body.totalAmount,
        items: items,
        paymentStatus: "Pending"
    });

    await newOrder.save();



    const options = {
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: newOrder._id
    };

    instance.orders.create(options, function (err, order) {
        if (err) {
            console.error('Error creating Razorpay order:', err);
            res.status(500).json({ error: 'An error occurred while creating the order.' });
        } else {
            console.log(order);
            res.json(order);
        }
    });
};
const fetchProducts = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        console.log("haiordeer")
        const orderProducts = await Order.aggregate([
            { $match: { _id: new ObjectId(orderId) } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "productvarients",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "productdetails"
                }
            },
            { $unwind: "$productdetails" },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "productDetails.product_id",
                    as: "mainproduct"
                }
            },
            {
                $unwind: "$mainproduct"
            }
        ]);
        console.log(orderProducts)
       
        res.json(orderProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const orderedProducts = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const user=await User.findOne({_id:new ObjectId(req.session.userData._id)})
        const order = await Order.aggregate([
            { $match: { _id: new ObjectId(orderId) } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "productvarients",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "productdetails"
                }
            },
            {
                $unwind:"$productdetails"
            },
             {
                $lookup: {
                    from: "products",
                    localField: "productdetails.product_id",
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
                    let: { productId: "$productdetails.product_id", categoryId: "$mainproduct.categoryId" },
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
                    "productdetails": 1,
                    "mainproduct": 1,
                    offers: 1,
                    "price": {
                        $ifNull: [
                            {
                                $subtract: [
                                    "$productdetails.cost",
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
                                                                { $divide: ["$productdetails.cost", 100] } // Convert percentage to a decimal
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
                            "$productdetails.cost"
                        ]
                    },
                    "totalPrice": {
                        $ifNull: [
                            {
                                $subtract: [
                                    { $multiply: ["$product.count", "$productdetails.cost"] },
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
                                                                        { $divide: ["$productdetails.cost", 100] } // Convert percentage to a decimal
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
                            { $multiply: ["$product.count", "$productdetails.cost"] }// If totalPrice is null, set it to zero
                        ]
                    }
                }

            },
        ])
        console.log(order);
        const total = order.reduce((acc, val) => {
            return acc + val.totalPrice
        }, 0)
        console.log(total);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.render('user/orderedproducts', { order,user:user,total });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};


const verifyRazorpay = async (req, res, next) => {
    try {
        const user = new ObjectId(req.session.userData._id)
        console.log(req.body)
        const crypto = require("crypto");
        const hmac = crypto.createHmac('sha256', process.env.key_secret);
        hmac.update(req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id);
        let generatedSignature = hmac.digest('hex');

        console.log(generatedSignature);
        console.log(req.body.response.razorpay_signature);
        let isSignatureValid = generatedSignature == req.body.response.razorpay_signature;
        // generated_signature = hmac_sha256(response.razorpay_order_id + "|" + response.razorpay_payment_id, process.env.key_id);

        if (isSignatureValid) {

            const order_id = new ObjectId(req.body.receipt)
            console.log(order_id);
            const order = await Order.updateOne({ _id: order_id },
                {
                    $set: {
                        paymentStatus: "paid"
                    }
                }
            )
            await Cart.deleteOne({ user: user });
            res.json({ success: true })

        } else {
            res.json({ success: false })
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const cancelOrder = async (req, res, next) => {
    try {
        const user = new ObjectId(req.session.userData._id)
        console.log(req.body);
        const orderId = new ObjectId(req.body.orderId)
        
        const order=await Order.findOneAndUpdate({ _id: orderId },
            {
                $set: {
                    'items.$[].orderStatus': 'Cancelled'
                }
            }
        )
       console.log(order.totalAmount);
        res.json({ success: true, message: 'Order cancelled successfully.' });
       if(order.payment=="online"){
          await User.updateOne({_id:user},{
            $inc:{
               wallet:order.totalAmount
            }
         })
       }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }


}


module.exports = {
    checkoutPage,
    orderPage,
    cashOnDelivery,
    orders,
    orderList,
    status,
    razorpay,
    fetchProducts,
    cancelOrder,
    orderedProducts,
    verifyRazorpay
}