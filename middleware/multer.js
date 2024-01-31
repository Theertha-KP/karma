const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    isProduct = Object.keys(req.body).includes("productname");
    let destinationFolder;

    if (!isProduct) {
      destinationFolder = "./public/multer/users";
    } else {
      destinationFolder = "./public/multer/products";
    }

    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
    console.log(req.files.filename);
  },
});
module.exports = upload = multer({ storage: storage });

  