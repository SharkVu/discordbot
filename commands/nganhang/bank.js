const { readBankData } = require('../../utils/bankUtils');

module.exports = {
    name: 'bank',
    description: 'Xem số dư tài khoản ngân hàng',
    execute(message, args, client) {
        let bankData = readBankData();
        let userId = message.author.id; // Lấy UID từ người dùng gửi lệnh

        // Đảm bảo dữ liệu ngân hàng tồn tại
        if (!bankData || typeof bankData !== 'object') bankData = {};
        if (!bankData.accounts) bankData.accounts = {};

        // Kiểm tra tài khoản ngân hàng của user
        if (!bankData.accounts[userId]) {
            return message.reply("🚫 Bạn chưa đăng ký tài khoản ngân hàng! Dùng `!dangkybank` để tạo tài khoản.");
        }

        let { balance, tickets, accountNumber, items } = bankData.accounts[userId];

        message.reply(
            `🏦 **Thông tin ngân hàng của bạn**\n` +
            `👤 **UID:** ${userId}\n` +
            `💰 **Số dư:** ${balance.toLocaleString()}💵\n` +
            `🎟️ **Ticket:** ${tickets}\n` +
            `🏧 **Số tài khoản:** ${accountNumber}\n` +
            `🎒 **Vật phẩm:** ${items.length > 0 ? items.join(', ') : 'Không có'}`
        );
    }
};
