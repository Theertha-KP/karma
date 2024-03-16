const mongoose = require("mongoose");
var Schema = mongoose.Schema
const productVarientSchema = new mongoose.Schema({
    price: {
        type: Number,
        required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    color: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    isListed: {
        type: Boolean,
        required: true
      },
    
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    }
})

const productVarientModel = new mongoose.model("productVarient", productVarientSchema);
module.exports = productVarientModel;