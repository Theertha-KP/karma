const Category = require("../models/categoryModel");
const { ObjectId } = require('mongodb')

const loadCategory = async (req, res) => {
    try {
      const categoryDoc = await Category.find({});
      console.log(categoryDoc);
      res.render("admin/category/categoryDashboard", { admin: true, category: categoryDoc });
    } catch (error) {
      console.log(error.message);
    }
  };
  const loadAddCategory = async (req, res) => {
    try {
      res.render("admin/category/addcategory", { admin: true });
    } catch (error) {
      console.log(error.message);
    }
  };
  const insertCategoryDb = async (req, res) => {
    try {
      const { categoryname, description } = req.body;
      const existingCategory = await Category.findOne({ categoryName: categoryname });
  
      if (existingCategory) {
        return res.render("admin/category/addcategory",{ admin: true , message: 'Category already exists' });
      }
  
      const category = new Category({
        categoryName: req.body.categoryname,
        description: req.body.description,
        isBlocked: req.body.isBlocked,
      });
  
      if (category)
        var categoryData = await category.save();
  
      res.redirect("/admin/categoryDashboard")
    } catch (error) {
      console.log(`error at adding category`);
      console.log(error.message);
    }
  };

  const deleteCategory = async (req, res) => {
    try {
      const categoryForDeletion = new ObjectId(req.params.id);
      Product.findOne({ _id: categoryForDeletion });
      console.log(categoryForDeletion);
      await Category.deleteOne({ _id: categoryForDeletion });
      console.log("category has been deleted");
      res.redirect("/admin/categoryDashboard");
    } catch (error) {
      console.log("error at deleting category");
      console.log(error.message);
    }
  };
  const editCategory = async (req, res) => {
    try {
  
      const _id = new ObjectId(req.params.id)
      const categoryData = await Category.findOne({ _id: _id });
      console.log(categoryData);
      res.render("admin/category/editcategory", { admin: true, category: categoryData });
    } catch (error) {
      console.log("error at loading edit page");
      console.log(error.message);
    }
  };
  const UpdateCategory = async (req, res) => {
  
    try {
      const UpdateCategoryId = new ObjectId(req.params.id)
      const categoryData = await Category.updateOne(
        { _id: UpdateCategoryId },
        {
          $set: {
            categoryName: req.body.name,
            description: req.body.description,
          }
        }
  
      );
      console.log(categoryData);
      console.log("updation succesful");
      res.redirect("/admin/categoryDashboard");
    } catch (error) {
      console.log("error at updating editing db");
      console.log(error.message);
    }
  };

  module.exports = {
    loadAddCategory,
    insertCategoryDb,
    editCategory,
    loadCategory,
    deleteCategory,
    UpdateCategory,
  };