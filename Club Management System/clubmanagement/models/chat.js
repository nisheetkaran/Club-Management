const mongoose = require('mongoose')
const validator = require('validator')

const chatSchema = new mongoose.Schema({
    name : {
        type:String,
        required : true,
        trim:true
    },
    msg:{
        type:String,
        required:true
    }
}) 

const Chat = mongoose.model('chat', chatSchema)
module.exports = Chat