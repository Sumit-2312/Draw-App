// Import the WebSocketServer class from the "ws" package
import { WebSocketServer } from "ws";

// Create a new WebSocket server listening on port 8080
const wss = new WebSocketServer({ port: 8080 });

// Event listener for new client connections
wss.on("connection", function connection(socket, request) {
    console.log("You are connected to the ws-server");

    // Listen for messages sent by the connected client
    socket.on("message", function message(data) {
        // Echo the received message back to the client
        socket.send(data);
    });

    // Event listener for when the client disconnects
    socket.on("close", () => {
        console.log("Socket has been closed");
    });
});
