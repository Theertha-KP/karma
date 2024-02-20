var express = require('express');
var admin_route = express.Router();
const multer = require("../middleware/multer");
admin_route.use("/node_modules", express.static("./node_modules"));
const adminController = require("../controllers/adminController");
const adminmiddle=require('../middleware/adminmiddle')
admin_route.get("/",adminController.adminPageLoad);
admin_route.get("/dashboard",adminmiddle.checkAdmin, adminController.adminDashboard);
admin_route.post("/", adminController.verifyAdmin);
admin_route.get("/categoryDashboard",adminmiddle.checkAdmin, adminController.loadCategory);
admin_route.get("/addcategory", adminmiddle.checkAdmin,adminController.loadAddCategory);
admin_route.post("/addcategory",adminmiddle.checkAdmin, adminController.insertCategoryDb);
admin_route.get("/deletecategory/:id", adminmiddle.checkAdmin,adminController.deleteCategory);
admin_route.get("/editcategory/:id",adminmiddle.checkAdmin, adminController.editCategory);
admin_route.post("/editcategory/:id",adminmiddle.checkAdmin, adminController.UpdateCategory);
admin_route.get("/productdashboard",adminmiddle.checkAdmin, adminController.loadProductsDashboard);
admin_route.get("/addproduct",adminmiddle.checkAdmin, adminController.loadAddproduct);
admin_route.post( "/addproduct",adminmiddle.checkAdmin,upload.array("files", 5),adminController.insertProductDb);
admin_route.get("/editproduct/:id", adminmiddle.checkAdmin,adminController.editProduct);
admin_route.post("/editproduct/:id",adminmiddle.checkAdmin,upload.array("newImages", 5), adminController.editUpdateDb);
admin_route.get('/deleteImg',adminmiddle.checkAdmin,adminController.deleteProductImg)
admin_route.get("/deleteproduct/:id",adminmiddle.checkAdmin, adminController.deleteProduct);
admin_route.get("/userdashboard",adminmiddle.checkAdmin, adminController.loadUserDashboard);
admin_route.get("/blockuser/:id",adminmiddle.checkAdmin, adminController.blockUser);
admin_route.get("/unblockuser/:id",adminmiddle.checkAdmin, adminController.unblockUser);
admin_route.get('/listproduct/:id',adminmiddle.checkAdmin,adminController.listProduct)
admin_route.get('/adminlogout',adminController.adminlogout)
// admin_route.post('/adminlogout',adminController.adminlogout)
module.exports = admin_route;