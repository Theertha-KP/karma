const adminModal = require("../models/adminModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const { ObjectId } = require('mongodb')
const adminDashboard = async (req, res) => {
  try {
    res.render('admin/adminDashboard')

  } catch (error) {
    console.log(error.message)

  }

}


//admin page
const adminPageLoad = async (req, res) => {
  try {
    console.log("Log in with admin credentials");
    res.render("admin/adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyAdmin = async (req, res) => {
  try {
    const adminData = await adminModal.findOne({});
    console.log(req.body);
    console.log(adminData);
    if (adminData.name == req.body.name) {
      console.log("welcome admin");
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadAddproduct = async (req, res) => {
  try {
    const catDoc = await Category.find({});
    console.log(catDoc);
    res.render("admin/products/addproducts", { category: catDoc });
  } catch (error) {
    console.log("error at loading add products page");
    console.log(error.message);
  }
};
const insertProductDb = async (req, res) => {
  try {
    req.body.category = new ObjectId(req.body.category)
    console.log("this is insertProductDb");
    console.log(req.files);
    const imagesPaths = req.files.map((i) => i.filename);
    console.log(imagesPaths);
    console.log(req.files);
    console.log("files..........");
    const date = new Date();
    const createdDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    const product = new Product({
      productName: req.body.productname,
      price: Number(req.body.price),
      cost: Number(req.body.cost),
      color: req.body.color,
      description: req.body.description,
      isProductBlocked: req.body.isblocked,
      quantity: req.body.quantity,
      categoryId: req.body.category,
      isCategoryBlocked: false,
      createdDate: "",
      image: imagesPaths,
    });
    const productData = await product.save();
    console.log(productData);
    console.log(`${productData.productName} is succesfully added..`);
    res.redirect('/admin/productDashboard')
  } catch (error) {
    console.log(`error at inserting product`);
    console.log(error.message);
  }
};
const loadCategory = async (req, res) => {
  try {
    const categoryDoc = await Category.find({});
    console.log(categoryDoc);
    res.render("admin/category/categoryDashboard", { category: categoryDoc });
  } catch (error) {
    console.log(error.message);
  }
};
const loadAddCategory = async (req, res) => {
  try {
    res.render("admin/category/addcategory");
  } catch (error) {
    console.log(error.message);
  }
};
const insertCategoryDb = async (req, res) => {
  try {
    const category = new Category({
      categoryName: req.body.categoryname,
      description: req.body.description,
      isBlocked: req.body.isBlocked,
    });

    const categoryData = await category.save();

    res.redirect("/admin/categoryDashboard")
  } catch (error) {
    console.log(`error at adding category`);
    console.log(error.message);
  }
};

const loadProductsDashboard = async (req, res) => {
  try {
    const productDoc = await Product.find({}).populate("categoryId");
    res.render("admin/products/productdashboard", { products: productDoc });
  } catch (error) {
    console.log("error at loading add products page");
    console.log(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productForDeletion = req.params.id;
    console.log(Product.findOne({ _id: productForDeletion }));
    await Product.deleteOne({ _id: productForDeletion });
    console.log("product has been deleted");
    res.redirect("/admin/productdashboard");
  } catch (error) {
    console.log("error at deleting product");
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  try {
    // const productEditId = req.params.id;
    const _id = new ObjectId(req.params.id)
    const productData = await Product.findOne({ _id: _id });
    console.log(productData);
    res.render("admin/products/editproducts", { product: productData });
  } catch (error) {
    console.log("error at loading edit page");
    console.log(error.message);
  }
};

const editUpdateDb = async (req, res) => {
  try {
    const UpdateProductId = new ObjectId(req.params.id)
    console.log(UpdateProductId);
    console.log(req.files);
    const imagesPaths = req.files.map((i) => i.filename);
    const productData = await Product.findByIdAndUpdate(
      { _id: UpdateProductId },
      {
        $set: {
          productName: req.body.name,
          price: req.body.price,
          cost: req.body.cost,
          color: req.body.color,
          description: req.body.description,
          isBlocked: req.body.isBlocked,
          quantity: req.body.quantity

        },
        $push: {
          image: { $each: imagesPaths }
        }
      }

    );
    console.log(productData);
    console.log("updation succesful");
    res.redirect("/admin/productdashboard");
  } catch (error) {
    console.log("error at updating editing db");
    console.log(error.message);
  }
};
const deleteProductImg = async (req, res) => {
  try {
    const _id = new ObjectId(req.query.id);
    console.log(_id);
    const filename = req.query.filename;
    await Product.findOneAndUpdate({ _id: _id }, { $pull: { image: filename } })
    res.redirect(`/admin/editProduct/${_id}`)
  } catch (error) {
    console.log(error)
  }
}

const loadUserDashboard = async (req, res) => {
  try {
    userData = await User.find({});
    res.render("admin/users/userdashboard", { user: userData });
  } catch (error) {
    console.log("error at loading user dashboard");
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    console.log(userId);
    const userData = await User.updateOne(
      { _id: userId },
      { $set: { is_blocked: true } }
    );
    console.log(userData);
    res.redirect("/admin/userdashboard");
  } catch (error) {
    console.log("error at blocking user");
    console.log(error.message);
  }
};
const unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { is_blocked: false } }
    );
    console.log(`${userData.name} has been succesfully unblocked`);
    res.redirect("/admin/userdashboard");
  } catch (error) {
    console.log("error at unblocking user");
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
    // const productEditId = req.params.id;
    const _id = new ObjectId(req.params.id)
    const categoryData = await Category.findOne({ _id: _id });
    console.log(categoryData);
    res.render("admin/category/editcategory", { category: categoryData });
  } catch (error) {
    console.log("error at loading edit page");
    console.log(error.message);
  }
};
const UpdateCategory = async (req, res) => {

  try {
    const UpdateCategoryId = new ObjectId(req.params.id)
    console.log(UpdateCategoryId);
    console.log(req.body);
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
  adminPageLoad,
  verifyAdmin,
  loadAddproduct,
  insertProductDb,
  loadAddCategory,
  insertCategoryDb,
  editCategory,
  loadProductsDashboard,
  deleteProduct,
  editProduct,
  editUpdateDb,
  loadUserDashboard,
  blockUser,
  unblockUser,
  adminDashboard,
  loadCategory,
  deleteCategory,
  deleteProductImg,
  UpdateCategory

};
