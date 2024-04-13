const express = require("express");
var createError = require('http-errors')
const path = require("path");
const app = express();
const session = require("express-session");
const cookie = require("cookie-parser");
const dbConnect = require('./config/db');
const flash = require('express-flash');

//var hbs  = require('express-handlebars');
dbConnect()
var hbs = require('hbs')
const nocache = require("nocache");

// ...

app.use(nocache());


//bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



//setting view engine
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(__dirname + '/views/partials', function (err) { });
hbs.registerHelper('inc', (value) => {
  return parseInt(value) + 1;
})
hbs.registerHelper('eq', (a, b) => {
  console.log(a, b);
  return a == b
})

hbs.registerHelper('seq', (a, b) => {

  return String(a) == String(b)
})
hbs.registerHelper('datehelper', (date) => {

  return new Date(date).toLocaleDateString()
})
//morgan
var logger = require('morgan');
app.use(logger("dev"))

//joi vaidation
const { validationResult } = require('express-validator');




// Use the session middleware
app.use(
  session({
    secret: process.env.secret, // Change this to a random string
    resave: false,
    saveUninitialized: true,
  })
);

// Use connect-flash middleware
// app.use(
//   flash({
//     sessionKeyName: 'express-flash-message'
//   })
// )
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.info_msg = req.flash('info_msg');
  next();
});

//requiring routes
const user_route = require("./routes/userRoute");
const admin_route = require("./routes/adminRoute");
const { log } = require("console");
app.use("/", user_route);
app.use("/admin", admin_route);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



//error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(4000, () => {
  console.log('server started');
})


module.exports = app;