var     Promise                 = require('bluebird');
var    mongoose                 = Promise.promisifyAll(require("mongoose"));
//var mongoose = require("mongoose");

var commentSchema = mongoose.Schema(
    {
        text:   String,
        author:
        {
            id:
            {
                type:     mongoose.Schema.Types.ObjectId,
                ref:    "User"
            },
            username:  String
        }
    }); // end Schema()

module.exports = mongoose.model("Comment", commentSchema);
