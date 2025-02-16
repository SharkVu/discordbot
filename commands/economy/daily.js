const { loadData, saveData } = require('../../utils/dataUtils');
const bankPath = './bank.json';

module.exports = {
    name: 'diemdanh',
    description: 'Nhận thưởng điểm danh hàng ngày',
    execute(message) {
        let userId = message.author.id; // Lấy UID từ người dùng gửi lệnh
        let bank = loadData(bankPath);

        // Kiểm tra xem tài khoản có tồn tại không
        if (!bank.accounts) bank.accounts = {};
        if (!bank.accounts[userId]) {
            return message.reply("🚫 Bạn chưa đăng ký ngân hàng! Dùng `!dangkybank` để tạo tài khoản.");
        }

        let account = bank.accounts[userId]; // Lấy dữ liệu tài khoản của user
        let now = Date.now();
        let lastCheckIn = account.lastCheckIn || 0;
        let cooldown = 24 * 60 * 60 * 1000; // 24 giờ cooldown

        // Kiểm tra thời gian chờ
        if (now - lastCheckIn < cooldown) {
            let remainingTime = Math.floor((cooldown - (now - lastCheckIn)) / (60 * 60 * 1000));
            return message.reply(`⏳ Bạn đã điểm danh rồi! Hãy quay lại sau **${remainingTime} giờ**.`);
        }

        // Tính phần thưởng ngẫu nhiên từ 1000 - 5000 💵
        let dailyReward = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
        if (!account.balance) account.balance = 0; // Đảm bảo có balance
        account.balance += dailyReward;
        account.lastCheckIn = now; // Cập nhật thời gian điểm danh

        saveData(bankPath, bank); // Lưu dữ liệu
        message.reply(`✅ Bạn đã điểm danh và nhận **${dailyReward.toLocaleString()}💵**! Hẹn gặp lại vào ngày mai!`);
    }
};
