const mongoose = require('mongoose')
const Schema = mongoose.Schema

let postSchema = new Schema({
    name:{
        type:String
    },
    description:{
      type:String
    },
},{
    collation:'posts'
})

module.exports = mongoose.model('Post',postSchema)
