const router = require('express').Router()

// General settings
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

// Mongo DB Settings
const mongoose = require('mongoose')
const url = "mongodb+srv://dbVkrenzel:QnzXuxUfGkRec92j@senecaweb.53svswz.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(url)
// const defaultArticleImgURL = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
// MongoDB - Define Article Schema
const Article = mongoose.model("articles", new mongoose.Schema({
    "articlePhoto": String,
    "articleID": {
        "type": String,
        "required": true,
        "default": () => uuidv4(),
        "index": { unique: true }
    },
    "name": String,
    "date": {
        "type": Date,
        "default": new Date().toLocaleString()
    },
    "author": String,
    "authorEmail": {
        "type": String,
        "default": null
    },
    "rating": {
        "type": Number,
        "default": 0
    },
    "content": String
    })
)

// Multer Settings 
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const PATH = path.join(__dirname, '..', 'public', 'upload')
        cb(null, PATH)
    },
    filename: (req, file, cb) => {
        console.log('[File]:', file)
        cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage: storage})

router.get('/', (req, res) =>{
    const alert = req.query.alert
    var articlesArr = []
    Article.find({/** All Articles */}, (err, articles) => {
        if(err) {
            console.log(err)
        }else{
            articlesArr = articles.map(article => ({
                articleID: article.articleID,
                name: article.name,
                author: article.author,
                authorEmail: article.authorEmail,
                rating: article.rating,
                content: article.content,
                articlePhoto: article.articlePhoto
            }))
            // Then
            if(req.session.userLoggedIn) {
                res.render('articles', {
                    layout: false,
                    articles: articlesArr,
                    username: req.session.user.username,
                    isAdmin: req.session.isAdmin,
                    alert: alert ? alert : undefined
                })
            }else{
                res.render('articles', {
                    layout: false,
                    articles: articlesArr,
                    alert: alert ? alert : undefined     
                })    
            }
        }
    })  
})

router.get('/read', (req, res) =>{
    const id = req.query.id
    Article.findOne({articleID: id}, (err, article) => {
        if(err) {
            console.log(err)
        }else{
            var stars = ''
            var maxStars = 5
            for(var i = 0; i < article.rating; i++) {
                stars += '<i class="fa-solid fa-star"></i>'
                maxStars -= 1
            }
            for(var i = 0; i < maxStars; i++) {
                stars += '<i class="fa-regular fa-star"></i>'
            }
            if(req.session.userLoggedIn) {
                res.render('read', {
                    layout: false,
                    name: article.name,
                    author: article.author,
                    rating: stars,
                    content: article.content,
                    username: req.session.user.username,
                })
            }else{
                res.render('read', {
                    layout: false,
                    name: article.name,
                    author: article.author,
                    rating: stars,
                    content: article.content
                })

            }
        }
    }) 
})

router.get('/edit-article', (req, res) =>{
    const id = req.query.id      
    // Confirm with user
    Article.findOne({articleID: id}, (err, article) =>{
        if(err) {
            console.log(err)
        }else{
            res.render('edit-article', {
                layout: false,
                id: article.articleID,
                name: article.name,
                author: article.author,
                rating: article.rating,
                content: article.content
            })
        }
    })
})

router.post('/edit-article', 
upload.single('articlePhoto'),
(req, res) => {
const { id, submit } = req.query
if(submit) {
    const { url, name, author, rating, content } = req.body
    const File = req.file ? true : false
    const articlePhoto = File ? 
    {
        data: fs.readFileSync(path.join(__dirname, '..', 'public', 'upload', req.file.filename)),
        contentType: 'image/png'
    } : undefined
    const filter = { articleID: id }
    const update = {
        articlePhoto: articlePhoto == undefined ? console.log('Article photo wasn\'t updated!') : `/upload/${req.file.filename}`,
        name: name,
        author: author,
        rating: rating,
        content: content
    }
    console.log(articlePhoto)
    Article.findOneAndUpdate(filter, update, (err, article) => {
        if(err) {
            console.log(err)
        }else{
            console.log(article.name, article.author, article.rating)
            const alert = 'Updated article successfully'
            res.redirect(`/articles?alert=${alert}`)
        }
    })
}
})


router.post('/add-article', 
upload.single('articlePhoto'),
(req, res) => {
    const { name, author, rating, content } = req.body
    const File = req.file ? true : false
    const articlePhoto = File ? 
    {
        data: fs.readFileSync(path.join(__dirname, '..', 'public', 'upload', req.file.filename)),
        contentType: 'image/png'
    } : undefined
    new Article({
        articlePhoto: articlePhoto == undefined ? '' : `/upload/${req.file.filename}`,
        name: name,
        author: author,
        rating: rating,
        content: content
    }).save().then(() => {
        console.log('New article created')
    }).catch(err => {
        console.log(`Error: ${err}`)
    })
    const alert = `Article created successfully`
    res.redirect(`/articles?alert=${alert}`)
})

router.get('/remove-article', (req, res) =>{
    const id = req.query.id
    const remove = req.query.remove ? true : false
    console.log(id, remove)
    if(remove) {
        Article.deleteOne({articleID: id}, (err, article) => {
            if(err) {
                console.log(err)
            }else{
                console.log('Article ID#' + id, 'has been removed successfully. Redirecting back to /articles.')
                const alert = `Article ${id} has been successfully removed`
                res.redirect(`/articles?alert=${alert}`)
            }
        })
    }else{
        // Confirm with user
        res.render('remove-article', {
            layout: false,
            id: id
        })
    }
})

module.exports = router