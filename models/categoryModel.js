const mongoose = require("mongoose");
const Objectid = mongoose.Schema.Types.ObjectId;

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    
  },
});

const categoryModel = new mongoose.model("categories", categorySchema);
module.exports = categoryModel;
