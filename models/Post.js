const ObjectID = require('mongodb').ObjectID
const postsCollection = require('../db').db().collection('posts')
const sanitizeHTML = require('sanitize-html')

let Post = function(data,requestedPostId) {
    this.data = data
    this.errors = []
    this.requestedPostId = requestedPostId
}

Post.prototype.cleanUp = function() {
    this.data = {
        date: sanitizeHTML(this.data.date.trim(),{allowedTags : [], allowedAttributes : {}}),
        title: sanitizeHTML(this.data.title.trim(),{allowedTags : [], allowedAttributes : {}}),
        body: sanitizeHTML(this.data.body.trim(),{allowedTags : [], allowedAttributes : {}}),
        url: sanitizeHTML(this.data.url.trim(),{allowedTags : [], allowedAttributes : {}}),
    }
}


Post.prototype.create = function() {
    return new Promise((resolve,reject) => {
        this.cleanUp()
        if (!this.errors.length) {
            //save post into db
            postsCollection.insertOne(this.data).then((info) => {
                resolve(info.ops[0]._id)
            }).catch(() => {
                this.errors.push("DB error")
                reject(this.errors)
            })
        } else{
            reject(this.errors)
        }
        
    })
}

Post.prototype.update = function() {
    return new Promise(async (resolve,reject) => {
        try {
            let post = await Post.findSingleById(this.requestedPostId)
            let status = await this.actuallyUpdate()
            resolve(status)
        } catch {
            reject()
        }
    })
}

Post.prototype.actuallyUpdate = function() {
    return new Promise(async (resolve,reject) => {
        this.cleanUp()
        if (!this.errors.length) {
            await postsCollection.findOneAndUpdate({_id : new ObjectID(this.requestedPostId)}, {$set : {
                date : this.data.date,
                title : this.data.title,
                body : this.data.body,
                url : this.data.url,
            }})
            resolve("success")
        } else {
            resolve("failure")
        }
    })
}


Post.findSingleById = function(id) {
    return new Promise(async function(resolve,reject) {
        if(!ObjectID.isValid(id)) {
            reject()
            return
        }
        let post = await postsCollection.findOne({_id : new ObjectID(id)})
        if (post) {
            resolve(post)
        } else{
            reject()
        }
    })
}

Post.findAllPosts = function() {
    return new Promise(async function(resolve,reject) {
        let posts = await postsCollection.find({}).sort({date : -1}).toArray()
        if (posts.length) {
            resolve(posts)
        } 
        //no posts have been created yet
        else{
            reject()
        }
    })
}

Post.delete = function(postIdToDelete) {
    return new Promise(async (resolve,reject) => {
        try {
            await postsCollection.findOneAndDelete({_id : new ObjectID(postIdToDelete)})
            resolve()
        } catch {
            reject()
        }
    })
}


module.exports = Post