const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")
const bodyParser = require("body-parser")
const User = require("./Models/user")

const app = express()

//DB connection
mongoose.connect("mongodb://localhost:27017/Learn")

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error'))
db.once('open', () => {
    console.log("Connection is working")
})

//Configuration for express to handle file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb( null, "./Uploads"); // Destination for the Files to be stored
    },
    filename: function(req, file, cb){
        cb( null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


// Middlewares
app.use(express.json())
const userRoute = require("./Routers/userRoute")
const uploadRoute = require("./Routers/uploadRoute")

app.use('/user', userRoute)
app.use('/upload', uploadRoute);


const port = 3000
app.listen(port, () => {
    console.log(`Server is running on port ${ port }`)
})