import { Request, Response } from 'express';
import Company from '../model/companyModel';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { ObjectId } from 'mongoose';
import { Resend } from 'resend';
import User from '../model/userModel';
import bcrypt from "bcryptjs"
dotenv.config();


interface AuthRequest extends Request {
    user?: any;
    company?: any;
  }

const resend = new Resend(process.env.RESEND_API_KEY);


const signToken = (id: ObjectId) => {
    return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET as string, {
        expiresIn: Number(process.env.JWT_EXPIRES) || 86400
    })
}

// const createSendToken = (user: UserType, statusCode: number, res: Response): void => {
//     const token = signToken(user._id as ObjectId);
//     const cookieExpires = Number(process.env.JWT_COOKIE_EXPIRES || 1) * 24 * 60 * 60 * 1000;
//     const cookieOptions = {
//         expires: new Date(Date.now() + cookieExpires),
//         httpOnly: true

//     };
//     // user.password = undefined;

//     res.cookie("jwt", token, cookieOptions);

//     res.status(statusCode).json({
//         status: "success",
//         token,
//         data: {
//             user,
//         }
//     })


// }


export const registerCompany = async (req: Request, res: Response): Promise<void> => {
    const { companyName, typeOfBusiness, dateOfIncorporation, companyEmail, password } = req.body;

    try {
        const existingCompany = await Company.findOne({ companyEmail });
        if (existingCompany) {
            res.status(400).json({ message: 'Company already registered with this email' });
            return;
        }

        const existingUser = await User.findOne({ email: companyEmail });
        if (existingUser) {
            res.status(400).json({ message: 'email  already registered' });
            return;
        }

        // Generate OTP and expiry time
        const otp = crypto.randomInt(1000, 9999).toString();
        const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

        const newCompany = await Company.create({
            companyName,
            typeOfBusiness,
            dateOfIncorporation,
            companyEmail,
            password,
            otp,
            otpExpires,
            isVerified: false
        });

       

        const token = signToken(newCompany._id);

        const cookieExpires = Number(process.env.JWT_COOKIE_EXPIRES || 1) * 24 * 60 * 60 * 1000;
        const cookieOptions = {
            expires: new Date(Date.now() + cookieExpires),
            httpOnly: true
    
        };
    
    
        res.cookie("jwt", token, cookieOptions);
    

        res.status(201).json({
            status: 'success',
            token,
            message: 'Company registered successfully. Verify your email with the OTP sent.',
            data: {
                company: {
                    _id: newCompany._id,
                    companyName: newCompany.companyName,
                    companyEmail: newCompany.companyEmail,
                    isVerified: newCompany.isVerified,
                    otp
                }
            }
        });
         // Send OTP email via Resend
         await resend.emails.send({
            from: `Your Company <${process.env.FROM_EMAIL}>`,
            to: companyEmail,
            subject: 'Verify Your Email - OTP Code',
            html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code expires in 30 minutes.</p>`,
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during company registration',error });
    }
};



export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { firstName,lastName, email,phoneNumber, password } = req.body;

    try {
        const existingCompany = await Company.findOne({companyEmail: email });
        if (existingCompany) {
            res.status(400).json({ message: 'email  already registered' });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'user  already registered' });
            return;
        }

        // Generate OTP and expiry time
        const otp = crypto.randomInt(1000, 9999).toString();
        const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

        const newUser = await User.create({
            lastName,
            firstName,
            email,
            phoneNumber,
            password,
            otp,
            otpExpires,
            isVerified: false
        });

       

        const token = signToken(newUser._id);

        const cookieExpires = Number(process.env.JWT_COOKIE_EXPIRES || 1) * 24 * 60 * 60 * 1000;
        const cookieOptions = {
            expires: new Date(Date.now() + cookieExpires),
            httpOnly: true,
            secure:true
    
        };
    
    
        res.cookie("jwt", token, cookieOptions);

        res.status(201).json({
            status: 'success',
            token,
            message: 'user registered successfully. Verify your email with the OTP sent.',
            data: {
                user: {
                    _id: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    isVerified: newUser.isVerified,
                    otp
                }
            }
        });
         // Send OTP email via Resend
         await resend.emails.send({
            from: `Your Company <${process.env.FROM_EMAIL}>`,
            to: email,
            subject: 'Verify Your Email - OTP Code',
            html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code expires in 30 minutes.</p>`,
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during company registration', error });
    }
};



export const verifyCompanyOtp = async (req: Request, res: Response):Promise<void> => {
  const { companyEmail, otp } = req.body;

  try {
    const company = await Company.findOne({ companyEmail });

    if (!company) {
       res.status(404).json({ message: 'Company not found' });
       return
    }

    if (company.isVerified) {
      res.status(400).json({ message: 'Email is already verified' });
      return
    }

    if (company.otp !== otp) {
       res.status(400).json({ message: 'Invalid OTP' });
       return
    }

    if (company.otpExpires && new Date(company.otpExpires) < new Date()) {
    res.status(400).json({ message: 'OTP has expired. Request a new one.' });
    return
    }

    // Mark company as verified
    company.isVerified = true;
    company.otp = undefined;
    company.otpExpires = undefined;
    await company.save();

    res.status(200).json({ status: 'success', message: 'Email verified successfully' });
    return

  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Server error during OTP verification',error });
  }
};



export const verifyUserOtp = async (req: Request, res: Response):Promise<void> => {
    const { email, otp } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
         res.status(404).json({ message: 'user not found' });
         return
      }
  
      if (user.isVerified) {
        res.status(400).json({ message: 'user is already verified' });
        return
      }
  
      if (user.otp !== otp) {
         res.status(400).json({ message: 'Invalid OTP' });
         return
      }
  
      if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
      res.status(400).json({ message: 'OTP has expired. Request a new one.' });
      return
      }
  
      // Mark company as verified
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
  
      res.status(200).json({ status: 'success', message: 'Email verified successfully' });
      return
  
    } catch (error) {
      console.error('OTP Verification Error:', error);
      res.status(500).json({ message: 'Server error during OTP verification',error });
    }
  };
  



export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        // Check if the user exists in the Company collection
        let user = await Company.findOne({ companyEmail: email }).select('+password');
        let role: 'company' | 'user' | null = user ? 'company' : null;

        // If not found, check the User collection
        if (!user) {
            user = await User.findOne({ email }).select('+password');
            role = user ? 'user' : null;
        }

        // If no user or company found, return an error
        if (!user || !role) {
            res.status(404).json({ message: 'Invalid email or password' });
            return;
        }

        // Verify the password (assuming passwords are hashed using bcrypt)
        if(user.password){

       
        const isPasswordValid = await bcrypt.compare(password, user!.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }

    }

       
        // Generate JWT token
        const token = signToken(user._id);

        const cookieExpires = Number(process.env.JWT_COOKIE_EXPIRES || 1) * 24 * 60 * 60 * 1000;
        const cookieOptions = {
            expires: new Date(Date.now() + cookieExpires),
            httpOnly: true,
            secure: true,
            
    
        };
    
    
        res.cookie("jwt", token, cookieOptions);

        

        

        res.status(200).json({
            status: 'success',
            token,
            message: 'Login successful',
            data: {
                user: {
                    _id: user._id,
                    
                    
                }
            }
        });

        

        

            // res.status(200).json({
            //     status: 'success',
            //     token,
            //     message: 'Login successful',
            //     data: {
            //         user: {
            //             _id: user._id,
            //             email: user.companyEmail,
                        
            //         }
            //     }
            // });
        
    

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' ,error});
    }
};




export const resendOtp = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
        // Check if the email belongs to a company or user
        let user = await Company.findOne({ companyEmail: email });
        let role: 'company' | 'user' | null = user ? 'company' : null;

        if (!user) {
            user = await User.findOne({ email });
            role = user ? 'user' : null;
        }

        if (!user || !role) {
            res.status(404).json({ message: 'Email not found' });
            return;
        }

        
        // Generate a new OTP
        const otp = crypto.randomInt(1000, 9999).toString();
        const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

        // Update user with new OTP and expiry
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        res.status(200).json({ status: 'success', message: 'New OTP sent  ' + otp });

        // Send OTP email via Resend
        await resend.emails.send({
            from: `Your Company <${process.env.FROM_EMAIL}>`,
            to: email,
            subject: 'Resend OTP - Verify Your Email',
            html: `<p>Your new OTP code is: <strong>${otp}</strong></p><p>This code expires in 30 minutes.</p>`
        });

        
    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ message: 'Server error while resending OTP' });
    }
};


export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    try {
        // Find the user or company by email
        let user = await Company.findOne({ companyEmail: email });
        if (!user) {
            user = await User.findOne({ email });
        }

        if (!user) {
            res.status(404).json({ message: 'User or company not found' });
            return;
        }

       
        if (user.otp !== otp) {
            res.status(400).json({ message: 'Invalid OTP' });
            return;
        }

        if (user.otpExpires && new Date(user.otpExpires) < new Date()) {
            res.status(400).json({ message: 'OTP has expired. Request a new one.' });
            return;
        }

        // Mark as verified and remove OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ status: 'success', message: 'Email verified successfully' });
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Server error during OTP verification',error });
    }
};


export const getAuthenticatedUserOrCompany = (req: AuthRequest, res: Response):any => {
    try {
      if (req.user) {
        return res.status(200).json({ data: req.user });
      } else if (req.company) {
        return res.status(200).json({ data: req.company });
      } else {
        return res.status(404).json({ message: "No authenticated user or company found" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  };


  export const logout = (req: Request, res: Response): void => {
    try {
        res.cookie("jwt", "", {
            expires: new Date(0),
            httpOnly: true
        });

        res.status(200).json({
            status: "success",
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Server error during logout",error });
    }
};