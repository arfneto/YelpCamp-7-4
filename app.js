var express     = require("express"),
    bodyParser  = require("body-parser"),
    Campground  = require("./models/campgrounds"),
    Comment     = require("./models/comments"),
    User        = require("./models/users"),
    yTools      = require("./middleware");

var     Promise                 = require('bluebird');
var    mongoose                 = Promise.promisifyAll(require("mongoose"));
var    passport                 = require("passport");
var    LocalStrategy            = require("passport-local");
var    passportLocalMongoose    = require("passport-local-mongoose");

var    app         = express();

var     mongooseConnectString   = "mongodb://localhost/v7-2";

//  reqiuring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");

mongoose.connect(mongooseConnectString);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once Upon A Time In The West",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

// ROUTES =====================================================================

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// Auth ROUTES

//
// seed: populate campgrounds db
//
app.get(
    "/seed",
    yTools.isLoggedIn,
    function(req, res)
    { 
        res.render("seed");
    }   // end function
    );  // end app.get()
//
// seed route
app.post(
    "/seed",
    yTools.isLoggedIn,
    yTools.clearCampgrounds,
    yTools.clearComments,
    yTools.createCampgroundsP,
    yTools.createCommentsP,
    function(req, res)
    {
        console.log("seed POST route");
        res.redirect("/campgrounds");
    }
);
//
// seedComm: populate only comments db
app.get(
    "/seedComm",
    yTools.isLoggedIn,
    function(req, res)
    { 
        res.render("seedComm");
    }   // end function
    );  // end app.get()

app.post(
    "/seedComm",
    yTools.isLoggedIn,
    yTools.createCommentsP,
    function(req, res)
    {
        console.log("seedCom POST route");
        res.redirect("/campgrounds");
    }
);
    
//
// report: this routes prints a form with 
//  all dta on campgrounds
//
app.get(
    "/report",
    yTools.isLoggedIn,
    function(req, res)
    { 
        Campground.find().populate("comments").exec
        (
            function(err, allCampgrounds)
            {
                if(err)
                {
                    console.log(err);
                } 
                else
                {
                    res.render
                    (
                        "report",
                        {
                            campgrounds:    allCampgrounds//,
                            //currentUser:    req.user
                        }
                    );  // end res.render()
                }   // end if
            }   // end function()
        );  // end find()
    }   // end function
);  // end app.get()

app.get(
    "/register", 
    function(req, res)
    { 
        res.render("register");
    }   // end function
    );  // end app.get()

app.post(
    "/register", 
    function(req, res)
    { 
        var newUser = new User({username: req.body.username});
        User.register
        (
            newUser, 
            req.body.password,
            function(err, user)
            {
                if(err)
                {
                    req.flash("error", err.message);
                    return res.render("register");
                }
                passport.authenticate("local")
                (
                    req, 
                    res,
                    function()
                    {
                        return res.redirect(
                            {"success":"User "  + user.username + " created. Welcome to YelpCamp"},
                            "/seed"
                            );  // end res.redirect()
                    }   // end function
                );   // end passport.authenticate()
            } // end function
        ); // end User.register()
    }   // end function
);  // end app.get()

app.get(
    "/login", 
    function(req, res)
    { 
        res.render("login");
    }   // end function
    );  // end app.get()

app.post(
    "/login",
    passport.authenticate
    (
        "/local",
        {
            successRedirect:    "/seed",
            failureRedirect:    "/login"
        }
    ),
    function(req, res)
    { 
    }   // end function
);  // end app.get()

app.get(
    "/logout", 
    function(req, res)
    { 
        req.logout;
        res.redirect("/");
    }   // end function
    );  // end app.get()

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server V7.4 Has Started!");
});