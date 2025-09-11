const express = require('express')
const querystring = require('querystring')
const path = require('path')
const fs = require('fs')

const app = express()

//HTML Elements

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


//HTML pages

const absPath = path.resolve('view')
const publicPath = path.resolve('public')

app.use(express.static(publicPath))

//ipcheck middleware
// function ipCheck(req, resp, next) {
//     const ipAddr = req.socket.remoteAddress;
// console.log(ipAddr)
//     if(!ipAddr.includes("192.168.43.149")){
//         next()
//     }else{
//         resp.send('You can not access this page.')
//     }  
// }

// app.use(ipCheck)

app.get('/login', (req, resp) => {
    resp.sendFile(absPath + '/login.html')
})

// login middleware
app.use('/submit', (req, resp, next) => {

    const dataBody = []
    req.on('data', (chunk) => {
        dataBody.push(chunk)
    })

    req.on('end', () => {
        const rawData = Buffer.concat(dataBody).toString();
        const readableData = querystring.parse(rawData)

        const username = readableData.username;
        const password = readableData.password;

        if (username.length > 10 && password.length > 5) {
            req.user = { username }
            next()
        } else {
            resp.redirect('/login')
        }

    })
})
app.post('/submit', (req, resp) => {
    resp.redirect('/')
})

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

