const express = require('express');
const crypto = require('crypto');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const hbs = require('express-handlebars');
const User = require('./models/User');

//Init Express App
const app = express();

//init Port
const port = 3000;

//middlewares
app.use(bodyParser.json());

//Init view engine
app.engine('hbs', hbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');

//Init gfs
let gfs;
let bucket;
//initDb string
const mongoUrl = 'mongodb://localhost:27017/upload-images-demo';

//Create mongo connection
function db() {
    mongoose.connect(mongoUrl, { useNewUrlParser: true });
    const conn = mongoose.connection;

    conn.once('open', () => {
        console.log('db is ready');
        //Init stream
        bucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'images'
        });
    });
}

db();

//Init GRIDFS storage
const storage = new GridFsStorage({
    url: mongoUrl,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }

                if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'
                    || file.mimetype === 'image/jpg') {
                    const filename = buf.toString('hex') + path.extname(file.originalname);
                    const fileInfo = {
                        filename: filename,
                        bucketName: 'images'
                    };

                    resolve(fileInfo);
                } else {
                    return reject(new Error('Must be a valid extension.(".png", ".jpeg", ".jpg")'));
                }
            });
        });
    }
})

const upload = multer({ storage });

//route to home page
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/upload', upload.single('avatar'), (req, res) => {
    const user = new User({
        username: req.body.username,
        imageUrl: req.file.id
    });

    user.save();

    res.redirect('/images');
});

app.get('/images', (req, res) => {
    User.find({}).then(users => {
        res.render('main.hbs', { users });
    })
})

//path for getting image from the client
app.get('/image/:imageId', (req, res) => {
    let id = new mongoose.mongo.ObjectID(req.params.imageId);

    let downloadStream = bucket.openDownloadStream(id);

    downloadStream.on('data', (chunk) => {
        res.write(chunk);
    });

    downloadStream.on('error', () => {
        res.sendStatus(404);
    });

    downloadStream.on('end', () => {
        res.end();
    });
})

app.listen(port, () => console.log(`Server listening to port ${port}`));