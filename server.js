/**
* @author Victor Krenzel (102446176)
* @file server.js
* @desc WEB 322 Assignment
* ==> The main server file for the app
* ==> Handles the main route (/home)
* ==> Handles all the general app settings
*/

// Express settings
const express = require('express')
const app = express()

// General Imports
const hbs = require('express-handlebars')
const path = require('path')
const msg = require('./routes/user')

// Not important RN (for later use)
const cookieParser = require('cookie-parser')
// const cors = require('cors')

// General app settings
const favicon = require('serve-favicon')
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')))
app.use(express.static(path.join(__dirname, 'public')))

// Express Session Settings
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: "mongodb+srv://dbVkrenzel:QnzXuxUfGkRec92j@senecaweb.53svswz.mongodb.net/web322",
    collection: "sessions"
})
app.use(cookieParser('senecacollege-web322'))
app.use(session({
    secret: 'senecacollege-web322',
    resave: true, // <== Save the session to store even if it hasn't changed
    rolling: false, // <== Reset cookie maxAge on every request
    saveUninitialized: false, // <== Don't create a session for anonymous users
    store: store,
    cookie: {
        secure: false,
        maxAge: 60 * 60000 // <== 1 Hour
    }
}))

// Parser settings
const bodyParser = require('body-parser')
app.use(bodyParser.json())
// fixing "413 Request Entity Too Large" errors
app.use(express.json({limit: "50mb", extended: true}))
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))


// User Router Import
const user = require('./routes/user')
app.use('/user', user)

// Articles Router Import
const articles = require('./routes/articles')
app.use('/articles', articles)

// Blog Router Import
const blog = require('./routes/blog')
app.use('/blog', blog)

// Statis Folder
app.use(express.static("./public/"));

// View Engine Setup
app.set('view engine', '.hbs')
app.set('views', __dirname + '/views/partials')
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultView: 'default',
    layoutDir: __dirname + '/views/pages',
    partialsDir: __dirname + '/views/partials'
    // helpers: {
    //
    // }
}))

// Render index.hbs (main route)
app.get('/', (req, res) => res.redirect('/home'))

app.get('/home', (req, res) => {
    if(req.session.userLoggedIn) {
        console.log("User is logged in")
        res.render('index', {
            layout: false,
            username: req.session.user.username
        })
    }else{
        console.log("User is not logged in")
        res.render('index', {
            layout: false,
        })
    }
})

app.get('/home/logged-out', (req, res) => {
    const msg = 'Logged Out Successfully'
    if(req.session.userLoggedIn) {
        res.redirect('/home')
    }else{
        res.render('index', {
            layout: false,
            msg: msg
        })
    }
})

// Error handlers
app.use(function fourOhFourHandler (req, res) {
    res.status(404).send()
  })
app.use(function fiveHundredHandler (err, req, res, next) {
    console.error(err)
    res.status(500).send()
})

// Start server
const PORT = process.env.PORT || 8080
const date = new Date().toLocaleString()
app.listen(PORT, function (err) {
    if (err) {
      return console.error(err)
    }
    console.log(`[${date}] Connected on localhost:${PORT}`)
})