import { Request, Response } from "express"
import mongoose, { ObjectId } from "mongoose"
import User from "../model/userModel";

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

export const searchContact = async (req:AuthenticatedUserDocs,res:Response):Promise<void> =>{

try{
    console.log(req.query)
    const searchTerm  = req.query.searchTerm as string;

    if(!searchTerm){
        res.status(400).json({message: "search term is needed"})
        return;
    }
    const sanitizedSearchTerm = searchTerm!.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")

    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find({
        $and:[
            {_id: {$ne: req.user!._id}},
            {
                $or: [
                    {fullname: regex},
                    {email: regex},
                ]
            }

        ]
    })

     res.status(200).json({contacts})
     return;

}catch(err){
    console.log(err);
    res.status(500).json("internal server error")
}

}