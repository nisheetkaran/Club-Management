const mongoose = require('mongoose')
const validator = require('validator')

mongoose.connect('mongodb://127.0.0.1:27017/club-management-api',{
    useNewUrlParser : true,
    useCreateIndex : true
})

// mongoose.connect('mongodb+srv://admin-kartik:adminclub@cluster0.5w6cn.mongodb.net/club-manage-api?retryWrites=true&w=majority',{
//     useNewUrlParser : true,
//     useCreateIndex : true
// })






