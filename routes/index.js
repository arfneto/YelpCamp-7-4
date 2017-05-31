var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var User = require("../models/users");
var passport = require("passport");

// ROOT route
router.get("/", function(req, res){
    res.render("landing");
});

//show register form: New User
router.get("/register", function(req, res){
    res.render("register");
});

//create user: Auth POST route
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register
    (
        newUser, 
        req.body.password,
        function(err, user)
        {
            if(err)
            {
                console.log(err);
                return res.render("register");
            }
            passport.authenticate("local")
            (
                req, 
                res,
                function()
                {
                    res.redirect("/campgrounds");
                }
            );   // end passport.authenticate()
        } // end function
    ); // end User.register()
}); // end app.post()

//show login form 
router.get("/login", function(req, res){
    res.render("login");
});

//login post
router.post
(
    "/login",
    passport.authenticate
    (
        "local",
        { 
            successRedirect: "/campgrounds",
            failureRedirect: "/login"
        }
    ),  // end authenticate()
    function(req, res){}
); // end app.post()

// logout route
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campgrounds");
}); // end app.get()

//check if a user is logged in
function isLoggedIn(req, res, next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
}   // end function

module.exports = router;