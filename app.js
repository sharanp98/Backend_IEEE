const express = require("express")
const session = require("express-session")
const fileupload = require("express-fileupload")
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const csrf = require('csurf')

const app = express()

app.use(fileupload())

//configuring sessions
let sessionOptions = session({
    secret: "Javascript",
    //store session in mongodb instead as local browser cookie
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60*24,
        httpOnly: true
    }
})

app.use(sessionOptions)
app.use(flash())


app.use(function(req,res,next){

    //make markdown avaiable within all ejs templates
    res.locals.filterUserHTML = function(content) {
        return markdown(content)
    }

    //make all flash messages available within all views
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    //create a middleware function for the user object in session (req.session.user) so that 
    // it can be used within any view
    res.locals.user = req.session.user
    next()
})

const router = require('./router')

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(express.static('public'))
app.set('views','views')
app.set('view engine','ejs')

app.use(csrf())

app.use(function(req,res,next){
    res.locals.csrfToken = req.csrfToken()
    next()    
})

app.use('/',router)

app.use(function(err,req,res,next){
    if(err){
        if(err.code == "EBADCSRFTOKEN") {
            req.flash("errors","Cross site request forgery detected.")
            req.session.save(()=>res.redirect("/admin"))
        } else{
            res.render("404")
        }
    }
})

app.use(function (req, res) {
    res.status(404).render("404");
});

module.exports = app