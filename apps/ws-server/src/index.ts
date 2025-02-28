// Import the WebSocketServer class from the "ws" package
import WebSocket,{ WebSocketServer } from "ws";
import jwt from 'jsonwebtoken'
import {JWT_SECRET_KEY} from '@repo/backend-common/config'

// Create a new WebSocket server listening on port 8080
const wss = new WebSocketServer({ port: 8080 });
let allSockets: WebSocket[] = [];

console.log("server created");


// Event listener for new client connections
wss.on("connection", function connection(socket: WebSocket, request) {

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

    allSockets.push(socket);  // pushed the current socket to all the users socket array


    console.log("You are connected to the ws-server");



    // when an user connect we get its socket to send the message and through the jwt we can get the user's details also, his room, all his chats
    // by matching the room we can actually send the message to all the sockets present in that specific group

    socket.on("message", function message(data) {
        socket.send(data);
    });

    // Event listener for when the client disconnects
    socket.on("close", () => {
        allSockets = allSockets.filter((currentsocket)=>currentsocket !== socket)
        console.log("Socket has been closed");
    });
});
