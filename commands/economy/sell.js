const { loadData, saveData } = require('../../utils/dataUtils');
const bankPath = './bank.json';
const shopPath = './shop.json';

module.exports = {
    name: 'ban',
    description: 'Bán vật phẩm để lấy tiền',
    execute(message, args) {
        let userId = message.author.id; // Lấy UID từ người gửi lệnh
        let bank = loadData(bankPath);
        let shop = loadData(shopPath);

        // Đảm bảo dữ liệu tồn tại
        if (!bank.accounts) bank.accounts = {}; // Kiểm tra và khởi tạo accounts nếu chưa có
        if (!bank.accounts[userId]) {
            return message.reply("🚫 Bạn chưa đăng ký ngân hàng! Dùng `!dangkybank` để tạo tài khoản.");
        }
        
        // Kiểm tra và đảm bảo tài khoản người dùng có balance
        let account = bank.accounts[userId];
        if (typeof account.balance === 'undefined') {
            account.balance = 0; // Khởi tạo balance nếu chưa có
        }

        if (!args.length) return message.reply("❌ Vui lòng nhập icon vật phẩm cần bán!");

        let itemIcon = args.join(' '); // Lấy icon vật phẩm từ lệnh

        // Kiểm tra nếu user chưa có items hoặc không có vật phẩm nào
        if (!account.items || account.items.length === 0) {
            return message.reply("❌ Bạn không có vật phẩm nào để bán!");
        }

        // Kiểm tra xem user có vật phẩm này không
        let itemIndex = account.items.findIndex(i => i === itemIcon); // Dùng icon thay vì tên
        if (itemIndex === -1) {
            return message.reply("❌ Bạn không có vật phẩm này!");
        }

        // Kiểm tra cửa hàng có vật phẩm này không
        if (!Array.isArray(shop)) return message.reply("❌ Dữ liệu cửa hàng bị lỗi! Hãy báo cho admin.");
        let item = shop.find(i => i.icon === itemIcon); // Tìm vật phẩm theo icon
        if (!item) return message.reply("❌ Vật phẩm không tồn tại trong cửa hàng!");

        let sellPrice = Math.floor(item.price * 0.8); // Giá bán = 80% giá mua
        account.balance = (account.balance || 0) + sellPrice; // Đảm bảo balance không bị NaN
        account.items.splice(itemIndex, 1); // Xóa vật phẩm khỏi kho

        // Lưu dữ liệu ngân hàng
        saveData(bankPath, bank);

        message.reply(`✅ Bạn đã bán **${item.icon} ${item.name}** và nhận được **${sellPrice.toLocaleString()}💵**!`);
    }
};
