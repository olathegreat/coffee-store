import mongoose, {Schema, Document, ObjectId} from "mongoose";
import bcrypt from "bcryptjs";

export interface UserDocument extends Document{
    _id: ObjectId,
    firstName: string,
    lastName: string,
    email: string,
    password?: string,
    phoneNumber: string,
    otp?: string,
    otpExpires?: Date,
    isVerified: boolean,
    

}
const userSchema = new Schema<UserDocument>({

    firstName: {
        type: String,
        required: [true, 'Please enter your first name'],
        trim: true,
        
        minLength: [3, 'first name must be more than 3 characters'],

    },
    lastName: {
        type: String,
        required: [true, 'Please enter your last name'],
        trim: true,
        
        minLength: [3, 'last name must be more than 3 characters'],

    },
   
    email:{
        type: String,
        required: [true, 'Please enter your  email'],
        trim: true,
        unique: true,
        lowercase: true,

    },
    phoneNumber:{
        type: String,
        required: [true, 'Please enter your  phonenumber'],
        trim: true,
        unique: true,
        

    },
    
    password:{
        type: String,
        required: [true, 'Please enter your password'],
        trim: true,
        minLength: [6, 'Password must be more than 6 characters'],
        select: false,
    },
   
    otp:{
        type: String,
    
    },
    otpExpires:{
        type: Date,
        
    },
    isVerified:{
        type: Boolean,
        default: false
    }



})

userSchema.pre('save', async function(next){
    if(!this.isModified('password') || !this.password){
        return next();
    }
   
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

const User = mongoose.model('User', userSchema);

export default User;