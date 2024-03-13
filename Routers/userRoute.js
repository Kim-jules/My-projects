const express = require("express");
const router = express.Router();
const User = require("../Models/user");


// Getting the user from the DB
router.get("/all-the-users", async(req, res) => {
    try{
        const users = await User.find();
        res.status(201).json(users);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
});

//Posting new user
router.post("/register", async(req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        file: [],
        password: req.body.password
    }); 

    try{
        const newUser = await user.save();
        res.status(201).json(newUser);
    }
    catch(error){
        res.status(400).json({ message: error.message });
    }
});

// Updating the users
router.put('/update-user/:id', async(req, res) => {
    const userId = req.params.id;

    try{
        const findUser = await User.findById(userId);
        
        if(!findUser){
            return res.status(404).json({ message: "User not Found" });
        }

        findUser.username = req.body.username || findUser.username,
        findUser.email = req.body.email || findUser. email,
        findUser.password = req.body.password || findUser.password

        const updatedUser = await findUser.save();
        res.status(201).json(updatedUser);
    }
    catch(error){
        res.status(400).json({ message: error.message });
    }
});


// Deleting router
router.delete("/delete-user/:id", async(req, res) => {
    const userId = req.params.id;

    try{
        const findUser = await User.findById(userId);

        if(!findUser){
            res.status(404).json({ message: "User was not found"});
        }

        if(!(findUser instanceof User)){
            res.status(500).json({ message: "Invalid user object" });
        }

        const deletedUser = await User.deleteOne({ _id: userId})
        if(deletedUser.deletedCount === 1){
            res.json({ message: "The user was deleted successfuly" });
        }else{
            res.status(500).json({ message: "Failed to delete the user"})
        }
    }catch(error){
        res.status(500).json({ message: error.message })
    }
});

module.exports = router