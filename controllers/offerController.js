const Offer=require('../models/offerModel')
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const ProductVariant = require("../models/productVariantModel")
const { ObjectId } = require('mongodb')
const offerList=async(req,res,next)=>{
    try{
      const offer=await Offer.find({})
      res.render("admin/offers/offerlist",{offer:offer, admin: true })
    }catch (error) {
        console.error("Error deleting offer:", error);
        // Handle the error or add more detailed logging.
    }
  }
  const createOffer=async(req,res,next)=>{
    try{
      
      const product =await Product.find({})
     
     
  
      res.render("admin/offers/createoffer",{admin: true,product:product })
    }catch (error) {
        console.error("Error deleting coupon:", error);
        // Handle the error or add more detailed logging.
    }
  }
  const fetchCategory=async(req,res,next)=>{
  
    try {
      const categories = await Category.find({}, '_id categoryName'); 
      console.log("category:"+categories);
      res.json(categories);
  } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
  }
  const fetchProduct=async(req,res,next)=>{
  
    try {
      const products = await Product.find({}, '_id productName'); 
      console.log("product:"+products);
      res.json(products);
  } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
  }


  const  insertOffer=async (req,res,next)=>{
     try{
      
      const offer = new Offer({
        offerTitle: req.body.name,
        startDate: req.body.startdate,
        endDate: req.body.expirydate,
        discountType: req.body.discounttype,
        discount: req.body.discount,
        offerType:req.body.offertype,
        applicables:req.body.applicables,
        offerDetails: req.body.description
       
    })
    console.log(offer)
    if (offer)
        var offerData = await offer.save();

    res.redirect("/admin/offer")

     }catch (error) {
        console.error("Error deleting offer:", error);
        // Handle the error or add more detailed logging.

    }
  }

  const editOffer=async(req,res,next)=>{
    try{
      const id=new ObjectId(req.params.id)
      console.log(id)
      const offer= await Offer.find({_id:id})
      console.log(offer);
      res.render("admin/offers/editoffer", {admin: true , offer: offer })

    }catch (error) {
      console.error("Error updating offer:", error);
      // Handle the error or add more detailed logging.

  }
  }

  module.exports = { 
    offerList,
    createOffer,
    insertOffer,
    fetchCategory,
    fetchProduct,
    editOffer
  
  };