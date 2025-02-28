// Import the WebSocketServer class from the "ws" package
import { WebSocketServer } from "ws";
import jwt from 'jsonwebtoken'
import {JWT_SECRET_KEY} from '@repo/backend-common/config'
import {PsClient} from '@repo/backend-common/db';

// Create a new WebSocket server listening on port 8080
const wss = new WebSocketServer({ port: 8080 });

console.log("server created");
interface Users {
    userId : int,
    roomId : int[],
    ws     : WebSocket
}
let users: Users[] = [];   // user will be the empty arror for now, later on we will add the details of the user as an object in it

// Event listener for new client connections
wss.on("connection", function connection(socket, request) {

    const url = request.url;
    const queries = url?.split('?')[1];   // queries will be the array of base url , all other queries --> so to get all other queries we have to use [1]
    
    const searchParams = new URLSearchParams(queries);   // URLSearchParams is usefull to work with the req urls, it acts as the maps provide some function to manipulate or get the url parameters 

    const token  = searchParams.get('token') ?? "";  // URLSearchParams return an object which have bunch of methods one of them is get which helps to get the paricular query from the string of all queries , it also have size method to know total number of queries

    // reference for URLSearchParams --> https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

    const decoded = jwt.verify(token,JWT_SECRET_KEY) as {userId: String}

     // jwt.verify() can return an object with unknown properties (since JWT payloads can vary).
    // The as { userId: String } part forces TypeScript to assume that the decoded object will always contain a userId of type String.


    if(!decoded.userId || decoded){
        socket.close();
        return;
    }

    users.push({
         userId : decoded.userId,
         roomId : [],   // intially the rooms of the user will be an empty array
         ws: socket
    })


    console.log("You are connected to the ws-server");

    // Listen for messages sent by the connected client
    socket.on("message", async function message(data) {

        if( data.type === "join_room" ) {
            // if user want to join the particular room with room id he have mentioned in the message 
            // we will push the room id in the room array for that particular user
            // we should first check in the database for the existance of the room, and if it exist that only we need to let the
            // user to join the room
            const room = await PsClient.room.findFirst({
                where: {
                    id : data.roomId
                }
            })

            if(!room) {
                socket.send(JSON.stringify({
                     message: "No such room exists, try joining another room"
                }));

                return;
            }

            const user = users.find((user)=> user.ws == socket);
            if(!user){
                socket.send(JSON.stringify({
                    message: "Something went wrong"
                }));
                return;
            }
            // if the user exists in the users array
            // push the roomid in the room array of the user
            user.roomId.push(data.roomId);
            ws.send("You have joined the room succesfully");
            return;
        }

        else if(data.type === "chat"){
            // this means the user want to send the message in the room with roomId present in the data
            // we need to traverse to al the users which all are joined into the room with roomId present in the data
            // then we need to send them message with the help of the sockets we havce stored in the object of particular user
            // we also need to check if the current user also belong to the room to which he is sending the message
            // for now we are allowing the user to send message to any of the room of his choice
            users.forEach((user)=>{
                if(user.roomId.includes(data.roomId)){
                    // if the roomid array consist of the room to which the current user want to send the message then we will 
                    // send the message to that user
                    user.ws.send(data.message); // sended the message to the user with the help of his own socket which we have stored
                }
            })
        }

        else if(type === 'leave_room'){
            // we will pop the the roomId provide from the users roomid array
            users.forEach((user)=>{
                if(user.ws === socket){
                  user.roomId =  user.roomId.filter((room)=>room !== data.roomId);
                }
            })
            return;
        }

        else{
            // user might have send the wrong type 
            ws.send("Entered wrong type")
            return;
        }
        
        socket.send(data);
    });

    // Event listener for when the client disconnects
    socket.on("close", () => {
        console.log("Socket has been closed");
    });
});
