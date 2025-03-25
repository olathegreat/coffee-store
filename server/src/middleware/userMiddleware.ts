import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import  User  from "../model/userModel";
import Company  from "../model/companyModel";

interface AuthRequest extends Request {
  user?: any;
  company?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction):Promise<void> => {
  try {
    let token = req.cookies?.jwt;

   
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"
    }
    
    if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return    
}

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    let authenticatedEntity = await User.findById(decoded.id).select("-password");

    if (authenticatedEntity) {
      req.user = authenticatedEntity;
    } else {
      authenticatedEntity = await Company.findById(decoded.id).select("-password");
      if (authenticatedEntity) {
        req.company = authenticatedEntity;
      }
    }

    if (!req.user && !req.company) {
      res.status(401).json({ message: "Unauthorized: Invalid token or user/company not found" });
    }

    next();
  } catch (error) {
     res.status(401).json({ message: "Unauthorized: Invalid token" });
     return
  }
};
