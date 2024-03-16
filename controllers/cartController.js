const Cart = require('../models/cartModel')
const { ObjectId } = require('mongodb')

//cart 


const cart = async function (req, res, next) {
    try {
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
                    from: "products",
                    localField: "product.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            }, {
                $project: {
                    _id: 1,
                    user: 1,
                    product: 1,
                    productDetails: 1,
                    total: { $multiply: ['$product.count', '$productDetails.price'] }
                }
            }
        ]).exec()
        console.log(cartData);
        const total = cartData.reduce((acc, val) => {
            return acc + val.total
        }, 0)
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
        
        const user = req.session.userData._id;
        //get the id by the params in a tag
        const productId = new ObjectId(req.params.id)
        // //find the user already exist in the cart
        let userFound = await Cart.findOne({ user })
        console.log(userFound);
        if (!userFound) {
            //creating a new cart
            const newCart = new Cart({
                user,
                product: [{
                    product_id: productId,
                    count: 1
                }]
            })
            await newCart.save();
        } else {
            if (userFound.product.find(product => productId.equals(product.product_id))) {
                return false
            }
            //checking for already existing products in the cart
            await Cart.updateOne({ user }, {
                $push: {
                    product: {
                        product_id: productId, count: 1
                    }
                }
            })

        }

        res.redirect(`/singleproduct/${productId}`)

    } catch (error) {
        console.log(error);
    }
}


const changeCount = async (req, res) => {
    try {
        console.log("changecount");
        const user = new ObjectId(req.session.userData._id)
        const productId = new ObjectId(req.params.id)
        const count = Number(req.params.count)
        const cart = await Cart.aggregate([
            { $match: { user: user } },
            { $unwind: "$product" },
            { $match: { 'product.product_id': productId } },

            {
                $lookup: {
                    from: "products",
                    localField: "product.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },

            { $unwind: "$productDetails" },


        ]).exec()
        // console.log(cart);
        console.log(cart[0].product.count + count);
        if ((cart[0].product.count + count > cart[0].productDetails.quantity && count > 0) || cart[0].product.count + count > 5 || cart[0].product.count + count < 1) {
            return false
        }
        const response = await Cart.updateOne({ user: user }, {
            $inc: { 'product.$[elem].count': count }
        }, { arrayFilters: [{ "elem.product_id": productId }] })

        res.json({ success: true })
        console.log(response);

    } catch (error) {
        console.log(error);
    }
}





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