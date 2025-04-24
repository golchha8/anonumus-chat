const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const server = new WebSocket.Server({ port: process.env.PORT || 8080 });
const clients = new Map();

function generateUserId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'User';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.on('connection', (ws) => {
    const userId = generateUserId();
    clients.set(ws, userId);
    console.log('A user connected');
    broadcast(`${userId} joined the chat!`, null);

    ws.on('message', (data) => {
        const message = data.toString();
        if (message) {
            broadcast(message, null); // Broadcast to all, including sender
        }
    });

    ws.on('close', () => {
        broadcast(`${userId} left the chat!`, null);
        clients.delete(ws);
        console.log('A user disconnected');
    });

    ws.on('error', (error) => {
        console.log(`Error with a user: ${error.message}`);
        clients.delete(ws);
    });
});

function broadcast(message, senderWs) {
    console.log(message);
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});       