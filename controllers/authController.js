const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler")

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => { 
  return jwt.sign({ userId }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body)
     
    if(!EMAIL_REGEX.test(email)){
      res.status(400);
      throw new Error("Please provide a valid email address");
    }
    

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

     
        
    const capitalizedName = name.charAt(0).toUpperCase()+(name.slice(1))
    const newUser = new User({ name:capitalizedName, email, password});
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login =asyncHandler(
  async (req, res) => { 
      const { email, password } = req.body;
      console.log(email, password)
      // Validate input fields
      if (!email || !password) {
        const error = new Error('Email and password are required');
        res.status(400)
        throw error;
      }
      
      const user = await User.findOne({ email }); 
       if (!user) { 
        res.status(400)
        throw new Error('No account found for this email')
      };
       
       const isMatch = await bcrypt.compare(password, user.password);
       console.log('Password Match:', isMatch);
       if (!isMatch) {  
        res.status(400)
        throw new Error('Invalid credentials')
      }; 
       
       const accessToken = generateAccessToken(user._id);
       const refreshToken = generateRefreshToken(user._id);
       
       res.cookie('refreshToken', refreshToken, {
         httpOnly: true,
         secure: true,
         sameSite: 'strict',  
        });
        
        res.status(200).json({
          accessToken,
          user: { id: user._id, name: user.name, email: user.email },
        });
  
    }
  ) 

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });

      const newAccessToken = generateAccessToken(user.userId);
      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
