const express = require('express')
const CoOrdinator= require('../models/coordinator')
const router = new express.Router()

router.post('/coordinators', async (req, res)=>{
    const coordinator = new CoOrdinator(req.body)

    try{
        await coordinator.save()
        res.status(201).send(coordinator)
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/coordinators/login', async(req, res)=>{
    res.render("C:/Users/'Parikirt Jha'/Club-management/src2/coordinatorLogin.html")
    try{
        const coordinator = await CoOrdinator.findByCredentials(req.body.email, req.body.password)
        res.send(coordinator)
    } catch(e){
        res.status(400).send()
    }
})


router.get('/coordinators', async (req,res)=>{
    try{
        const coordinators = await CoOrdinator.find({})
        res.send(coordinators)
    } catch(e){
        res.status(500).send(e)
    }
})

router.get('/coordinators/:id', async (req,res)=>{
    const _id = req.params.id

    try{
        const coordinator = await CoOrdinator.findById(_id)
        if(!coordinator){
            return res.status(404).send()
        }

        res.send(coordinator)
    } catch(e){
        res.status(500).send(e)
    }
})

router.get('/coordinator', async (req,res)=>{
    res.render("login", {whomToLogin:"Coordinator"});
})

module.exports = router