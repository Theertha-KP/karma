const mongoose = require("mongoose");
const Objectid = mongoose.Schema.Types.ObjectId;
const couponSchema = new mongoose.Schema({
    name: {
        type: String
    },
    couponId: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    discountType: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    claimedUser: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    description: {
        type: String,
    },
    minPurchase: {
        type: Number,
        required: true,
    },
    maxUsers: {
        type: Number,
        required: true,
    },
    usedUsers: {
        type: Number,
        required: true,
        default: 0
    }
})






const coupon = new mongoose.model("coupon", couponSchema);
module.exports = coupon;