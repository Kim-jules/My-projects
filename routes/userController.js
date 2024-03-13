// routes/books.js
const express = require('express');
const router = express.Router();
const User = require('../Models/Users');

// Get all books
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    dob: req.body.dob,
    email: req.body.email,
    tel: req.body.tel,
    password: req.body.password
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.dob = req.body.dob || user.dob;
      user.email = req.body.email || user.email;
      user.tel = req.body.tel || user.tel;
      user.password = req.body.password || user.password;
  
      const updatedUser = await user.save();
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Delete a user by ID
  router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Ensure that the `user` variable is an instance of the User model
    if (!(user instanceof User)) {
        return res.status(500).json({ message: 'Invalid user object' });
      }
  
       // Use the deleteOne method to delete the user
    const deletedUser = await User.deleteOne({ _id: userId });

    if (deletedUser.deletedCount === 1) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete user' });
    }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;
