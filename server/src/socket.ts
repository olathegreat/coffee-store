import {Server as SocketIoServer} from "socket.io"
import Message,{MessageDocument} from "./model/messageModel"


const setUpSocket = (server: any) =>{
    const allowedOrigins = [process.env.ALLOWED_ORIGIN1, process.env.ALLOWED_ORIGIN2].filter((origin): origin is string => Boolean(origin))

    const io = new SocketIoServer(server, {
        cors: {
            origin: allowedOrigins,
            methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
            credentials: true,
        }
    })


    const userSocketMap = new Map<string, string>();

    const disconnect = (socket: any) =>{
        for (const[userId, socketId] of userSocketMap.entries()){
            if(socketId === socket.id){
                userSocketMap.delete(userId)
                break;
            }
        }
    }

    const sendMessage = async (message: MessageDocument) => {
        try{
            console.log("saving message to the database:", message);
            const savedMessage = await Message.create(message)
            console.log("message saved successfully:", savedMessage);

            let messageData;

            messageData = await Message.findById(savedMessage._id).populate("sender", "fullname email picture about").populate("recipient", "fullname email picture about")


            const recipientSocketId = userSocketMap.get(message.recipient.toString());
            const senderSocketId = userSocketMap.get(message.recipient.toString());

            if(recipientSocketId){
                io.to(recipientSocketId).emit("receive-message", messageData);
            }
            if(senderSocketId){
                io.to(senderSocketId).emit("sent-message", messageData)
            }



        }catch(err){
            console.error("errorr saving message to database", err)

        }
    }
    
    io.on("connection", (socket)=>{
        console.log("a client connected");
        console.log(socket.handshake.query)

        const userId = Array.isArray(socket.handshake.query.userId)
            ? socket.handshake.query.userId[0]
            : socket.handshake.query.userId;

            if(userId){
                userSocketMap.set(userId, socket.id);
                console.log("User connected", userId, "with socket Id", socket.id);
            }else{
                 console.log("user id not found in the query parameter")
            }

            socket.on("send-message", async (message) => {
                console.log("Received send-message event:", message); 
                await sendMessage(message);
            });
    
            socket.on("disconnect", () => {
                console.log("Client disconnected");
                disconnect(socket);
            });
    })

}

export default setUpSocket