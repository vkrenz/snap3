const router = require('express').Router()

// Mongo DB Settings
const mongoose = require('mongoose')
const url = "mongodb+srv://dbVkrenzel:QnzXuxUfGkRec92j@senecaweb.53svswz.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(url)
const defaultBlogImgURL = "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
// MongoDB - Define Blog_Entries Schema
const Blog = mongoose.model("blogs", new mongoose.Schema({
    "blogImgURL": {
        "type": String,
        "default": defaultBlogImgURL
    },
    "blogID": {
        "type": Number,
        "unique": true
    },
    "name": String,
    "date": {
        "type": Date,
        "default": new Date().toLocaleString()
    },
    "category": {
        "type": String,
        "default": "General"
    },
    "isHero": {
        "type": Boolean,
        "default": false
    },
    "content": String
    })
)

// Create a test blog_entry
Blog.exists({blogID: 1}, (err, entry) => {
    if(err) {
        console.log(err)
    }else{
        console.log('[Exists] Test Blog Entry:', entry)
        if(!entry) {
            console.log("Test Blog Entry not found! Creating one...")
            const testBlogEntry = new Blog({
                blogID: 1,
                name: "Test Blog Entry! Check It Out!",
                isHero: true,
                content: 'This is some generic place holder text. This is for Seneca College\'s Web322 Class Assignment.'
            }).save().then(() => {
                console.log("Test Blog Entry Created!")
            })
        }
    }
})

// new Blog({
//     blogID: 3,
//     name: "What Are Web 2.0 and Web 3.0?",
//     category: "Web 3.0",
//     content: "Web 2.0 and Web 3.0 refer to successive iterations of the web, compared with the original Web 1.0 of the 1990s and early 2000s. Web 2.0 is the current version of the internet (a term often used interchangeably with the web) with which we are all familiar. Web 3.0 or Web3 is the third generation of the World Wide Web. Currently a work in progress, it is a vision of a decentralized and open Web with greater utility for its users. Web refers to the World Wide Web (WWW), the internet’s core information retrieval system. The WWW initialism used to (and often still does) preface a web address and was one of the first characters typed into a web browser when searching for a specific resource online. Internet pioneer Tim Berners-Lee is credited with coining the term World Wide Web to refer to the global web of information and resources interconnected through hypertext links.",
//     blogEntryImgURL: "https://www.trustedreviews.com/wp-content/uploads/sites/54/2021/11/Meta-image-920x518.png"
// }).save()

router.get('/', (req, res) =>{
    // Displays all blog entries
    // Convert Blog Entries obj ==> Array
    var entriesArr = []
    Blog.find({/** All Blog Entries */}, (err, entries) => {
        if(err) {
            console.log(err)
        }else{
            entriesArr = entries.map(entry => ({
                blogImgURL: entry.blogImgURL,
                blogID: entry.blogID,
                name: entry.name,
                date: entry.date,
                category: entry.category,
                isHero: entry.isHero,
                content: entry.content

            }))
            // Then
            // entriesArr.forEach(entry => console.log(entry.name))
            if(req.session.userLoggedIn) {
                res.render('blog', {
                    layout: false,
                    entries: entriesArr,
                    username: req.session.user.username
                })
            }else{
                res.render('blog', {
                    layout: false,
                    entries: entriesArr
                })              
            }
        }
    })  
})

module.exports = router