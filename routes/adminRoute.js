var express = require('express');
var admin_route = express.Router();
const upload = require("../middleware/multer");
admin_route.use("/node_modules", express.static("./node_modules"));
const adminController = require("../controllers/adminController");
const userController=require('../controllers/userController')
const productController=require('../controllers/productController')
const orderController=require('../controllers/orderController')
const searchController=require('../controllers/searchController')
const couponController=require('../controllers/couponController')
const categoryController=require('../controllers/categoryController')
const offerController=require('../controllers/offerController')
const adminmiddle=require('../middleware/adminmiddle')
admin_route.get("/",adminController.adminPageLoad);
admin_route.get("/dashboard",adminmiddle.checkAdmin, adminController.adminDashboard);
admin_route.post("/", adminController.verifyAdmin);
admin_route.get("/categoryDashboard",adminmiddle.checkAdmin,categoryController.loadCategory);
admin_route.get("/addcategory", adminmiddle.checkAdmin,categoryController.loadAddCategory);
admin_route.post("/addcategory",adminmiddle.checkAdmin, categoryController.insertCategoryDb);
admin_route.get("/deletecategory/:id", adminmiddle.checkAdmin,categoryController.deleteCategory);
admin_route.get("/editcategory/:id",adminmiddle.checkAdmin, categoryController.editCategory);
admin_route.post("/editcategory/:id",adminmiddle.checkAdmin, categoryController.UpdateCategory);
admin_route.get("/productdashboard",adminmiddle.checkAdmin, productController.loadProductsDashboard);
admin_route.get("/productvarient",adminmiddle.checkAdmin, productController.loadProductVarient);
admin_route.get("/addproduct",adminmiddle.checkAdmin, productController.loadAddproduct);
admin_route.get("/addproductvariant/:id",adminmiddle.checkAdmin, productController.loadAddVarient);
admin_route.post("/addproductvariant",adminmiddle.checkAdmin, productController.insertProductVarientDb );
admin_route.post( "/addproduct",adminmiddle.checkAdmin,upload.array("files", 5),productController.insertProductDb);
admin_route.get("/editproduct/:id", adminmiddle.checkAdmin,productController.editProduct);
admin_route.get("/editvarient/:id", adminmiddle.checkAdmin,productController.editVarientPage);
admin_route.post("/editvarient/:id", adminmiddle.checkAdmin,productController.editVarient);
admin_route.post("/editproduct/:id",adminmiddle.checkAdmin,upload.array("newImages", 5), productController.editUpdateDb);
admin_route.get('/deleteImg',adminmiddle.checkAdmin,productController.deleteProductImg)
admin_route.get("/deleteproduct/:id",adminmiddle.checkAdmin,productController.deleteProduct);
admin_route.get("/userdashboard",adminmiddle.checkAdmin, userController.loadUserDashboard);
admin_route.get("/blockuser/:id",adminmiddle.checkAdmin, userController.blockUser);
admin_route.get("/unblockuser/:id",adminmiddle.checkAdmin, userController.unblockUser);
admin_route.get('/listproduct/:id',adminmiddle.checkAdmin,productController.listProduct)
admin_route.get('/listvariant/:id',adminmiddle.checkAdmin,productController.listVariant)
admin_route.get('/orderlist',adminmiddle.checkAdmin,orderController.orderList)
admin_route.patch('/changestatus/:id/:productId/:status',adminmiddle.checkAdmin,orderController.status)
admin_route.get('/couponlist',adminmiddle.checkAdmin,couponController.couponDashboard)
admin_route.get('/addcoupon',adminmiddle.checkAdmin,couponController.addCoupon)
admin_route.post('/insertcoupon',adminmiddle.checkAdmin,couponController.insertCoupon)
admin_route.get('/editcoupon/:id',adminmiddle.checkAdmin,couponController.editCoupon)
admin_route.post('/updatecoupon/:id',adminmiddle.checkAdmin,couponController.updateCoupon)
admin_route.get('/deletecoupon/:id',adminmiddle.checkAdmin,couponController.deleteCoupon)
admin_route.get('/offer',adminmiddle.checkAdmin,offerController.offerList)
admin_route.get('/createoffer',adminmiddle.checkAdmin,offerController.createOffer)
admin_route.get('/editoffer/:id',adminmiddle.checkAdmin,offerController.editOffer)
admin_route.get('/fetchCategories',adminmiddle.checkAdmin,offerController.fetchCategory)
admin_route.get('/fetchProducts',adminmiddle.checkAdmin,offerController.fetchProduct)
admin_route.post('/insertoffer',adminmiddle.checkAdmin,offerController.insertOffer)
admin_route.get('/salesreport',adminmiddle.checkAdmin,adminController.salesReport)
admin_route.get('/adminlogout',adminController.adminlogout)
module.exports = admin_route;