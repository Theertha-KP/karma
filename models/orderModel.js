const mongoose = require('mongoose')
orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    address: {
        type: Object
    },
    payment: {
        type: String
    },
    orderDate: {
        type: String
    },
    deliveryDate: {
        type: String
    },

    coupon: {
        type: String
    },
    totalAmount:{
        type:String
    },

    items: {
        type: [{
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'productVarient'
            },
            count: {
                type: Number
            },
            price: {
                type: Number
            },
            orderStatus: {
                type: String,
                default:'Order Confirmed'
            }
        }],
        required: true
    }
})

module.exports = mongoose.model("Order", orderSchema)