import { Request, Response } from "express";
import { UserDocument } from "../model/userModel";
import Message from "../model/messageModel";
import cloudinary from "cloudinary"
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
    user?: UserDocument | undefined;
}

export const getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user1 = req.user!._id;
        const user2 = req.params.id;

        if (!user1 || !user2) {
            res.status(400).send("Both user IDs are required");
            return;
        }

        const messages = await Message.find({  // ✅ Await the query
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        }).sort({ timeStamp: 1 });

        res.status(200).json({ messages }); // ✅ 200 OK instead of 400
        return;
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
        return;
    }
};



const uploadImage = async (file: Express.Multer.File) => {
    const image = file
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI, {
        quality: "auto",
        fetch_format: "auto",
        timeout:180000
    });
    

    return uploadResponse.url;


}

export const uploadFiles = async (req: Request, res: Response): Promise<void> => {
    try {

        if (!req.file) {
             res.status(400).send("file is required");
             return
            
        }


        const imageUrl = await uploadImage(req.file as Express.Multer.File);
        res.status(200).json({ filePath: imageUrl });
        return;
    } catch (err) {
        console.log({ err });
        res.status(500).send("internal server error");
        return;
    }
};



export const getUserMessagesList = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {

        
        const userId = typeof req.user!._id === "string" 
        ? new mongoose.Types.ObjectId(req.user!._id) 
        : req.user!._id;

        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { recipient: userId }
                    ]
                }
            },
            {
                $sort: { timeStamp: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$recipient",
                            else: "$sender"
                        }
                    },
                    lastMessageTime: { $first: "$timeStamp" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfo"
                }
            },
            {
                $unwind: "$contactInfo"
            },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    email: "$contactInfo.email",
                    fullname: "$contactInfo.fullname",
                    about: "$contactInfo.about",
                    picture: "$contactInfo.picture",
                    
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);

        res.status(200).json({ contacts });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
};
