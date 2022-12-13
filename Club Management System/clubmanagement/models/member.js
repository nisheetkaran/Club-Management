const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt= require('jsonwebtoken')

const memberSchema = new mongoose.Schema({
    name : {
        type:String,
        required : true,
        trim:true
    },
    rollNo : {
        type:Number,
        required : true
    },
    email : {
        type:String,
        required : true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password : {
        type:String,
        required : true,
        minlength: 7,
        trim: true
    },
    Year : {
        type:Number,
        required : true
    },
    Course : {
        type:String,
        required : true
    },
    clubs: [{
        club: {
            type: String
        }
    }],
    tokens: [{
        token:{
            type:String,
            required:true
        }
    }]
})

memberSchema.methods.generateAuthToken = async function(){
    const member = this
    const token = jwt.sign({_id: member._id.toString()}, 'clubmanagement')

    member.tokens =  member.tokens.concat({token})
    await member.save()
    return token
}

memberSchema.statics.findByCredentials = async (email, password)=>{
    const member = await Member.findOne({email})

    if(!member){
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, member.password)

    if(!isMatch){
        throw new Error('Unable to login!')
    }

    return member
}

memberSchema.statics.findByEmail = async (email)=>{
    const member = await Member.findOne({email})

    if(!member){
        throw new Error('Unable to find!')
    }

    return member
}



memberSchema.pre('save', async function(next){
    const member =this

    if(member.isModified('password')){
        member.password= await bcrypt.hash(member.password, 8) 
    }

    next()
})

const Member = mongoose.model('members',memberSchema)

module.exports = Member



