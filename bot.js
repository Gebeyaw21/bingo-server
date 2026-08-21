
const TelegramBot = require('node-telegram-bot-api');
// እባክዎ የቦትዎን ቶከን እዚህ ያስገቡ
const token = 'YOUR_BOT_TOKEN_HERE'; 
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "እንኳን ወደ አፍሮ ቢንጎ በደህና መጡ!", {
        reply_markup: {
            keyboard: [
                [{ text: '🎮 Play Game' }],
                [{ text: '💰 Deposit' }, { text: '💸 Withdraw' }],
                [{ text: '💳 Balance' }],
                [{ text: '📞 Support' }, { text: '🎁 Invite Friends' }]
            ],
            resize_keyboard: true,
            is_persistent: true
        }
    });
});
