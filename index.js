import express from 'express'
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb'

const app = express();

const dbName = 'employee'

// const db_url = process.env.LOCAL_DB_URL;
const db_url = process.env.LIVE_DB_URL;

console.log(db_url)
const client = new MongoClient(db_url)
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
        const msg = req.query.msg ? decodeURIComponent(req.query.msg) : null;
        resp.render('all-resume', { result, msg, currentPage: page, totalPages })
    })

    //UI: view single resume
    app.get('/view/:id', async (req, resp) => {
        const result = await db.collection('resume').findOne({ '_id': new ObjectId(req.params.id) })
        if (!result) {
            return resp.status(404).send('Employee not found')
        }
        console.log(result);

        resp.render('view-resume', { result })
    })

    //UI: Add Resume
    app.get('/add-resume', (req, resp) => {
        resp.render('add-resume')
    })

    //UI: Insert Resume Details to DB 
    app.post('/submit-resume', async (req, resp) => {
        try {
            await db.collection('resume').insertOne(req.body)
            const encodedMsg = encodeURIComponent("New resume added")
            resp.redirect(`/all-resume?msg=${encodedMsg}`)
        } catch (err) {
            console.error(err);
            resp.status(500).send('Error in saving resume')
        }
    })
    //UI: Update Resume Form
    app.get('/update/:id', async (req, resp) => {
        const id = new ObjectId(req.params.id);
        try {
            const result = await db.collection('resume').findOne({ _id: id })
            if (!result) {
                return resp.status(404).send('Result not found');
            }
            console.log(result)
            resp.render('update-resume', { result })
        } catch (err) {
            console.error(err);
            resp.status(500).send('Error fetching resume')
        }
    })

    //UI: Update resume

    app.post('/update-resume/:id', async (req, resp) => {
        const id = new ObjectId(req.params.id)
        try {
            const result = await db.collection('resume').updateOne({ _id: id }, { $set: req.body })
            if(result){
                resp.status(200).send('Resume updated')
            }
        } catch (err) {
            console.error(err)
            resp.status(500).send('Something went wrong')
        }
    })

    // app.patch('/update/:id', async (req, resp) => {
    //     const id = new ObjectId(req.params.id);
    //     try {
    //         const updates = {}

    //         for (const key in req.body) {
    //             if (req.body[key] !== undefined || req.body[key] !== '') {
    //                 updates[key] = req.body[key]
    //             }
    //         }

    //         if (Object.keys(updates).length === 0) {
    //             return resp.status(400).json({ 'Message': 'No fields to update' })
    //         }
    //         const result = await db.collection('resume').updateOne(
    //             { '_id': id },
    //             { $set: updates }
    //         )
    //         if (result.modifiedCount === 0) {
    //             return resp.status(404).json({ message: 'Resume not found or fields unchanged' });
    //         }

    //         // ✅ send success message
    //         resp.status(200).json({ message: 'Resume udpated successfully' });

    //     } catch (err) {
    //         console.log(err)
    //         resp.status(500).send('Error while updating resume')
    //     }
    // })



    //UI: Remove resume
    app.delete('/remove/:id', async (req, resp) => {
        try {
            const result = await db.collection('resume').deleteOne({ '_id': new ObjectId(req.params.id) })
            if (result.deletedCount === 0) {
                return resp.status(404).json({ message: 'Resume not found or already removed' });
            }

            // ✅ send success message
            resp.status(200).json({ message: 'Resume removed successfully' });

        } catch (err) {
            console.log(err)
            resp.status(500).send('Error while removing resume')
        }
    })

    app.delete('/remove/:id/:field', async (req, resp) => {
        const id = req.params.id;
        const field = req.params.field;
        try {
            // if (!['education', 'experience', 'certifications', 'hobbies'].includes(field)) {
            //     return resp.status(400).json({ message: 'Invalid field' });
            // }

            const result = await db.collection('resume').updateOne(
                { '_id': new ObjectId(id) },
                { $unset: { [field]: "" } }
            )
            if (result.modifiedCount === 0) {
                return resp.status(404).json({ message: `${field} not found or already removed` });
            }

            // send JSON success message
            resp.status(200).json({ message: `${field} removed successfully` });

            // const encodedMsg = encodeURIComponent(`${field} removed successfully`)
            // resp.redirect(`/view-resume?msg=${id}`)
        } catch (err) {
            console.error(err);
            resp.status(500).json({ message: 'Error while removing section' });
        }
    })

    app.get('/test', (req, resp) => {
        resp.render('test')
    })

    app.listen(PORT, () => {
        const response =
            { message: "App is running", status: "success", port: PORT };
        console.log(response)
    })
})
