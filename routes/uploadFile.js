const express = require("express")
const multer = require("multer")
const router = express.Router()
const { User } = require("../Models/Users");
const File = require("../Models/Files");

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb( null, "./Uploads"); // Destination for the Files to be stored
    },
    filename: function(req, file, cb){
        cb( null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/:id/profile-image', upload.single('profileImage'), async(req, res) => {
    const userId = req.params.id;
    try{
        const newFile = new File({
            filename: req.file.filename,
            path: req.file.path
        });
        
        const savedFile = await newFile.save();

        //Associating the file with the user
        const user = await User.findById(userId);
        user.profileImage.push(savedFile._id);
        await user.save();

        res.json(savedFile);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
})


module.exports = router;