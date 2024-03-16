const Offer=require('../models/offerModel')
const { ObjectId } = require('mongodb')
const offerList=async(req,res,next)=>{
    try{
      res.render("admin/offers/offerlist",{admin: true })
    }catch (error) {
        console.error("Error deleting coupon:", error);
        // Handle the error or add more detailed logging.
    }
  }
  const createOffer=async(req,res,next)=>{
    try{
      res.render("admin/offers/createoffer",{admin: true })
    }catch (error) {
        console.error("Error deleting coupon:", error);
        // Handle the error or add more detailed logging.
    }
  }

  module.exports = { 
    offerList,
    createOffer
  
  };