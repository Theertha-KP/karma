
const Product = require("../models/productModel");
const ProductVariant = require("../models/productVariantModel")
const Category = require("../models/categoryModel");
const multer=require("../middleware/multer")
const { ObjectId } = require('mongodb')

//listing product
const productlist = async (req, res, next) => {
    try {

        const productDoc = await Product.find({ isListed: false }).populate("categoryId");
        
        res.render("user/productlist", { products: productDoc });
    } catch (error) {
        console.log("error at loading add products page");
        console.log(error.message);
    }
}

//singleproduct
const singleproduct = async (req, res, next) => {
    try {
        const _id = new ObjectId(req.params.id);
        console.log(_id);
        const varient= await ProductVariant.find({product_id:_id}).populate("product_id")
        console.log(varient);
        // const productDoc = await Product.aggregate([
        //     { 
        //         $match:{_id: _id }  
        //       },
        //     {
        //         $lookup: {
        //             from: "productvarients",
        //             localField: "_id",
        //             foreignField: " product_id",
        //             as: "varientDetails"
        //         }
        //     },
            
        // ])
        console.log('iiii')
       
        
        //     var countExist = false
        // } else {
        //     var countExist = true
        // }
        res.render("user/singleproduct", { product: varient});
    } catch (error) {
        console.log("error at loading add products page");
        console.log(error.message);
    }
}
const loadAddproduct = async (req, res) => {
    try {
        const catDoc = await Category.find({});
        console.log(catDoc);
        res.render("admin/products/addproducts", { admin: true, category: catDoc });
    } catch (error) {
        console.log("error at loading add products page");
        console.log(error.message);
    }
};

const loadAddVarient = async (req, res) => {
    try {
        const id = new ObjectId(req.params.id)
        const varient =

            res.render("admin/products/addproductvariant", { admin: true, id });
    } catch (error) {
        console.log("error at loading add products page");
        console.log(error.message);
    }
};
const insertProductDb = async (req, res) => {
    try {
        req.body.category = new ObjectId(req.body.category)
        console.log("this is insertProductDb");
        console.log(req.files.filename);
        const imagesPaths = req.files.map((i) => i.filename);
        console.log(imagesPaths);
     
        console.log("files..........");
        const date = new Date();
        const createdDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
        const product = new Product({
            productName: req.body.productname,
            brand: req.body.brand,
            description: req.body.description,
            categoryId: req.body.category,
            brand:req.body.brand,
            isListed: req.body.islisted,
            isCategoryBlocked: false,
            createdDate: "",
            image: imagesPaths
        });
        const productData = await product.save();
        console.log(productData);
        console.log(`${productData.productName} is succesfully added..`);
        res.redirect('/admin/productdashboard')
    } catch (error) {
        console.log(`error at inserting product`);
        console.log(error.message);
    }
};

const insertProductVarientDb = async (req, res) => {
    try {

        console.log("this is insertvarientDb");

        const date = new Date();
        const createdDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
        console.log(req.body);
        const Variants = new ProductVariant({
            price: req.body.price,
            cost: req.body.cost,
            color: req.body.color,
            size: req.body.size,
            product_id: req.body.id,
            isListed: req.body.isListed,
            quantity: req.body.quantity,
            createdDate: "",

        });
        const productVariantData = await Variants.save();
        console.log(productVariantData);
        console.log(`${productVariantData.price} is succesfully added..`);
        res.redirect('/admin/productvarient')
    } catch (error) {
        console.log(`error at inserting product variant`);
        console.log(error.message);
    }
};

const loadProductsDashboard = async (req, res) => {
    try {
        const productDoc = await Product.find({}).populate("categoryId");
        res.render("admin/products/productdashboard", { admin: true, products: productDoc });
    } catch (error) {
        console.log("error at loading add products page");
        console.log(error.message);
    }
};
const loadProductVarient = async (req, res) => {
    try {
        const productDoc = await ProductVariant.find({})
        console.log(productDoc)
        res.render("admin/products/variantlist", { admin: true, products: productDoc });
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
const deleteProductVariant = async (req, res) => {
    try {
        const productForDeletion = req.params.id;
        console.log(ProductVariant.findOne({ _id: productForDeletion }));
        await ProductVariant.deleteOne({ _id: productForDeletion });
        console.log("product has been deleted");
        res.redirect("/admin/productdashboard");
    } catch (error) {
        console.log("error at deleting product");
        console.log(error.message);
    }
};
const editVarient = async (req, res) => {
    try {
        const UpdateProductId = new ObjectId(req.params.id)
        console.log(UpdateProductId);
        
        const productData = await Product.updateOne(
            { _id: UpdateProductId },
            {
                $set: {

                    price: req.body.price,
                    cost: req.body.cost,
                    color: req.body.color,
                    quantity: req.body.quantity,
                    isListed: req.body.islisted,
                    quantity: req.body.quantity,
                }
               
            }

        );
        console.log(productData);
        console.log("updation succesful");
        res.redirect('/admin/productvarient')
    } catch (error) {
        console.log("error at updating editing db");
        console.log(error.message);
    }
};
const editVarientPage = async (req, res) => {
    try {
        const _id = new ObjectId(req.params.id)
       
        const productData = await ProductVariant.findOne({ _id: _id });
        console.log(productData);
        res.render("admin/products/editvariant", { admin: true, product: productData });
    } catch (error) {
        console.log("error at loading edit page");
        console.log(error.message);
    }
};

const editProduct = async (req, res) => {
    try {
        // const productEditId = req.params.id;
        const _id = new ObjectId(req.params.id)
        const catDoc = await Category.find({});
        const productData = await Product.findOne({ _id: _id });
        console.log(productData);
        res.render("admin/products/editproducts", { admin: true, product: productData, category: catDoc });
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
        const productData = await Product.updateOne(
            { _id: UpdateProductId },
            {
                $set: {
                    productName: req.body.productname,

                    description: req.body.description,
                    isBlocked: req.body.isBlocked,
                    categoryId: req.body.category,
                    isListed: req.body.islisted,

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

const listProduct = async (req, res, next) => {
    try {
        const id = new ObjectId(req.params.id)
        console.log(id);
        const prdtData = await Product.findOne({ _id: id })
        if (prdtData.isListed == true) {
            await Product.updateOne({ _id: id }, { $set: { isListed: false } })
            res.redirect('/admin/productDashboard')
        }
        else {

            await Product.updateOne({ _id: id }, { $set: { isListed: true } })
            res.redirect('/admin/productDashboard')
        }
        console.log("Product list changed");
    } catch (error) {
        console.log(error);

    }
}
const listVariant = async (req, res, next) => {
    try {
        const id = new ObjectId(req.params.id)
        console.log(id);
        const prdtData = await ProductVariant.findOne({ _id: id })
        if (prdtData.isListed == true) {
            await ProductVariant.updateOne({ _id: id }, { $set: { isListed: false } })
           res.redirect('/admin/productvarient')
        }
        else {

            await ProductVariant.updateOne({ _id: id }, { $set: { isListed: true } })
           res.redirect('/admin/productvarient')
        }
        console.log("Product list changed");
    } catch (error) {
        console.log(error);

    }
}



module.exports = {
    productlist,
    singleproduct,
    loadAddproduct,
    insertProductDb,
    loadProductsDashboard,
    deleteProduct,
    editProduct,
    editUpdateDb,
    deleteProductImg,
    listProduct,
    loadProductVarient,
    loadAddVarient,
    insertProductVarientDb,
    editVarientPage,
    editVarient,
    listVariant
}