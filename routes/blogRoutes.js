const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware');
const { createBlog, editBlog, deleteBlog, getMyBlogs, getBlogById, getAllBlogs } = require('../controllers/blogController');


router.get('/my-blogs',protect,getMyBlogs)
router.post('/create',protect,createBlog);
router.get('/',getAllBlogs);
router.get('/:id', getBlogById);
router.put('/:id',protect,editBlog);
router.delete('/delete/:id',protect,deleteBlog)

module.exports = router