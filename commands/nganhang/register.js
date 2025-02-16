const { readBankData, writeBankData } = require('../../utils/bankUtils');

module.exports = {
    name: 'dangkybank',
    description: 'Đăng ký tài khoản ngân hàng',
    execute(message, args, client) {
        let bankData = readBankData();
        let userId = message.author.id; // Lấy UID từ người dùng gửi lệnh

        if (!bankData.accounts) bankData.accounts = {}; // Đảm bảo object `accounts` tồn tại
        if (bankData.accounts[userId]) {
            return message.reply("⚠ Bạn đã có tài khoản ngân hàng rồi!");
        }

        let newAccountNumber = Math.floor(100000000 + Math.random() * 900000000);
        bankData.accounts[userId] = {
            uid: userId, // Thêm UID vào dữ liệu ngân hàng
            balance: 0,
            tickets: 0,
            accountNumber: newAccountNumber,
            items: []
        };

        writeBankData(bankData);
        
        return message.reply(
            `🏦 **Tài khoản ngân hàng của bạn đã được tạo!**\n` +
            `👤 **UID của bạn:** ${userId}\n` +
            `📌 **Số tài khoản:** ${newAccountNumber}`
        );
    }
};
