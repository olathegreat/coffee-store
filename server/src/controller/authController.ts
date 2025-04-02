import {Request, Response} from 'express';
import User from '../model/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import dotenv from "dotenv"
import { ObjectId } from 'mongoose';
import cloudinary from 'cloudinary';


dotenv.config();



type UserDocs = {
    _id: ObjectId | undefined,
    fullname: string,
    email: string,
    password: string,
    picture?: string,
    about?:string,
    profileSetupCompleted?: boolean,
    userType?: 'user' | 'moderator' | 'admin'
}

interface AuthenticatedUserDocs extends Request{
    user?: UserDocs | undefined;
}

const signToken = (id: ObjectId) =>{
    return jwt.sign({ id: id.toString()}, process.env.JWT_SECRET as string ,{
        expiresIn: Number(process.env.JWT_EXPIRES) || 86400
    })
}

const createSendToken = (user:UserDocs, statusCode:number, res:Response) =>{

    const token = signToken(user._id as ObjectId);
    const cookieExpires = Number(process.env.JWT_COOKIE_EXPIRES || 1) * 24 * 60 * 60 * 1000;
    const cookieOptions = {
        expires: new Date(Date.now() + cookieExpires),
        httpOnly: true,
        secure: true,
      sameSite: "none" as "none",
    
    }

    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

const uploadImage = async (file: Express.Multer.File) => {

    const image = file;
    const base64Image = Buffer.from(image.buffer).toString('base64');
    const imageUrl = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(imageUrl, {
        quality: "auto",
        fetch_format: "auto",
        timeout: 180000
    });

    return uploadResponse.url

}

export const registerUser = async(req:Request, res:Response):Promise<void> =>{
    const {fullname, email, password, image} = req.body;

    try{
        const existingUser = await User.findOne({email});

        if(existingUser){
            res.status(400).json({
                message: 'User already exists'
            })
            return;
        }

        const newUser = await User.create({
            fullname,
            email,
            password,
            image,
            googleSignIn: false,
        })

        createSendToken(newUser as unknown as UserDocs , 201, res);



    }catch(err){
        console.log(err);
        res.status(500).json({
            message: 'server error during sign up'
        })
    }

}

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
    const { fullname, email, picture } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                fullname,
                email,
                picture,
                googleSignIn: true, 
                password: undefined
            });
        }

        createSendToken(user as unknown as UserDocs, 200, res);
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: 'Google Sign-in Failed' });
    }
}; 


export const loginUser = async(req:Request, res:Response):Promise<void> =>{

    const {email, password} = req.body;

    try{
        if(!email || !password){
            res.status(400).json({
                message: 'Please provide email and password'
            })
            return;
        }

        const user = await User.findOne({email}).select('+password');
        if(!user){
            res.status(404).json({
                message: 'User does not exist'
            })
            return;
        }
         let isPasswordCorrect;
        if(user.password){
         isPasswordCorrect = await bcrypt.compare(password, user.password);
        }
        if(!isPasswordCorrect){
            res.status(400).json({
                message: 'Incorrect password'
            })
            return;
        }

        createSendToken(user as unknown as UserDocs, 200, res);

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: 'server error  during signin'
        })
        return;

    }

}

export const updateUser = async(req:AuthenticatedUserDocs, res:Response): Promise<void> => {
    const {fullname,about, email, password, image} = req.body;

    try{
        const existingUser = await User.findById(req.user!._id);
        if(!existingUser) {
            res.status(404).json({message: "user not found"});
            return;
        }

        existingUser.fullname = fullname;
        existingUser.password = password;
    

        if(req.file){
            const imageUrl = await uploadImage(req.file as Express.Multer.File);
            existingUser.picture = imageUrl;
        }

        await existingUser.save();

        res.status(200).json(existingUser)

    }catch(err){
        console.log(err);
        res.status(500).json({
            message: 'server error during update, try again later'
        	})

    }


}

export const getUser = async( req:AuthenticatedUserDocs, res:Response):Promise<void> => {
  const userId = req!.user!._id

  try{

  

  const user = await User.findById(userId).select("_id fullname email picture");

  if(!user){
    res.status(404).json({
        message: 'User not found'
    })
    return;
  }

  res.status(200).json(user)

}catch(err){
    console.log(err);
    res.status(500).json({
        message: 'server error during get user'
    })
    
}
}

export const logoutUser = async(req:AuthenticatedUserDocs, res: Response):Promise<void> =>{
        
    res.clearCookie("token",{
        httpOnly: true,
        secure: true,
      sameSite: "none" as "none",
    })

    res.status(200).json({message: "logout successful"})
}