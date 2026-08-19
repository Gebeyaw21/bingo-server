const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let calledNumbers = [];
let intervalId = null;

io.on('connection', (socket) => {
    console.log('አዲስ ተጫዋች ተቀላቅሏል:', socket.id);

    // ለአዲስ ተጫዋች እስካሁን የተጠሩ ቁጥሮችን ላክ
    socket.emit('init', { calledNumbers });

    // ጨዋታ ሲጀመር
    socket.on('startGame', () => {
        if (!intervalId) {
            calledNumbers = [];
            intervalId = setInterval(() => {
                if (calledNumbers.length >= 75) {
                    clearInterval(intervalId);
                    intervalId = null;
                    return;
                }
                let nextNum;
                do {
                    nextNum = Math.floor(Math.random() * 75) + 1;
                } while (calledNumbers.includes(nextNum));

                calledNumbers.push(nextNum);
                io.emit('numberCalled', { number: nextNum, all: calledNumbers });
            }, 3000);
        }
    });

    socket.on('disconnect', () => {
        console.log('ተጫዋች ወጥቷል:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('የቢንጎ ሰርቨር በትክክል እየሰራ ነው!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
