const mongoose = require("mongoose");
var Schema = mongoose.Schema
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },

  createdDate: {
    type: String,
  },
  isProductBlocked: {
    type: Boolean,

  },
  description: {
    type: String,
    required: true,
  },
  categoryId: {
    type: Schema.ObjectId,
    required: true,
    ref: "categories",
  },
  
  isCategoryBlocked: {
    type: Boolean,
    required: true,
  },
  isListed: {
    type: Boolean,
    required: true
  },
  image: {
    type: Array,
    required: true,
  },
  isDeleted:{
    type: Boolean,
    default:false
  },

});

const productModel = new mongoose.model("products", productSchema);
module.exports = productModel;
