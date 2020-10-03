const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const visitorController = require('./controllers/visitorController')

//visitor related queries
router.get("/",visitorController.home)
router.get("/events",visitorController.viewAllEvents)

//user related queries
router.get('/admin',userController.home)
router.post('/login',userController.login)
router.post('/logout',userController.logout)

//post related queries
router.get("/create-post",userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post("/create-post",userController.mustBeLoggedIn,postController.create)
router.get("/post/:id",userController.mustBeLoggedIn, postController.viewSingle)
router.get("/post/:id/edit",userController.mustBeLoggedIn, postController.viewEditScreen)
router.post("/post/:id/edit",userController.mustBeLoggedIn, postController.edit)
router.post("/post/:id/delete",userController.mustBeLoggedIn, postController.delete)

module.exports = router 