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

    items: {
        type: [{
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number
            },
            price: {
                type: Number
            },
            orderStatus: {
                type: Number,
                default: 1
            },
        }],
        required: true
    }
})

module.exports = mongoose.model("Order", orderSchema)