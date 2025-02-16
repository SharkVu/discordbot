const { EmbedBuilder } = require('discord.js'); // Import EmbedBuilder
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data.json');

module.exports = {
    name: 'kyniem',
    description: 'Xem kỷ niệm mối quan hệ',
    execute: async (message, args) => {
        const user = message.mentions.users.first() || message.author;

        // Đọc dữ liệu từ data.json
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            return message.reply('❌ Lỗi đọc dữ liệu người dùng từ data.json!');
        }

        // Lấy thông tin mối quan hệ
        const relationship = data.relationships?.[user.id];
        if (!relationship) {
            return message.reply('❌ Bạn chưa có mối quan hệ nào.');
        }

        const partnerID = relationship.partner;
        let partner;
        try {
            partner = await message.client.users.fetch(partnerID); // Fetch user by ID
        } catch (error) {
            return message.reply('❌ Không thể tìm thấy đối tác mối quan hệ.');
        }

        // Tính toán số ngày mối quan hệ
        const startDate = new Date(relationship.startDate);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - startDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));  // Số ngày

        // Cập nhật tên mối quan hệ và trạng thái
        let relationshipText = 'Chưa có';
        if (relationship.affection >= 200) {
            relationshipText = `Kết hôn: @${partner.username} (${diffDays || 1} ngày)`;
        } else if (relationship.affection >= 100) {
            relationshipText = `Hẹn hò: @${partner.username} (${diffDays || 1} ngày)`;
        } else {
            relationshipText = `Tìm hiểu: @${partner.username} (${diffDays || 1} ngày)`;
        }

        // Điểm thân mật
        const affectionPoints = relationship.affection || 0;

        // Tạo Embed để hiển thị thông tin mối quan hệ
        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle(`Kỷ niệm mối quan hệ với @${partner.username}`)
            .setDescription(`Bạn đang trong mối quan hệ: ${relationshipText}\nĐiểm thân mật: ${affectionPoints} ❤️`)
            .setThumbnail(partner.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Chúc các bạn luôn hạnh phúc ❤️' });

        message.channel.send({ embeds: [embed] });
    }
};
