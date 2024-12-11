const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware');
const { createBlog, editBlog, deleteBlog, getMyBlogs, getBlogById, getAllBlogs } = require('../controllers/blogController');


router.get('/my-blogs',protect,getMyBlogs)
router.post('/create',protect,createBlog);
router.get('/',getAllBlogs);
router.get('/:id', getBlogById);
router.route('/:id').put(protect,editBlog).delete(protect,deleteBlog)
// router.put('/:id',protect,editBlog);
// router.delete('/:id',protect,deleteBlog)

module.exports = router