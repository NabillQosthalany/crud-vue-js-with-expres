const express = require('express')
const postRoute = express.Router()

let postModel = require('../Models/Post')

postRoute.route('/').get((req,res,next) =>{
    postModel.find().collation({ locale: "en_US", strength: 1 })
        .then(data =>{
            res.json(data)
        })
        .catch(error =>{
            return next(error)
        })
});

postRoute.route('/create').post((req,res,next)=>{
    postModel.create(req.body)
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            return next(err)
        })
})


postRoute.route('/update/:id').put(async (req, res, next) => {
    try {
        const updatedPost = await postModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPost);
        console.log('post updated');
    } catch (err) {
        next(err);
    }
});

postRoute.delete('/delete/:id', async (req, res) => {
    try {
        const postId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ msg: 'Invalid post ID' });
        }

        const deletedPost = await postModel.findByIdAndDelete(postId);

        if (!deletedPost) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json({ msg: 'Post deleted', post: deletedPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});



module.exports = postRoute
