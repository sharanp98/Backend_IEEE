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

exports.viewSingleEvent = async function(req,res) {
    try {
        //router.get(:id) is stored in req.params
        let post = await Post.findSingleById(req.params.id)
        res.render("single-event-screen", {post : post})
    } catch {
        res.render("404")
    }
}