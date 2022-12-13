const express = require('express')
const jwt = require('jsonwebtoken')
const autho = express()
const cookieParser = require("cookie-parser")

const Member = require(__dirname+'/../../models/member')
const CoOrdinator = require(__dirname+'/../../models/coordinator')
const Admin = require(__dirname+'/../../models/admin')



autho.use(cookieParser())



const auth = async(req, res, next)=>{
    email=req.query.email
    whomToLogin = req.query.whomToLogin
    if(!email&&!whomToLogin){
        email=req.params.email
        whomToLogin = req.params.whomToLogin
    }
    try{
        if(whomToLogin==="Admin"){
            const user = await Admin.find({email : {$eq: email}})
            const token = req.cookies.jwtoken
            const decoded = jwt.verify(token, 'clubmanagement')
            const decodeduser = await Admin.find({_id:decoded._id})

            if(user[0]._id.equals(decodeduser[0]._id)){
                next()
            }

            else{
                throw new error()
            }
        }
        else if(whomToLogin==="CoOrdinator"){
            // console.log("1")
            const user = await CoOrdinator.find({email : {$eq: email}})
            const token = req.cookies.jwtoken
            const decoded = jwt.verify(token, 'clubmanagement')
            const decodeduser = await CoOrdinator.find({_id:decoded._id})

            if(user[0]._id.equals(decodeduser[0]._id)){
                next()
            }

            else{
                throw new error()
            }
        }
        else if(whomToLogin==="Member"){
            // console.log("2")
            const user = await Member.find({email : {$eq: email}})
            // console.log(user)
            const token = req.cookies.jwtoken
           // req.token=token
            // console.log(token + ' in if state')
            const decoded = jwt.verify(token, 'clubmanagement')  
            const decodeduser = await Member.find({_id:decoded._id})

            console.log("'"+ user[0]._id+ "'")
            console.log("'"+decodeduser[0]._id+ "'")

            if(user[0]._id.equals(decodeduser[0]._id)){
                next()
            }

            else{
                throw new error()
            }   
        }

    } catch(e){
        res.status(401).send({error:'Please authenticate'})
    }
}

module.exports = auth