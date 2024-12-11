const Blog = require('../models/blogModel')
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler") 


exports.createBlog = asyncHandler(async (req,res)=>{
    const {title,image,content} = req.body;
    console.log(req.body)
    const author = req.user.userId; 
 
    if (!title || !image || !content) {
        res.status(400);
        throw new Error("All fields are required.");
    }
    const blog = await Blog.create({ title, image, content, author });
    if (blog) {
        res.status(201).json(blog);
    } else {
        res.status(500);
        throw new Error("Failed to create the blog.");
    }


})

exports.getAllBlogs = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = 10;
    const search = req.query.search || ''; // Get search query from request
    const searchRegex = search.split(/\s+/).join('.*'); // Create space-insensitive regex

    // Build query with search functionality
    const query = {
        title: { $regex: searchRegex, $options: 'i' } // Case-insensitive title search
    };

    const count = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(pageSize * (page - 1))
        .limit(pageSize);

    res.json({blogs,page,
        pages: Math.ceil(count / pageSize),
        totalBlogs: count,
        search: search
    });
});

exports.getBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;  
    const blog = await Blog.findById(id).populate('author', 'name email');
    if (!blog) { 
      res.status(404);
      throw new Error('Blog not found');
    }
    res.json(blog);
  });

exports.editBlog = asyncHandler(async (req,res)=>{
    const { id } = req.params;
    const { title, image, content } = req.body;
    const blog = await Blog.findById(id);
   
    if (!blog) {
        res.status(404);
        throw new Error("Blog not found.");
    }
     console.log("req.user.UserId,blog.author.toString()",req.user.userId,blog.author.toString())
    if (blog.author.toString() !== req.user.userId) {
        res.status(401);
        throw new Error("You are not authorized to edit this blog.");
    }
    blog.title = title || blog.title;
    blog.image = image || blog.image;
    blog.content = content || blog.content;

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
})
 
exports.deleteBlog = asyncHandler(async (req,res)=>{
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
        res.status(404);
        throw new Error("Blog not found.");
    }

    if (blog.author.toString() !== req.user.userId) {
        res.status(401);
        throw new Error("You are not authorized to delete this blog.");
    }

    await Blog.deleteOne({ _id: id });
    res.json({ message: "Blog removed" });
})

exports.getMyBlogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const userId = req.user.userId;

     
    const searchRegex = search.split(/\s+/).join('.*'); 

    const query = {
        author: userId,
        title: { $regex: searchRegex, $options: 'i' } 
    };

    const blogs = await Blog.find(query)
        .sort({ createdAt: -1 })  
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalBlogs = await Blog.countDocuments(query);

    res.json({
        blogs,
        totalPages: Math.ceil(totalBlogs / limit),
        currentPage: Number(page),
        totalBlogs
    });
});

