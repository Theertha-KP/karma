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






module.exports = {
  adminPageLoad,
  verifyAdmin,
  adminDashboard,
  adminlogout
};
