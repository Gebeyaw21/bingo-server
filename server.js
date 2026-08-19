const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

let calledNumbers = [];
let intervalId = null;
let gameActive = false;
let verifiedTxns = new Set();
let connectedPlayers = 0;

// የቴሌብር SMS ማረጋገጫ
app.post('/api/verify-sms', (req, res) => {
    const { message } = req.body;
    const txnMatch = message.match(/(?:Transaction ID|Txn ID|Trans\. ID|ID)[:\s]*([A-Za-z0-9]+)/i);

    if (txnMatch && txnMatch[1]) {
        const txnId = txnMatch[1];
        if (!verifiedTxns.has(txnId)) {
            verifiedTxns.add(txnId);
            return res.json({ success: true, message: 'ክፍያው በትክክል ተረጋግጧል! መጫወት ይችላሉ።' });
        }
        return res.json({ success: false, message: 'ይህ Transaction ID ቀደም ሲል ጥቅም ላይ ውሏል!' });
    }
    return res.json({ success: false, message: 'ትክክለኛ የቴሌብር SMS አልተገኘም።' });
});

io.on('connection', (socket) => {
    connectedPlayers++;
    io.emit('playerCountUpdate', connectedPlayers);

    socket.on('disconnect', () => {
        connectedPlayers = Math.max(0, connectedPlayers - 1);
        io.emit('playerCountUpdate', connectedPlayers);
    });

    socket.on('startGame', () => {
        if (!gameActive) {
            calledNumbers = [];
            gameActive = true;
            io.emit('gameStarted');

            intervalId = setInterval(() => {
                if (calledNumbers.length >= 75) {
                    clearInterval(intervalId);
                    gameActive = false;
                    return io.emit('gameOver', { message: 'ጨዋታው ተጠናቋል!' });
                }
                let nextNum;
                do { nextNum = Math.floor(Math.random() * 75) + 1; } while (calledNumbers.includes(nextNum));
                calledNumbers.push(nextNum);
                io.emit('numberCalled', { number: nextNum });
            }, 3000);
        }
    });

    socket.on('claimBingo', (selectedNums) => {
        if (!gameActive) return;
        const isWinner = selectedNums.every(n => n === 'FREE' || calledNumbers.includes(n));
        if (isWinner) {
            clearInterval(intervalId);
            gameActive = false;
            io.emit('winnerFound', { winner: socket.id.substring(0, 5) });
        } else {
            socket.emit('falseBingo', { message: 'ስህተት! ያልተጠራ ቁጥር መርጠዋል።' });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
