const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt= require('jsonwebtoken')

const clubSchema = new mongoose.Schema({
    name : {
        type:String,
        required : true,
        unique: true
    },
    members: [{
        name: {
            type: String
        },
        rollNo:{
            type: Number
        },
        email:{
            type:String
        }
    }],
    coordinators: [{
        name: {
            type: String
        },
        rollNo:{
            type: Number
        },
        email:{
            type:String
        }
    }],
    posts:[{
        heading:{
            type:String,
        },
        body:{
            type:String,
        },
        post:{
            type:Buffer,
        },
        fileId:{
            type:String
        },
        created:{
            type:Date
        }
        // timestamps:true
    }],
    chat:[{
        nameofuser:{
            type:String
        },
        messages:{
            type:String
        }
    }]
})

// clubSchema.methods.DeletememberfromClub = async function(name, email){
//     club = await Club.findOneAndUpdate(
//              { name },
//              { '$pull': { 'members' : { email} } },
//              { new : true }
//            )

//     return club
// }

const Club = mongoose.model('clubs',clubSchema)

module.exports = Club