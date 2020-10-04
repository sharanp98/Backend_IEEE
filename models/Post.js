const ObjectID = require('mongodb').ObjectID
const postsCollection = require('../db').db().collection('posts')
const sanitizeHTML = require('sanitize-html')

let Post = function(data,requestedPostId,fileName) {
    this.data = data
    this.errors = []
    this.requestedPostId = requestedPostId
    this.fileName = fileName
}

Post.prototype.cleanUp = function() {
    this.data = {
        date: sanitizeHTML(this.data.date.trim(),{allowedTags : [], allowedAttributes : {}}),
        title: sanitizeHTML(this.data.title.trim(),{allowedTags : [], allowedAttributes : {}}),
        short_desc: sanitizeHTML(this.data.short_desc.trim(),{allowedTags : [], allowedAttributes : {}}),
        body: sanitizeHTML(this.data.body.trim(),{allowedTags : [], allowedAttributes : {}}),
        venue: sanitizeHTML(this.data.venue.trim(),{allowedTags : [], allowedAttributes : {}}),
        participants: sanitizeHTML(this.data.participants.trim(),{allowedTags : [], allowedAttributes : {}}),
        fileName: sanitizeHTML(this.fileName,{allowedTags : [], allowedAttributes : {}}),
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
            let status = await this.actuallyUpdate()
            resolve(status)
        } catch {
            reject()
        }
    })
}

Post.prototype.actuallyUpdate = function() {
    return new Promise(async (resolve,reject) => {
        if (!this.errors.length) {
            let params = {
                date : this.data.date,
                title : this.data.title,
                short_desc : this.data.short_desc,
                body : this.data.body,
                venue : this.data.venue,
                participants : this.data.participants,
                fileName : this.data.fileName,
            }
            for(let prop in params) if(!params[prop]) delete params[prop];
            await postsCollection.findOneAndUpdate({_id : new ObjectID(this.requestedPostId)}, {$set:params})
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

Post.findAllPostsWithPagination = function(page,limit) {
    return new Promise(async function(resolve,reject) {
        let posts = await postsCollection.find({}).limit(limit * 1).skip((page - 1) * limit).sort({date : -1}).toArray()
        const count = await postsCollection.countDocuments();
        const totalPages = Math.ceil(count / limit)
        const currentPage = parseInt(page)
        if (posts.length) {
            resolve([posts,totalPages, currentPage])
        } 
        //no posts have been created yet
        else{
            reject()
        }
    })
}

Post.findAllPostsWithoutPagination = function() {
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

Post.saveImg = function(img){
    let fileName = img.name+'-'+Date.now()
    img.mv('./public/uploads/'+fileName, function(err) {
        if(!err) {
            console.log("Image uploaded successfully")
        } else {
            console.log(err)
        }
    })
    return fileName
}


module.exports = Post