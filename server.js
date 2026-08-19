const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

let calledNumbers = [];
let intervalId = null;
let gameActive = false;

io.on('connection', (socket) => {
    socket.emit('init', { calledNumbers, gameActive });

    socket.on('startGame', () => {
        if (!gameActive) {
            calledNumbers = [];
            gameActive = true;
            io.emit('gameStarted');

            intervalId = setInterval(() => {
                if (calledNumbers.length >= 75) {
                    clearInterval(intervalId);
                    gameActive = false;
                    io.emit('gameOver', { message: 'ሁሉም ቁጥሮች ተጠርተው አልቀዋል!' });
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

    // BINGO ማረጋገጫ logic
    socket.on('claimBingo', (userCartela) => {
        if (!gameActive) return;

        // ተጫዋቹ የመረጣቸውን ቁጥሮች እና ሰርቨሩ የጠራቸውን ማወዳደር
        const isWinner = userCartela.every(num => num === 'FREE' || calledNumbers.includes(num));

        if (isWinner) {
            clearInterval(intervalId);
            gameActive = false;
            io.emit('winnerFound', { winnerId: socket.id.substring(0, 5) });
        } else {
            socket.emit('falseBingo', { message: 'ስህተት! ያልተጠራ ቁጥር መርጠዋል።' });
        }
    });

    socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
