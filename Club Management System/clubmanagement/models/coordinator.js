const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt= require('jsonwebtoken')

const coordinatorSchema = new mongoose.Schema({
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
    // leader_of_club: {
    //     type:String
    // },
    leader_clubs: [{
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

coordinatorSchema.methods.generateAuthToken = async function(){
    const coordinator = this
    const token = jwt.sign({_id: coordinator._id.toString()}, 'clubmanagement')

    coordinator.tokens =  coordinator.tokens.concat({token})
    await coordinator.save()
    return token
}

coordinatorSchema.statics.findByCredentials = async (email, password)=>{
    const coordinator = await CoOrdinator.findOne({email})

    if(!coordinator){
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, coordinator.password)

    if(!isMatch){
        throw new Error('Unable to login!')
    }

    return coordinator
}

coordinatorSchema.pre('save', async function(next){
    const coordinator = this

    if(coordinator.isModified('password')){
        coordinator.password= await bcrypt.hash(coordinator.password, 8) 
    }

    next()
})

const CoOrdinator = mongoose.model('coordinators', coordinatorSchema)

module.exports = CoOrdinator