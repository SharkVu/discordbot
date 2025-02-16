const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../../config.json');

module.exports = {
    name: 'prefix',
    description: 'Thay đổi prefix của bot',
    execute: (message, args, client) => {
        if (!message.member.permissions.has('ADMINISTRATOR')) 
            return message.reply('🚫 Bạn không có quyền dùng lệnh này!');

        const newPrefix = args[0];
        if (!newPrefix || newPrefix.length > 5) {
            return message.reply('⚠ **Vui lòng nhập prefix mới hợp lệ (tối đa 5 ký tự)!**');
        }

        // Đọc file config
        let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config.prefix = newPrefix;

        // Ghi lại file config
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        message.channel.send(`✅ **Prefix đã được thay đổi thành:** \`${newPrefix}\``);
    }
};
