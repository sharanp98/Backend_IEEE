const Post = require('../models/Post')

exports.home = function(req,res) {
    res.render("index")
}

exports.viewAllEvents = function(req,res) {
    const { page = 1, limit = 5 } = req.query;
    //retrieve all posts
    Post.findAllPostsWithPagination(page,limit).then(function([posts, totalPages, currentPage]){
        console.log(totalPages,currentPage)
        res.render("events", {posts : posts, totalPages: totalPages, currentPage : currentPage})
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