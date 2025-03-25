import mongoose, { Schema, Document, ObjectId } from "mongoose"


export interface MessageDocument extends Document{
    _id: ObjectId;
    sender: ObjectId;
    recipient: ObjectId;
    messageType: string;
    content?: string;
    fileUrl?: string;
    timeStamp: Date;
}


const messageSchema = new Schema <MessageDocument>({
    sender: {
        type: mongoose.Schema.ObjectId,
        required: true,
        refPath: 'User'
    },
    recipient:{
        type: mongoose.Schema.ObjectId,
        required: true,
        refPath: 'User'
    },
    messageType:{
        type: String,
        required: true,
        enum: ['text', 'image', 'file']

    },
    content: {
        type: String,
        trim: true,
        required: function(){
            return this.messageType === 'text';
        }
    },
    fileUrl: {
        type: String,
        trim: true,
        required: function(){
            return this.messageType === 'file';
        }
    },
    timeStamp: {
        type: Date,
        default: Date.now()
    }

})

const Message = mongoose.model("Messages", messageSchema);

export default Message;