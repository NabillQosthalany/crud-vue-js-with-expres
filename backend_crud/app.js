const express = require('express')
const bodyParser = require("body-parser");
cors = require('cors')
mongoose = require('mongoose')
database = require('./config/database')

mongoose.Promise = global.Promise
mongoose.connect(database.db,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("database connected")
},err =>{
    console.log('Database cannot connected' + err)
})

const postApi = require('../backend_crud/Routes/post.routes')
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:false
}))
app.use(cors())

app.use('/api',postApi)

const port = process.env.PORT || 3000
const server = app.listen(port,() =>{
    console.log('Connected to port' + port)
})

app.use(function (err,req,res,next){
    console.error(err.message)
    if(!err.statusCode)err.statusCode = 500
    res.status(err.statusCode).send(err.message)
})


