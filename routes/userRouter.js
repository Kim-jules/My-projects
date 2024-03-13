const express = require('express');
const router = express.Router();
const { User, passwordSchema, isValidEmail, isValidPhoneNumber } = require('../Models/Users');
const dotenv = require('dotenv')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

dotenv.config();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: "smtp.elasticemail.com", 
  port: 2525,
  secure: false,
  auth: {
    user: process.env.ELASTIC_EMAIL_USERNAME,
    pass: process.env.ELASTIC_SMTP_KEY
  }
});


// Create a new user
router.post('/register', async (req, res) => {
    
  
    try {

        // Check if the user entered exist
        const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });

        if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
        }

        // Create a verification token
        const emailVerificationToken = generateRandomToken();
        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          dob: req.body.dob,
          email: req.body.email,
          emailVerificationToken: emailVerificationToken,
          phoneNumber: req.body.phoneNumber,
          username: req.body.username,
          password: req.body.password,
          file: [],
        });


        // Validate email
        if (!isValidEmail(req.body.email)) {
          return res.status(400).json({ message: 'Invalid email address' });
        }

        //Validate password complexity
        if (!passwordSchema.validate(req.body.password)) {
            return res.status(400).json({ message: 'Password does not meet complexity requirements' });
          }    
        
        //Validate your phoneNumber
        if (req.body.phoneNumber && !isValidPhoneNumber(req.body.phoneNumber)) {
          return res.status(400).json({ message: 'Invalid phone number' });
        }

        // Send verification email
        sendVerificationEmail(req.body.email, emailVerificationToken);

        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });



// Email verification route
router.post('/verify-email', async (req, res) => {
  const { email, token } = req.body;

  try {
    const user = await User.findOne({ email, emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email verification token' });
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Function to generate a random verification token
function generateRandomToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to send a verification email
function sendVerificationEmail(email, token) {
  const verificationLink = `http://localhost:3000/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

  const mailOptions = {
    from: 'encryderdeveloper@gmail.com',  // your Gmail email address
    to: email,
    subject: 'Email Verification',
    html: `<p>Click the following link to verify your email address:</p><a href="${verificationLink}">${verificationLink}</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}


//Login routes

//LogIn
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username })

    // Check if the account is locked
    if (user.isLocked) {
      return res.status(401).json({ message: 'Account locked. Please contact support.' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts and lock the account if necessary
      user.loginAttempts++;
      if (user.loginAttempts >= 3) {
        user.isLocked = true;
        await user.save();
      }

      return res.status(401).json({ message: 'Invalid password' });

    }
    if(!user || !isPasswordValid){
      return res.status(401).send('Invalid credentials');
      }


      // Set user information in the session
      req.session.userId = user._id;
      res.send('Login successful!');
      
  }catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});


//LogOut route
router.get('/logout', (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Logout successful!');
    }
  });
});

  module.exports = router;