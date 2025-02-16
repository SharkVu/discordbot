const { loadData, saveData } = require('../../utils/dataUtils');
const dataPath = './data.json';
const bankPath = './bank.json';

module.exports = {
    name: 'nhiemvu',
    description: 'Kiểm tra và nhận thưởng nhiệm vụ hàng ngày',
    execute(message) {
        let userId = message.author.id; // Lấy UID từ người dùng gửi lệnh
        let data = loadData(dataPath);
        let bank = loadData(bankPath);

        // Đảm bảo dữ liệu tồn tại
        if (!data.users) data.users = {};
        if (!bank.accounts) bank.accounts = {};

        // Kiểm tra user có tài khoản ngân hàng không
        if (!bank.accounts[userId]) {
            return message.reply("🚫 Bạn chưa đăng ký ngân hàng! Dùng `!dangkybank` để tạo tài khoản.");
        }

        // Đảm bảo dữ liệu user tồn tại
        if (!data.users[userId]) {
            data.users[userId] = { messages: 0, missionProgress: 0, lastMission: 0 };
        }
        if (!bank.accounts[userId].balance) bank.accounts[userId].balance = 0;

        let account = bank.accounts[userId]; // Dữ liệu ngân hàng
        let userData = data.users[userId]; // Dữ liệu nhiệm vụ
        let now = new Date();
        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); // Reset về 00:00 hôm nay

        let progress = userData.missionProgress;
        let reward = 10000;
        let missionGoal = 1000;

        // Kiểm tra xem user đã nhận thưởng hôm nay chưa
        if (userData.lastMission === today) {
            return message.reply("⚠ Bạn đã nhận thưởng nhiệm vụ hôm nay rồi, hãy quay lại vào ngày mai!");
        }

        // Tăng tiến trình mỗi khi user thực hiện lệnh
        if (progress < missionGoal) {
            // Tăng tiến trình nhiệm vụ
            userData.missionProgress += 1;  // Mỗi lần dùng lệnh sẽ tăng 1

            // Lưu dữ liệu sau mỗi lần cập nhật
            saveData(dataPath, data);

            // Kiểm tra xem người dùng đã hoàn thành nhiệm vụ chưa
            if (userData.missionProgress >= missionGoal) {
                // Hoàn thành nhiệm vụ
                userData.missionProgress = missionGoal;
                userData.lastMission = today;  // Đánh dấu là đã nhận thưởng hôm nay
                account.balance += reward;  // Thưởng cho người dùng

                saveData(bankPath, bank);  // Lưu cập nhật ngân hàng
                saveData(dataPath, data);  // Lưu cập nhật nhiệm vụ

                return message.reply(`🎉 Bạn đã hoàn thành nhiệm vụ và nhận **${reward.toLocaleString()}💵**!`);
            } else {
                // Tiến trình nhiệm vụ vẫn chưa hoàn thành
                return message.reply(`📊 Tiến trình nhiệm vụ của bạn: **${userData.missionProgress}/${missionGoal}** tin nhắn.`);
            }
        } else {
            // Trường hợp đã hoàn thành nhiệm vụ, không cần tăng tiến trình nữa
            return message.reply(`🎉 Bạn đã hoàn thành nhiệm vụ từ trước đó. Nhận thưởng đã được cấp!`);
        }
    }
};
