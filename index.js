const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
console.log(app)

//Element

// app.get('/', (req, resp)=>{
//     resp.send('<h1>Home Page</h1>')
// })

// //second route will be ignored 
// // app.get('/', (req, resp) => {
// //     resp.send('<h1>Hello!!</h1>')
// // })

// app.get('/about', (req, resp)=>{
//     resp.send('<h1>About Us</h1>')
// })

// app.get('/contact', (req, resp)=>{
//     resp.send('<h1>Contact Us</h1>')
// })


//Load Webpage Files

const absPath = path.resolve('view')
const publicPath = path.resolve('public')

app.use(express.static(publicPath))

app.get('/', (req, resp) => {
    const headerFile = fs.readFileSync(absPath + '/header.html', 'utf-8')
    const homeFile = fs.readFileSync(absPath + '/home.html', 'utf-8')
    const footerFile = fs.readFileSync(absPath + '/footer.html', 'utf-8')

    const homePage = headerFile + homeFile + footerFile;

    resp.send(homePage)
})

app.get('/about', (req, resp) => {
    const headerFile = fs.readFileSync(absPath + '/header.html', 'utf-8')
    const aboutFile = fs.readFileSync(absPath + '/about.html', 'utf-8')
    const footerFile = fs.readFileSync(absPath + '/footer.html', 'utf-8')

    const aboutPage = headerFile + aboutFile + footerFile;

    resp.send(aboutPage)
})

app.get('/contact', (req, resp) => {
    const headerFile = fs.readFileSync(absPath + '/header.html', 'utf-8')
    const contactFile = fs.readFileSync(absPath + '/contact.html', 'utf-8')
    const footerFile = fs.readFileSync(absPath + '/footer.html', 'utf-8')

    const contactPage = headerFile + contactFile + footerFile;

    resp.send(contactPage)
})

app.use((req, resp) => {

    const headerFile = fs.readFileSync(absPath + '/header.html', 'utf-8')
    const notFoundFile = fs.readFileSync(absPath + '/404.html', 'utf-8')
    const footerFile = fs.readFileSync(absPath + '/footer.html', 'utf-8')

    const notFoundPage = headerFile + notFoundFile + footerFile;


    resp.status(404).send(notFoundPage)
})


app.listen('1219')

