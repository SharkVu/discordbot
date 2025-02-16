const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '../../data.json');
const bankPath = path.join(__dirname, '../../bank.json');

module.exports = {
    name: 'thongtin',
    description: 'Xem thông tin tài khoản của user',
    execute: async (message, args) => {
        const user = message.mentions.users.first() || message.author;

        // Đọc dữ liệu từ data.json
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            return message.reply('❌ Lỗi đọc dữ liệu người dùng từ data.json!');
        }

        // Đọc dữ liệu từ bank.json
        let bankData;
        try {
            bankData = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
        } catch (error) {
            return message.reply('❌ Lỗi đọc dữ liệu người dùng từ bank.json!');
        }

        data.users = data.users || {};
        const userData = data.users[user.id] || { money: 0, tickets: 0, bankAccount: 'Chưa đăng ký', items: [] };

        // Lấy thông tin mối quan hệ
        const relationship = data.relationships?.[user.id];
        let relationshipText = 'Chưa có';
        let relationshipPartner = '';
        let relationshipDuration = 'N/A';

        if (relationship) {
            const partnerID = relationship.partner;
            let partner;
            try {
                partner = await message.client.users.fetch(partnerID); // Fetch user by ID
                relationshipPartner = partner ? `@${partner.username}` : 'Không xác định';
            } catch (error) {
                relationshipPartner = 'Không xác định';
            }

            // Tính toán số ngày mối quan hệ
            const startDate = new Date(relationship.startDate);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - startDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));  // Số ngày

            // Cập nhật trạng thái mối quan hệ
            if (relationship.affection >= 200) {
                relationshipText = `Kết hôn: @${partner.username} (${diffDays || 1} ngày)`; // Đảm bảo luôn có ít nhất 1 ngày
            } else if (relationship.affection >= 100) {
                relationshipText = `Hẹn hò: @${partner.username} (${diffDays || 1} ngày)`;  // Đảm bảo luôn có ít nhất 1 ngày
            } else {
                relationshipText = `Tìm hiểu: @${partner.username} (${diffDays || 1} ngày)`;  // Đảm bảo luôn có ít nhất 1 ngày
            }
        }

        // Kiểm tra xem userData.items có phải là mảng không
        const items = Array.isArray(userData.items) && userData.items.length > 0 ? userData.items.join(', ') : 'Không có';

        // Lấy thông tin tài khoản ngân hàng từ bank.json
        const account = bankData.accounts?.[user.id] || {};
        const bankAccount = account.accountNumber ? account.accountNumber.toString() : 'Chưa đăng ký';
        const balance = account.balance || 0;
        const tickets = account.tickets || 0;
        const itemsInBank = account.items?.length > 0 ? account.items.join(', ') : 'Không có vật phẩm';
        const lastMine = account.lastMine ? new Date(account.lastMine).toLocaleString() : 'Chưa khai thác';
        const lastCheckIn = account.lastCheckIn ? new Date(account.lastCheckIn).toLocaleString() : 'Chưa điểm danh';

        // Đảm bảo tất cả các giá trị đều là chuỗi
        const safeString = (value) => (value && typeof value !== 'string' ? JSON.stringify(value) : value);

        // Tạo Embed để hiển thị thông tin người dùng
        const embed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle(`📜 Thông tin tài khoản của ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🏦 Số tài khoản ngân hàng', value: safeString(bankAccount), inline: false },
                { name: '💰 Số dư ngân hàng', value: `${safeString(balance).toLocaleString()}💵`, inline: false },
                { name: '🎟️ Vé hiếm trong ngân hàng', value: `${safeString(tickets)}🎟️`, inline: false },
                { name: '🎒 Vật phẩm trong ngân hàng', value: safeString(itemsInBank), inline: false },
                { name: '⛏️ Thời gian khai thác gần nhất', value: safeString(lastMine), inline: false },
                { name: '📅 Thời gian điểm danh gần nhất', value: safeString(lastCheckIn), inline: false },
                { name: '❤️ Mối quan hệ', value: relationshipText, inline: false },
            )
            .setFooter({ text: 'Dùng !shop để mua vật phẩm hoặc !timhieu để bắt đầu quan hệ ❤️' });

        message.channel.send({ embeds: [embed] });
    }
};
