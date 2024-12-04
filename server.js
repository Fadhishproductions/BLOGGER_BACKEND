const express = require("express");
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/dB")
const cors = require("cors")
const {notFound , errorHandler} = require("./middlewares/errorMiddleware")
const app = express()
const authRoutes = require("./routes/authRoutes")
const blogRoutes = require("./routes/blogRoutes")
dotenv.config()
connectDB()

app.use(cors({
    origin:process.env.FRONTEND_URI, 
    credentials:true
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api/users',authRoutes)
app.use('/api/blogs',blogRoutes)

app.get('/',(req,res)=>{res.send('<h1>Server connected</h1>')})


app.use(notFound);
app.use(errorHandler)


const PORT = process.env.PORT || 5000
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))
