const Order = require('../models/orderModel')
const Cart = require('../models/cartModel')
const Address = require('../models/addressModel')
const { ObjectId } = require('mongodb')
const productVarient = require('../models/productVariantModel')
const Razorpay = require('razorpay');
const checkoutPage = async (req, res, next) => {
    try {

        console.log('addressdata');
        const userdata = new ObjectId(req.session.userData._id)
        const total = req.query.total
        console.log(total);
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
        console.log('addressdatakkk');
        const cart =await Cart.find({user:userdata})
        console.log(cart.length);
        //getting cart product count
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
            }, {
                $project: {
                    _id: 1,
                    user: 1,
                    product: 1,
                    productDetails: 1,
                    total: { $multiply: ['$product.count', '$productDetails.price'] }
                }
            }
        ]).exec()
        console.log(cartData);
        
        const cartCount = cartData.length
        if(cart.length>0){
            
        res.render("user/checkout", { address: addressData, user: req.session.userData, total, cartCount, cartData })
        }else{
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
        const { 
            address,
            payment,
            orderDate,product_id,price,quantity} = req.body;
        console.log(req.body);

        let userOrder = await Order.findOne({ user });

        if (!userOrder) {
            console.log("user not found");
            const newOrder = await new Order({
                user,
                address,
                payment,
                orderDate,

                items: {
                    type: [{
                        product_id,
                        quantity,
                        price,
                        orderStatus,
                    }]
                }
            })
            await newOrder.save();
        } else {
            console.log("user found");
            userOrder.user=user
            userOrder.address = address;
            userOrder.payment = payment;
            userOrder.items.price = price;
            userOrder.items.product_id=product_id;
           
            await userOrder.save();
            console.log("data updated");
        }

        res.json({success:true});
       
        await Cart.deleteOne({user:user});
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
            // { $unwind: "$items" },
            // {
            //     $lookup: {
            //         from: "productvarients",
            //         localField: "items.product_id",
            //         foreignField: "_id",
            //         as: "productdetails"
            //     }
            // }
        ])



        console.log(orderData+"lllll");
        res.render('user/orderpage', { orderData, user: req.session.userData })

    } catch (error) {
        console.log(error);
    }
}
const orderList = async (req, res, next) => {
    try {
        const order = await Order.aggregate([{ $unwind: "$items" }])
        console.log(order);
        res.render('admin/order/orderlist', {admin: true , order })
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

const razorpay=async(req,res,next)=>{
    const totalAmount = req.body.totalAmount; // Total amount in paise
    var instance = new Razorpay({
        key_id: process.env.key_id,
        key_secret: process.env.key_secret
      });
    const options = {
        amount: totalAmount,
        currency: 'INR'
    };
    razorpay.Order.create(options, function(err, order) {
        if (err) {
            console.error('Error creating Razorpay order:', err);
            res.status(500).json({ error: 'An error occurred while creating the order.' });
        } else {
            res.json(order);
        }
    });

}



module.exports = {
    checkoutPage,
    orderPage,
    cashOnDelivery,
    orders,
    orderList,
    status,
    razorpay
}