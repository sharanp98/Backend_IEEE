const Post = require('../models/Post')

exports.home = function(req,res) {
    res.render("index")
}

exports.viewAllEvents = function(req,res) {
    //retrieve all posts
    Post.findAllPosts().then(function(posts){
        res.render("events", {posts : posts})
    }).catch(function(){
        res.redirect("/")
    })
}