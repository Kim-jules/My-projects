const mongoose = require('mongoose');
const Friendship = require('../Models/Friendship');
const express = require('express');
const router = express.Router();
const { User } = require('../Models/Users');


// Add a new friend
router.post('/add-friend', async (req, res) => {
  try {
    const { userId, friendsId } = req.body;

    // Check if users exist
    const user = await User.findById(userId);
    const friends = await User.findById(friendsId);

    if (!user || !friends) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if they are already friends
    const existingFriendship = await Friendship.findOne({
      $or: [
        { user: userId, friends: blockedFriendId, status: 'accepted' },
        { user: blockedFriendId, friends: userId, status: 'accepted' },
      ],
    });

    if (existingFriendship) {
      // If already friends and status is 'pending', update the status to 'mutual'
      if (existingFriendship.status === 'pending') {
        existingFriendship.status = 'mutual';
        await existingFriendship.save();
      }
      return res.status(400).json({ message: 'Users are already friends' });
    }

    // Update the friendship by pushing the new friend's ID to the array
    const updatedFriendship = await Friendship.findOneAndUpdate(
      { user: userId },
      { $push: { friends: friendsId } },
      { new: true, upsert: true }
    );

    

    res.status(201).json({ message: 'Friend added successfully', friendship: updatedFriendship });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Block a friend
router.post('/block-friend', async (req, res) => {
  try {
    const { userId, blockedFriendId } = req.body;

    // Check if users and friendship exist
    const user = await User.findById(userId);
    const blockedFriend = await User.findById(blockedFriendId);
    const friendship = await Friendship.findOne({
      $or: [
        { user: userId, friends: blockedFriendId, status: 'accepted' },
        { user: blockedFriendId, friends: userId, status: 'accepted' },
      ],
    });

    if (!user || !blockedFriend || !friendship) {
      return res.status(404).json({ message: 'User, friend, or friendship not found' });
    }

    // Update the friendship status to 'blocked'
    friendship.status = 'blocked';
    await friendship.save();

    res.status(200).json({ message: 'Friend blocked successfully', friendship });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  
  // Get user's friends
  router.get('/get-friends/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Find all accepted friendships for the user
      const friendships = await Friendship.find({
        $or: [
          { user: userId, status: 'accepted' },
          { friends: userId, status: 'accepted' },
        ],
      }).populate('user friends');
  
      res.status(200).json({ friendships });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  module.exports = router;