import mongoose, {Schema, Document, ObjectId} from "mongoose";
import bcrypt from "bcryptjs";

export interface CompanyDocument extends Document{
    _id: ObjectId,
    companyName: string,
    typeOfBusiness: 'Sole Proprietorship' | 'Corporation' | 'Partnership',
    dateOfIncorporation: Date,
    companyEmail: string,
    password?: string,
    otp?: string,
    otpExpires?: Date,
    isVerified: boolean,
    

}
const companySchema = new Schema<CompanyDocument>({

    companyName: {
        type: String,
        required: [true, 'Please enter your company name'],
        trim: true,
        
        minLength: [3, 'company name must be more than 3 characters'],

    },
    typeOfBusiness: {
        type: String,
        enum: ['Sole Proprietorship', 'Corporation', 'Partnership'],
        required: [true, 'Please select a type of business'],
        

    },
    dateOfIncorporation: {
        type: Date,
        required: [true, 'Kindly select your date of incorporation']
    },
    companyEmail:{
        type: String,
        required: [true, 'Please enter your company email'],
        trim: true,
        unique: true,
        lowercase: true,

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

companySchema.pre('save', async function(next){
    if(!this.isModified('password') || !this.password){
        return next();
    }
   
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

const Company = mongoose.model('Company', companySchema);

export default Company;