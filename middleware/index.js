//
// yTools middleware folder
//
var Campground =    require("../models/campgrounds");
var Comment =       require("../models/comments");
var User =          require("../models/users");

var yTools = {};

var ipsum = "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search";

//  mongoose + bluebird
var Promise = require("bluebird");

Promise.promisifyAll(require("mongoose"));



function logCampground(header, camp)
{
    //  log campground
    console.log("============================================= ");
    console.log(header + " ==> returned campground follows ");
    console.log("    author id: " + camp.name);
    console.log("           id: " + camp._id);
    console.log("        image: " + camp.image);
    console.log("        price: " + camp.price);
    console.log("         user: " + camp.author.username);
    console.log("     comments: " + camp.comments.length);
    console.log("  description: " +
        camp.description.slice(0,30) +
        " ...");
        camp.comments
        .forEach(
            function(comment)
            {
                console.log("            comment _id: " + comment);
            }
        );  // end forEach
}  // end function()



function logComment(header, oneComment)
{
    //  log comment
    console.log("============================================= ");
    console.log(header + " ==> returned comment follows ");
    console.log("    author id: " + oneComment.author.id);
    console.log("         user: " + oneComment.author.username);
    console.log("         text: " +
        oneComment.text.slice(0,30) +
        " ...");
}   // end function()



//
//===================== exported stuff =========================
//



//
//
//
yTools.isLoggedIn = function(req, res, next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
};   // end function isLoggedIn()



//
//
//
yTools.createCampgroundsP = 
    function(req, res, next)
    {
        var allToCreate = [];

        User.findOne(
            {username: req.user.username}, 
            function(err, foundUser)
            {
                if(err)
                {
                    console.log(err + " Error locating user");
                    res.redirect("/");
                }
                else
                {
                    console.log
                    (
                        "createCampgrounds(): User ´"+
                        req.user.username +
                        "´ found in database"
                    );
                    console.log
                    (
                        "createCampgrounds(): Inserting "+
                        req.body.nCampgrounds +
                        " Campground (s) in database"
                    );
                    for(var ix=1; ix<=req.body.nCampgrounds; ix++)
                    {
                        allToCreate
                        .push(
                            Campground.create
                            (
                                {
                                    author:
                                    {   
                                        id: foundUser._id,
                                        username: req.user.username
                                    },
                                    name: "Camp " + ix.toString(),
                                    price: ix * 10,
                                    image: "/images/Mountain-" + ix%10 + ".jpg",
                                    description: "Description of Camp " +
                                        ix.toString() + "..." + ipsum,
                                    comments: []
                                }
                            )  // end create
                        );  //end push()
                    }   // end for
                    Promise.all(allToCreate)
                    .then(  () => 
                            {
                                console.log("CreateCampgroundsP(): All Campgrounds created");
                                return next();
                            },
                            trouble => 
                            { 
                                console.log("CreateCampgroundsP(): ERROR creating Campgrounds");
                                console.log(trouble)}
                    ).return;
                }
            }
        );  // end findOne()
    };  // end function CreateCampgroundsP()



//
// using promises 
//
yTools.createCommentsP = 
    function(req, res, next)
    {
        var toCreate = 0;
        var navCampgrounds = 
            new Promise
            (
                function (resolve, reject)
                {
                    Campground.update().cursor()
                    .on('data',
                        function(one)
                        {
                            // now create toCreate comments for campground one
                            toCreate = 1 + Math.floor(Math.random() * req.body.nComments);
                            fillCampground(toCreate,one);
                        }   // end function()
                    )   // end on
                    .on(
                        'error',
                        () => {console.log("createCommentsP(): Campground (s) updated with new comment (s)")}
                    )
                    .on('end',
                        () => {console.log("createCommentsP(): Campground (s) updated with new comment (s)")}
                    );
                }   // end function()
            );   // end promise

        navCampgrounds.then
        (   
            function(one)
            {
               console.log("createCommentsP(): All Campgrounds processed"),
               console.log(one);
            }   // end function()
        )
        .return;
        
        return next();  // middleware ends here



        //
        // fill campground 'one' with random n up to 'toCreate' comments
        //
        function fillCampground(toCreate, one)
        {
            var ix = 0;
            var allComments = [];
            // create toCreate comments for campground one
            for(ix=1; ix<=toCreate;ix++)
            {
                // create comment and push into array
                allComments.push(
                    {
                        text:   "[" + ix + "/" + toCreate +
                                "] This place --- " + one.name + 
                                " --- is ok!!!! " + ipsum,
                        author:
                        {
                            id: one.author.id,
                            username: req.user.username
                        }
                    
                    }    
                );  // end push()
            }   // end for
            // create all in a single promise
            Comment.create
            (
                allComments,    // create all comments
                function(err,comments)
                {
                    if(err)
                    {
                        console.log("fillCampground(): error");
                    }
                    else
                    {
                        console.log("fillCampground(): " + comments.length + " comment (s) created");
                    }
                }   // end function()
            )
            .then
            (   function(comments)
                {
                    comments
                    .forEach(
                        function(comment)
                        {
                            //console.log("fillCampground(): comment _id:" + comment._id);
                            one.comments.push(comment);
                        }
                    );  // end forEach()
                    one.saveAsync(one)
                    .then
                    (
                        console.log("fillCampground(): Campground '" + one.name + "' updated")
                    );
                }
            );  // end .create()
        }   // end function();
    };  // end function()
    
    
    
//
//
//
yTools.createComments = 
    function(req, res, next)
    {
        function * commGen(toCreate, oneCampground)
        {
            var iy = 1;
            var comment = new Comment;
            while(iy <= toCreate)
            {
                // yields a new comment each time, up to toCreate
                console.log(
                    "commGen():     inserting " +
                    iy + " of " + toCreate +
                    " comments for Campground " +
                    oneCampground.name
                );
                comment.author.username = req.user.username;
                comment.author.id = oneCampground.author.id;
                comment.text = "This place --- " + 
                    oneCampground.name + 
                    " --- is great!!!! (" + iy + ") "+ 
                    ipsum;
                console.log(
                    "commGen():     generated comment with " + 
                    comment.text.length +
                    " positions ");
                iy++;
                yield comment;             
            }   // end while
            console.log("commGen():     Out of While loop");
            comment.text = "";
            yield comment;
        }   // end function *()
        
        var logComment = function(oneComment)
            {
                //  log comment
                console.log("============================================= ");
                console.log("createComment(): ==> returned comment follows ");
                console.log("    author id: " + oneComment.author.id);
                console.log("         user: " + oneComment.author.username);
                console.log("         text: " +
                    oneComment.text.slice(0,35) +
                    " ...");
            };  // end function()
            
        var createComment = function(one)
        {
            var oneComment = new Comment;
            var toCreate = 1 + Math.floor(Math.random() * req.body.nComments);
            var allCreates = [];
            var commGenI = commGen(toCreate, one);
            oneComment = commGenI.next(toCreate, one).value;
            logComment(oneComment);
            while(oneComment.text && oneComment.text.length > 0)
            {
                Comment.create(oneComment).then
                (
                    function(comment)
                    {
                        one.name = one.name + ".";
                        one.comments.push(comment);
                        one.save();
                        console.log("   ==> inserted comment. id=" + comment._id);
                    } // end function
                );  // end push
                oneComment = commGenI.next(toCreate, one).value;
                logComment(oneComment);
            }   // end while
        };  // end function createComment()

///
///     CODE STARTS HERE
///

        var cursor = Campground.findOne().cursor();
        cursor.eachAsync(
            function(one)
            {
                    createComment(one);
                    console.log("createComments(): back from createComment " + 
                    one.name);
                    console.log("createComments(): # of comments: " + one.comments.length);
            }   // end function
        )
        .then(
           console.log("createComments(): exiting")
           )
        .return;
        return next();  // middleware ends here
};    // end function createComments()
    


//
// clear Comments database
//
yTools.clearComments = function(req, res, next)
{
    // remove all comments
    Comment.remove
    (
        {},
        function(err)
        {
            if(err)
            {
                console.log("error clearing Comments: " + err);
                res.redirect("/");
           }
            else
            {
                console.log("clearComments(): ALL comment items removed");
                return next();
            }
        } // end function
    );  // end Comment.remove()
};



//
// clear Campgrounds database
//
yTools.clearCampgrounds = function(req, res, next)
{
    // remove all campgrounds
    Campground.remove
    (
        {},
        function(err)
        {
            if(err)
            {
                console.log("error clearing Comments: " + err);
                res.redirect("/");
            }
            else
            {
                console.log("clearCampgrounds(): ALL  items removed");
                return next();
            }
        } // end function
    );  // end Comment.remove()
};

module.exports = yTools;