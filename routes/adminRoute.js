var express = require('express');
var admin_route = express.Router();
const multer = require("../middleware/multer");
admin_route.use("/node_modules", express.static("./node_modules"));

const adminController = require("../controllers/adminController");
admin_route.get("/", adminController.adminPageLoad);
admin_route.get("/dashboard", adminController.adminDashboard);
admin_route.post("/", adminController.verifyAdmin);
admin_route.get("/categoryDashboard", adminController.loadCategory);
admin_route.get("/addcategory", adminController.loadAddCategory);
admin_route.post("/addcategory", adminController.insertCategoryDb);
admin_route.get("/deletecategory/:id", adminController.deleteCategory);
admin_route.get("/editcategory/:id", adminController.editCategory);
admin_route.post("/editcategory/:id", adminController.UpdateCategory);
admin_route.get("/productdashboard", adminController.loadProductsDashboard);
admin_route.get("/addproduct", adminController.loadAddproduct);
admin_route.post( "/addproduct",upload.array("files", 5),adminController.insertProductDb);
admin_route.get("/editproduct/:id", adminController.editProduct);
admin_route.post("/editproduct/:id",upload.array("newImages", 5), adminController.editUpdateDb);
admin_route.get('/deleteImg',adminController.deleteProductImg)
admin_route.get("/deleteproduct/:id", adminController.deleteProduct);
admin_route.get("/userdashboard", adminController.loadUserDashboard);
admin_route.get("/blockuser/:id", adminController.blockUser);
admin_route.get("/unblockuser/:id", adminController.unblockUser);

module.exports = admin_route;