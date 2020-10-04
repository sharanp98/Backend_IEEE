const User = require('../models/User')
const Post = require('../models/Post')

exports.mustBeLoggedIn = function(req,res,next) {
    if (req.session.user) {
        next()
    } else{
        req.flash("errors","You do not have permission to access this page. Try logging in.")
        req.session.save(function(){
            res.redirect("/admin")
        })
    }
}

exports.login = function(req,res) {
    let user = new User(req.body)
    user.login().then(function(result) {
        req.session.user = {username : user.data.username}
        // go to '/admin' only after the session has completed as session requires a trip to the database
        req.session.save(function(){
            res.redirect('/admin')
        })
    }).catch(function(e) {
        //using flash is the same as:
        //req.session.flash.errors = ['Invalid username/password'(e)]
        req.flash('errors',e)
        req.session.save(function(){
            res.redirect('/admin')
        })
    })
}

exports.logout = function(req,res) {
    req.session.destroy(function() {
        res.redirect('/admin')
    })
}

exports.home = function(req,res) {
    if (req.session.user) {
        //retrieve all posts
        Post.findAllPosts().then(function(posts){
            res.render("profile", {posts : posts})
        }).catch(function(){
            res.render("home-dashboard")
        })
    } else{
        //send the errors array inside session object to views
        res.render("home-guest" )
    }
}