const { loadData, saveData } = require('../../utils/dataUtils');
const bankPath = './bank.json';

module.exports = {
    name: 'daocoin',
    description: 'Đào coin và có cơ hội nhận 🎟️',
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
        let lastMine = account.lastMine || 0;
        let cooldown = 1 * 1000; // 1 giây cooldown


        // Kiểm tra thời gian chờ
        if (now - lastMine < cooldown) {
            let remainingTime = Math.max(((cooldown - (now - lastMine)) / 1000).toFixed(1), 1);
            return message.reply(`⏳ Bạn đã đào coin gần đây! Hãy chờ **${remainingTime} phút** trước khi đào tiếp.`);
        }

        // Đảm bảo user có thuộc tính `tickets`
        if (!account.tickets) account.tickets = 0;

        // Tính phần thưởng 🎟️
        let jackpotChance = Math.random(); // Xác suất nhận vé cao (1%)
        let randomTicket = jackpotChance < 0.001 
            ? 1 
            : parseFloat((Math.random() * (0.005 - 0.000004) + 0.000004).toFixed(6));

        account.tickets += randomTicket;
        account.lastMine = now; // Cập nhật thời gian đào

        saveData(bankPath, bank); // Lưu dữ liệu
        message.reply(`✅ Bạn đã đào coin và nhận được **${randomTicket}🎟️**! Quay lại sau 30 phút.`);
    }
};
