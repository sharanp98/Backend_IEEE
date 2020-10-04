const Post = require('../models/Post')

exports.viewCreateScreen = function(req,res) {
    res.render("create-post")
}

exports.create = function(req,res) {
    let fileName = Post.saveImg(req.files.img)
    let post = new Post(req.body,'',fileName)
    post.create().then(function(newId) {
        req.flash("success","New post created successfully")
        req.session.save (() => res.redirect(`post/${newId}`))
    }).catch(function(errors) {
        errors.forEach((error) => req.flash(error))
        req.session.save(() => res.redirect("/create-post"))
    })
}

exports.viewSingle = async function(req,res) {
    try {
        //router.get(:id) is stored in req.params
        let post = await Post.findSingleById(req.params.id)
        res.render("single-post-screen", {post : post})
    } catch {
        res.render("404")
    }

}

exports.viewEditScreen = async function(req,res) {
    try {
        let post = await Post.findSingleById(req.params.id)
        res.render("edit-post", {post : post})
    } catch{
        res.render("404")
    }
}

exports.edit = function(req,res) {
    let post
    if(req.files) {
        let fileName = Post.saveImg(req.files.img)
        post = new Post(req.body,req.params.id,fileName)
    }
    else {
        post = new Post(req.body,req.params.id)
    }
    post.update().then((status) => {
        if (status == "success") {
            req.flash("success","Post successfully updated")
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}`)
            })
        } else {
            post.errors.forEach(function(error) {
                req.flash("errors",error)
                req.session.save(function() {
                    res.redirect(`/post/${req.params.id}/edit`)
                })
            })
        }

    }).catch(() => {
        req.flash("errors","You do not have permission to perform that action")
        req.session.save(function() {
            res.redirect("/admin")
        })
    })
}

exports.delete = function(req,res) {
    Post.delete(req.params.id).then(() => {
        req.flash("success","Post successfully deleted")
        req.session.save(() => res.redirect("/"))
    }).catch(function() {
        req.flash("success","You do not have permission to perform that action. Try logging in")
        req.session.save(() => res.redirect("/"))
    })
}