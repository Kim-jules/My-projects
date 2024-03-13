/* -- Import necessary modules --- */
require('dotenv').config();
const express = require(`express`);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet')
const secretKey = require('./key/genSecretKey');
const rateLimit = require('express-rate-limit');
const expressSession = require('express-session');
const multer = require("multer")

//Connection to the DB
mongoose.connect('mongodb://localhost:27017/WeChat')
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
});


// Configurations
const storage = multer.diskStorage({
  destination: function(req, file, cb){
      cb( null, "./Uploads"); // Destination for the Files to be stored
  },
  filename: function(req, file, cb){
      cb( null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });



//Middlewares
const app = express();
app.use(bodyParser.json())
app.use(helmet());
app.use(
  expressSession({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
  })
);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
});
app.use('/login', limiter);


// Use routes
const userRoutes = require('./routes/userRouter');
const addFriendShip = require('./routes/addFriendship')
const uploadRoute = require("./routes/uploadFile");

app.use('/user', userRoutes);
app.use('/user', addFriendShip);
app.use('/user/upload', uploadRoute)


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



