const fs = require('fs');
const path = require('path');
const bankPath = path.join(__dirname, '../../bank.json');

// Hàm đọc dữ liệu từ file JSON
const readBankData = () => {
    try {
        return JSON.parse(fs.readFileSync(bankPath, 'utf8'));
    } catch (err) {
        return { accounts: {} }; // Tránh lỗi nếu file trống
    }
};

// Hàm ghi dữ liệu vào file JSON
const writeBankData = (data) => {
    try {
        fs.writeFileSync(bankPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        throw new Error('Lỗi khi lưu dữ liệu ngân hàng!');
    }
};

module.exports = {
    name: 'pay',
    description: '💰 Chuyển tiền đến người khác bằng @mention hoặc số tài khoản',
    async execute(message, args) {
        if (args.length < 2) {
            return message.reply("⚠ Sử dụng: `!pay <@người nhận | số tài khoản> <số tiền>`");
        }

        let recipient = message.mentions.users.first() || args[0];
        let amount = parseInt(args[1]);

        if (isNaN(amount) || amount <= 0) {
            return message.reply("🚫 Số tiền không hợp lệ!");
        }

        let bankData = readBankData();
        if (!bankData.accounts) bankData.accounts = {};

        let senderId = message.author.id;

        // Kiểm tra tài khoản người gửi
        if (!bankData.accounts[senderId]) {
            return message.reply("⚠ Bạn chưa có tài khoản ngân hàng! Dùng `!dangkybank` để đăng ký.");
        }

        if (bankData.accounts[senderId].balance < amount) {
            return message.reply("💸 Bạn không có đủ tiền để chuyển!");
        }

        let receiverId;
        let receiverName;

        // Nếu người nhận là @mention
        if (recipient.id) {
            receiverId = recipient.id;
            receiverName = recipient.username;
        } else {
            // Nếu nhập số tài khoản, tìm user theo accountNumber
            receiverId = Object.keys(bankData.accounts).find(id => bankData.accounts[id].accountNumber == recipient);
            if (!receiverId) {
                return message.reply("❌ Số tài khoản không tồn tại!");
            }
            let member = await message.guild.members.fetch(receiverId).catch(() => null);
            receiverName = member ? member.user.username : `Người #${receiverId}`;
        }

        if (!bankData.accounts[receiverId]) {
            return message.reply("❌ Người nhận chưa có tài khoản ngân hàng!");
        }

        // Thực hiện giao dịch
        bankData.accounts[senderId].balance -= amount;
        bankData.accounts[receiverId].balance += amount;

        writeBankData(bankData);

        return message.reply(
            `✅ Bạn đã chuyển **${amount.toLocaleString()}💵** cho **${receiverName}** thành công!`
        );
    }
};
