const adminModal = require("../models/adminModel");

const { ObjectId } = require('mongodb')

const adminDashboard = async (req, res) => {
  try {
    if (req.session.admin) {
      console.log(req.session.admin);
      return res.render('admin/adminDashboard',{admin: true })
    } else {
      return res.render('admin/adminLogin', {  message: 'Please login' })
    }

  } catch (error) {
    console.log(error.message)

  }

}


//admin page
const adminPageLoad = async (req, res) => {
  try {
    if (req.session.admin) {
      res.redirect("/admin/dashboard");
    } else {
      console.log("Log in with admin credentials");
      res.render("admin/adminLogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyAdmin = async (req, res) => {
  try {
    const adminData = await adminModal.findOne({});
    console.log(req.body);

    console.log(adminData);
    if (adminData.name === req.body.name) {
      console.log("welcome admin");
      req.session.admin = adminData
      res.redirect("/admin/dashboard");
    } else {
      req.session.adminError = true
      res.redirect('/admin/')
    }
  } catch (error) {
    console.log(error.message);
  }
};

//logout
const adminlogout = async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin')
  })
}


//salesREPORT
const salesReport = async (req, res) => {
  try {
   let startDate = req.body.startDate
   let startDateISO = new Date(startDate)
   let endDate = req.body.endDate
   let endDateISO = new Date(endDate)
   console.log(startDate,startDateISO);

 
 const sales = await Order.aggregate([
   {
       $match: {
           "orders.orderStatus": 4,
           "orders.orderDate": {
               $gte: startDate,
               $lte: endDate
           }
       }
   },
   {
       $unwind: "$orders"
   },
//    {
//        $lookup: {
//            from: "users", // Replace with the actual name of the user collection
//            localField: "user",
//            foreignField: "_id",
//            as: "userDetails"
//        }
//    },
//    {
//        $addFields: {
//            paymentMethod: "$orders.payment",
//            userName: { $arrayElemAt: ["$userDetails.username", 0] },
//            amount: { $multiply: ["$orders.price", "$orders.count"] },
//            date: "$orders.orderDate",
//            // category: "$orders.category"
//        }
//    },
//    {
//        $project: {
//            _id: "$_id", // Use the main document's _id as orderId
//            paymentMethod: 1,
//            userName: 1,
//            amount: 1,
//            date: 1,
//            // category: 1
//        }
//    }
 ]);    
 console.log(sales);

       res.render('admin/salesReport', { sales, startDate, endDate })
   } catch (error) {
       next(error)
      }

};



module.exports = {
  adminPageLoad,
  verifyAdmin,
  adminDashboard,
  adminlogout,
  salesReport
};
