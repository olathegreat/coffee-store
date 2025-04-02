import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import mongoose from 'mongoose'
import {v2 as cloudinary} from "cloudinary"
import UserRoutes from './routes/userRoutes' 
import ContactRoutes from "./routes/contactRoutes"
import messagesRoutes from './routes/messageRoutes'   
import setUpSocket from './socket'



dotenv.config();


mongoose.connect(process.env.DATABASE_URL as string).then(() => {
    console.log('Connected to database')
}).catch((err) => {
    console.log(err)
})
 
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to database')
})

mongoose.connection.on('error', (err) => {
    console.log(err)
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})





const app = express();
const allowedOrigins = [process.env.ALLOWED_ORIGIN1, process.env.ALLOWED_ORIGIN2].filter((origin): origin is string => Boolean(origin))


app.use(cors({
    origin: allowedOrigins,
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    credentials: true,

}))

app.use(express.json());
app.use(cookieParser());


app.get('/health', async(req:Request, res:Response)=>{
    res.send({
        message: "health is okay"
    })
});

app.use('/api/v1/auth', UserRoutes);
app.use('/api/v1/contact', ContactRoutes)
app.use('/api/v1/messages', messagesRoutes)


const server = app.listen(process.env.PORT, ()=>{
    console.log(`server is running on port ${process.env.pORT}`)
})
setUpSocket(server)