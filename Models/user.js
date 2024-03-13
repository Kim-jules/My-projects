const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    profileImage: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File'
        }
    ],
    password: {
        type: String,
        required: true
    },
    created_At: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("User", UserSchema)