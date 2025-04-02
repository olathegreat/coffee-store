import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../model/userModel';


interface DecodedToken {
    id: string;
    iat: number;
}

interface AuthenticatedRequest extends Request {
    user?: UserDocument
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    
    const token= req.cookies.jwt  || " ";
    
   
    try{
        

        if(!token){
            res.status(401).json({
                message: 'You are not logged in'
            })
            return;
        }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    const freshUser = await User.findById(decoded.id).select('_id fullname');
    if(!freshUser){
        res.status(401).json({
            message: 'User does not exist'
        })
        return;
    }
    req.user = freshUser;
    next();


}catch(err){
    res.status(401).json({
        message: 'Invalid token, unauthorised',
        token
    })
}


 

}