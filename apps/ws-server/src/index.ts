// Import the WebSocketServer class from the "ws" package
import WebSocket, { WebSocketServer } from "ws";
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '@repo/backend-common/config';
import { PsClient } from '@repo/backend-common/db';

// Create a new WebSocket server listening on port 8080
const wss = new WebSocketServer({ port: 8080 });
let allSockets: WebSocket[] = [];

console.log("server created");

interface Users {
    userId: string; // Changed from Int16Array to string to match decoded JWT
    roomId: number[]; // Changed from Int16Array[] to number[] for simplicity
    ws: WebSocket;
}

let users: Users[] = []; // Initially an empty array to store connected users

// Event listener for new client connections
wss.on("connection", function connection(socket: WebSocket, request) {
    const url = request.url;
    const queries = url?.split('?')[1]; // Extract query parameters

    const searchParams = new URLSearchParams(queries); // Parses query parameters

    const token = searchParams.get('token') ?? ""; // Get the token from query params

    // Decode JWT token
    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY) as { userId: string };

        if (!decoded || !decoded.userId) {
            socket.close();
            return;
        }

        users.push({
            userId: decoded.userId,
            roomId: [], // Initially, the user is not in any room
            ws: socket
        });

        console.log("You are connected to the ws-server");
    } catch (error) {
        socket.close();
        return;
    }

    // Listen for messages sent by the connected client
    socket.on("message", async function message(rawData) {
        const data = JSON.parse(rawData.toString()); // Parse incoming data

        if (data.type === "join_room") {
            // Check if the room exists in the database
            const room = await PsClient.room.findFirst({
                where: {
                    id: data.roomId
                }
            });

            if (!room) {
                socket.send(JSON.stringify({
                    message: "No such room exists, try joining another room"
                }));
                return;
            }

            // Find the user in the users array
            const user = users.find((user) => user.ws === socket);
            if (!user) {
                socket.send(JSON.stringify({
                    message: "Something went wrong"
                }));
                return;
            }

            // Add the room ID to the user's room list
            user.roomId.push(data.roomId);
            socket.send(JSON.stringify({
                message: "You have joined the room successfully"
            }));
            return;
        } 
        
        else if (data.type === "chat") {
            // Broadcast message to all users in the specified room
            users.forEach((user) => {
                if (user.roomId.includes(data.roomId)) {
                    user.ws.send(JSON.stringify({
                        message: data.message,
                        roomId: data.roomId
                    }));
                }
            });
        } 
        
        else if (data.type === "leave_room") {
            // Remove the room ID from the user's room list
            users.forEach((user) => {
                if (user.ws === socket) {
                    user.roomId = user.roomId.filter((room) => room !== data.roomId);
                }
            });
            socket.send(JSON.stringify({
                message: "You have left the room"
            }));
            return;
        } 
        
        else {
            // Handle incorrect message types
            socket.send(JSON.stringify({
                message: "Entered wrong type"
            }));
            return;
        }
    });

    // Event listener for when the client disconnects
    socket.on("close", () => {
        allSockets = allSockets.filter((currentsocket) => currentsocket !== socket);
        users = users.filter((user) => user.ws !== socket);
        console.log("Socket has been closed");
    });
});
