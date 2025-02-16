const { loadData, saveData } = require('../../utils/dataUtils');
const shop = require('../../shop.json'); // Đảm bảo có file shop.json chứa danh sách vật phẩm
const bankPath = './bank.json';

module.exports = {
    name: 'mua',
    description: 'Mua vật phẩm trong cửa hàng',
    execute(message, args) {
        let userId = message.author.id; // Lấy UID từ người dùng gửi lệnh
        let bank;

        // Đọc dữ liệu ngân hàng
        try {
            bank = loadData(bankPath);
        } catch (err) {
            return message.reply("⚠ Lỗi khi đọc dữ liệu ngân hàng! Hãy báo cho admin.");
        }

        // Kiểm tra nếu user chưa có tài khoản ngân hàng
        if (!bank.accounts || !bank.accounts[userId]) {
            return message.reply("🚫 Bạn chưa đăng ký ngân hàng! Dùng `!dangkybank` để tạo tài khoản.");
        }

        let account = bank.accounts[userId]; // Lấy dữ liệu tài khoản của user
        let itemIcon = args.join(' '); // Lấy icon vật phẩm từ lệnh
        let item = shop.find(i => i.icon === itemIcon); // Tìm vật phẩm trong shop dựa trên icon

        // Kiểm tra vật phẩm tồn tại trong cửa hàng
        if (!item) return message.reply("❌ Vật phẩm không tồn tại trong cửa hàng!");

        // Kiểm tra số dư tài khoản người dùng có đủ tiền không
        if (account.balance < item.price) return message.reply("❌ Bạn không đủ tiền để mua vật phẩm này!");

        // Đảm bảo user có danh sách items nếu chưa có
        if (!account.items) account.items = [];

        // Trừ tiền và thêm vật phẩm vào kho của người dùng
        account.balance -= item.price;
        account.items.push(item.name);

        // Lưu lại dữ liệu ngân hàng
        try {
            saveData(bankPath, bank);
        } catch (err) {
            return message.reply("⚠ Lỗi khi lưu dữ liệu! Hãy báo cho admin.");
        }

        // Thông báo giao dịch thành công
        message.reply(`✅ Bạn đã mua **${item.icon} ${item.name}** thành công với giá **${item.price.toLocaleString()}💵** và nhận được **${item.affinity}❤️**!`);
    }
};
