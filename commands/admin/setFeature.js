const { loadData, saveData } = require('../../utils/dataUtils');
const dataPath = './data.json';

module.exports = {
    name: 'caidat',
    description: 'Cấu hình tính năng bot cho một kênh cụ thể',
    execute: (message, args) => {
        if (!message.member.permissions.has('ADMINISTRATOR')) 
            return message.reply('🚫 Bạn không có quyền dùng lệnh này!');

        const feature = args[0]?.toLowerCase(); // Chuyển về chữ thường để đồng nhất
        const channel = message.mentions.channels.first();

        if (!feature || !channel) {
            return message.reply('⚠ **Cách dùng:** `!caidat <tính năng> #kênh`\n📌 **Ví dụ:** `!caidat diemdanh #nhiem-vu`');
        }

        // Danh sách tính năng hợp lệ
        const validFeatures = ['diemdanh', 'nhiemvu', 'shop', 'tradecoin'];
        if (!validFeatures.includes(feature)) {
            return message.reply(`⚠ **Tính năng không hợp lệ!**\n📌 **Danh sách hợp lệ:** \`${validFeatures.join(', ')}\``);
        }

        // Tải dữ liệu và cập nhật settings
        let data = loadData(dataPath);
        data.settings = data.settings || {};
        data.settings[feature] = channel.id;
        saveData(dataPath, data);

        message.channel.send(`✅ **Đã cài đặt tính năng \`${feature}\` trong kênh** ${channel}!`);
    }
};
