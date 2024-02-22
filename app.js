const express = require("express");
var createError=require('http-errors')
const path = require("path");
const app = express();
const session = require("express-session");
const cookie = require("cookie-parser");
const dbConnect = require('./config/db');
const flash = require('express-flash');
//var hbs  = require('express-handlebars');
dbConnect()
var hbs=require('hbs')
const nocache = require("nocache");

// ...

app.use(nocache());


//bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//setting view engine
// Register `hbs.engine` with the Express app.
// app.engine('handlebars', hbs.engine);

app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(__dirname + '/views/partials', function (err) {});
hbs.registerHelper('inc', (value) => {
  return parseInt(value) + 1;
})
hbs.registerHelper('eq', (a,b) => {
  return a===b
})
//morgan
var logger = require('morgan');
app.use(logger("dev"))





// Use the session middleware
app.use(
    session({
      secret: "keyboard-cat", // Change this to a random string
      resave: false,
      saveUninitialized: true,
    })
  );
  //requiring routes
  const user_route = require("./routes/userRoute");
  const admin_route = require("./routes/adminRoute");
  app.use("/", user_route);
  app.use("/admin", admin_route);

  // catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });

// Initialize connect-flash to use flash messages
app.use(flash());

  
  //error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  
  app.listen(4000,()=>{
    console.log('server started');
  })


  module.exports = app;