mongoose = require("mongoose");
var Schema = mongoose.Schema
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
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
    required: true,
  },
  quantity:{
    type:Number,
    required: true
  },
  image: {
    type: Array,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdDate: {
    type: String,
  },
  isProductBlocked: {
    type: Boolean,
   
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
  isListed:{
    type: Boolean,
    required: true
  }
 
});

const productModel = new mongoose.model("products", productSchema);
module.exports = productModel;
