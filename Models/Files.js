const mongoose = require('mongoose')

const fileSChema = new mongoose.Schema({
    filename: String,
    path: String,
})

module.exports = mongoose.model('File', fileSChema)
