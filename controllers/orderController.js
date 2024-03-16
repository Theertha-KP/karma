const Order = require('../models/orderModel')
const { ObjectId } = require('mongodb')


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
        const user = req.session.userData._id
        const userFound = await Order.findOne({ user })
        const { address, payment, orderDate, product_id, quantity, price, orderStatus } = req.body;
        if (!userFound) {
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
            await newOrder.save()
            console.log("data saved");
        }
        else {
            console.log("userfound");
            await Order.updateOne({ user }, {
                $push: { address, payment, orderDate, items: { type: { product_id, quantity, price, orderStatus } } }
            })
            console.log("data pushed");
        }
        res.redirect('/orderstatus')

    } catch (error) {
        console.log(error);
    }

}
const orders = async (req, res, next) => {
    try {
        const user = new ObjectId(req.session.userData._id)
        // const address = req.session.addressId
        const orderData = await Order.aggregate([
            { $match: { user: user } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "productdetails"
                }
            }
        ])



        console.log(orderData);
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



module.exports = {
    orderPage,
    cashOnDelivery,
    orders,
    orderList,
    status,
}