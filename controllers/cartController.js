const Cart = require('../models/cartModel')
const { ObjectId } = require('mongodb')

//cart 


const cart = async function (req, res, next) {
    try {
  
        if (!req.session.userData || !req.session.userData._id) {
            // If user is not logged in, redirect to login page
            return res.redirect('/login');
        }
        //wraning mesage
        console.log('hai');
        var context = req.app.locals.specialContext
        req.app.locals.specialContext = ""
        //we need an user to logged in to go cart


        const user = new ObjectId(req.session.userData._id)
        console.log(user);

        //getting cart product count
        let cartCount = 0

        const cartData = await Cart.aggregate([
            {
                $match: {
                    user: user
                }
            },
            {
                $unwind: "$product"
            },
            {
                $lookup: {
                    from: "productvarients",
                    localField: "product.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productDetails.product_id",
                    foreignField: "_id",
                    as: "mainproduct"
                }
            }
            , {
                $project: {
                    _id: 1,
                    user: 1,
                    product: 1,
                    productDetails: 1,
                    mainproduct:1,
                    total: { $multiply: ['$product.count', '$productDetails.price'] }
                }
            },{
                $unwind:"$mainproduct"
            }
        ]).exec()
        console.log(cartData);
        const total = cartData.reduce((acc, val) => {
            return acc + val.total
        }, 0)
        console.log(total);
        // console.log(cartData.length);
        res.render('user/cart', { cartData, total })
    }
    catch (error) {
       
        // req.flash('fmessage', 'Internal server error');
        return res.json({ success: false, message: 'Internal server error' });
    }
}

//check product in cart
const checkproduct = async (req, res) => {
    try {
            const user = new ObjectId(req.session.userData._id)
            const productId = new ObjectId(req.params.id)

            const cart = await Cart.findOne({ user: user, product: { $elemMatch: { product_id: productId } } })
            console.log(cart);
            if (cart) {
                res.status(200).json({ success: true })
            } else {
                res.status(200).json({ success: false, msg: 'product not found' })
            }
       
    } catch (error) {
        console.log(error);
    }
}


//add to cart
const addToCart = async (req, res) => {
    try {
      // Check if the user is logged in
    
        const user = req.session.userData._id;
        const productId = new ObjectId(req.params.id);
        let userFound = await Cart.findOne({ user });
        if (!userFound) {
            const newCart = new Cart({
                user,
                product: [{ product_id: productId, count: 1 }]
            });
            await newCart.save();
        } else {
            if (userFound.product.find(product => productId.equals(product.product_id))) {
                return res.status(400).json({ success: false, msg: 'Product already exists in cart' });
            }
            await Cart.updateOne({ user }, {
                $push: { product: { product_id: productId, count: 1 } }
            });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }


}


const changeCount = async (req, res) => {
    try {
        console.log("changecount");
        const user = new ObjectId(req.session.userData._id);
        const productId = new ObjectId(req.params.id);
        const count = Number(req.params.count);
        const cart = await Cart.aggregate([
            { $match: { user: user } },
            { $unwind: "$product" },
            { $match: { 'product.product_id': productId } },
            {
                $lookup: {
                    from: "productvarients",
                    localField: "product.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
        ]).exec();
        
        // Check if the quantity is within limits
        const newCount = cart[0].product.count + count;
        if (newCount > cart[0].productDetails.quantity && count > 0) {
            
            return res.json({ success: false, message: "Quantity exceeds available stock." });
        } else if (newCount > 5) {
           
            return res.json({ success: false, message: "Maximum quantity limit exceeded." });
        } else if (newCount < 1) {
           
            return res.json({ success: false, message: "Quantity cannot be less than 1." });
        }
        
        // Update the count if it's within limits
        const response = await Cart.updateOne({ user: user }, {
            $inc: { 'product.$[elem].count': count }
        }, { arrayFilters: [{ "elem.product_id": productId }] });
        
        // Send success response to the client
        res.json({ success: true });
        console.log(response);
    } catch (error) {
        console.log(error);
        // Send error response to the client
        res.status(500).json({ success: false, message: "An error occurred while updating quantity." });
    }
};






//deleting items in the cart
const cartDelete = async (req, res, next) => {
    try {

        const id = new ObjectId(req.query.productId)
        console.log(id)
        // const product = await Product.findOne({ _id: id })
        // console.log(product);
        const deleteItem = await Cart.findOneAndUpdate({ user: new ObjectId(req.session.userData._id) }, {
            $pull: { product: { product_id: id } }
        })
        console.log(deleteItem);
        res.redirect('/cart')
    } catch (error) {
        console.log(error)

    }
}

module.exports = {
    cart,
    addToCart,
    checkproduct,
    cartDelete,
    changeCount,
}