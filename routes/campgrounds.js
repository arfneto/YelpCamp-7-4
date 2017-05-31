var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");

// INDEX - Show ALL
router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render
            (
                "campgrounds/index",
                {
                    campgrounds:    allCampgrounds//,
                    //currentUser:    req.user
                }
            );  // end res.render()
        }
    });
});

// CREATE - Create a new Entry
router.post("/", function(req, res){
    // new data
    var name= req.body.name;
    var image = req.body.image;
    var description = req.body.description;

    var newCampground = {
        name: name, 
        image: image,
        description: description
    };
       
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds")
        }
    })
});

// NEW - Show FORM to create a new entry
router.get("/new", function(req, res){
    res.render("campgrounds/new");
});

// SHOW - Extended info about ONE entry
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

module.exports = router;