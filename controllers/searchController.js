const Product = require("../models/productModel");
const { ObjectId } = require('mongodb')

const searchItem = async (req, res, next) => {
    try {
        const searchQuery = req.body.searchQuery
        console.log(searchQuery);
        const pipeline = [
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'category'
                }
            }, {
                $match: {
                    isListed: true,
                    isProductBlocked: false,
                    $or: [
                        { productName: { $regex: searchQuery, $options: 'i' } },
                        { 'category.categoryName': { $regex: searchQuery, $options: 'i' } }
                    ]

                }
            }
        ]

        const search = await Product.aggregate(pipeline).exec()


        console.log(search);
        res.render('user/search', { search })

    } catch (error) {
        console.log(error.message);

    }
}

module.exports = {
    searchItem
}