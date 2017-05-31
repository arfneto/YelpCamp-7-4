var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");

// NEW route
router.get("/new", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err)
        {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else
        {
            res.render("comments/new", {campground: campground});
        }
    });
});

// POST route
router.post("/", isLoggedIn, function(req, res){
      Campground.findById(req.params.id, function(err, campground){
        if(err)
        {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else
        {
            // campground selected, now post new comment with
            // data in the form
            // the template brings comment[text] and comment[author]
            //console.log("from the form " + req.body.comment);
            Comment.create
            (
                {
                    text:   req.body.text,
                    author: 
                    {
                        id: req.params.id,
                        username: req.body.author
                    }
                    
                },
                function(err, comment)
                {
                    if(err)
                    {
                        console.log(err);
                        res.redirect("/campgrounds");
                    }
                    else
                    {
                        campground.comments.push(comment);
                        campground.save();
                        res.redirect("/campgrounds/" + campground._id);
                    }
                }   // end function()
            );  // end create()
        }
    });
}); // end router.post()

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