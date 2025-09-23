import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import 'dotenv/config';

const app = express();

const dbName = 'employee'
const local_db_url = process.env.LOCAL_DB_URL;
const live_db_url = process.env.LIVE_DB_URL;
const client = new MongoClient(live_db_url)
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
client.connect().then((connection) => {
    const db = connection.db(dbName)
    console.log("Database connected");


    //API: view all resume
    app.get('/api/resume', async (req, resp) => {
        const result = await db.collection('resume').find().toArray()
        resp.send(result)
    })

    //API: view single resume
    app.get('/api/resume/:id', async (req, resp) => {
        const result = await db.collection('resume').find({ '_id': new ObjectId(req.params.id) }).toArray()
        resp.send(result)
    })


    //UI: Home Page
    app.get('/', (req, resp) => {
        resp.render('home', { msg: req.query.msg || null })
    })

    //UI: view all resume
    app.get('/all-resume', async (req, resp) => {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;
        const totalRecords = await db.collection('resume').countDocuments()
        const totalPages = Math.ceil(totalRecords / limit);

        const result = await db.collection('resume').find({}).limit(limit).skip(skip).toArray()
        const msg = decodeURIComponent(req.query.msg) || null
        resp.render('all-resume', { result, msg, currentPage: page, totalPages })
    })

    //UI: view single resume
    app.get('/view/:id', async (req, resp) => {
        const result = await db.collection('resume').findOne({ '_id': new ObjectId(req.params.id) })
        if (!result) {
            return resp.status(404).send('Employee not found')
        }
        resp.render('view-resume', { result })
    })

    //UI: Add Resume Details using Form 
    app.get('/add-resume', (req, resp) => {
        resp.render('add-resume')
    })

    //UI: Insert Resume Details to DB 
    app.post('/submit-resume', async (req, resp) => {
        try {
            await db.collection('resume').insertOne(req.body)
            const encodedMsg= encodeURIComponent("New resume added")
            resp.redirect(`/all-resume?msg=`)
        } catch (err) {
            console.error(err);
            resp.status(500).send('Error in saving resume')
        }
    })

    //UI: Remove resume
    app.get('/remove/:id', async (req, resp) => {
        try {
            const result = await db.collection('resume').deleteOne({ '_id': new ObjectId(req.params.id) })
            const encodedMsg = encodeURIComponent("Resume removed successfully")
            resp.redirect(`/all-resume?msg=${encodedMsg}`)
        } catch (err) {
            console.log(err)
            resp.status(500).send('Error in removing resume')
        }
    })

    app.listen(PORT, () => {
        const response =
            { message: "App is running", status: "success", port: PORT };
        console.log(response)
    })
})
