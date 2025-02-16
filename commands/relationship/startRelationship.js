const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dataFile = path.join(__dirname, '../../data.json');

module.exports = {
    name: 'timhieu',
    description: 'Bắt đầu tìm hiểu một người',
    execute: (message, args) => {
        // Đọc dữ liệu an toàn
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        } catch (err) {
            return message.reply("⚠ Lỗi khi đọc dữ liệu! Hãy báo cáo cho admin.");
        }

        data.relationships = data.relationships || {};

        if (args.length < 1) return message.reply('Vui lòng tag người bạn muốn tìm hiểu.');

        let user1 = message.author.id;
        let user2 = message.mentions.users.first();

        if (!user2 || user2.id === user1) {
            return message.reply('⚠ Bạn phải tag một người hợp lệ!');
        }

        if (data.relationships[user1] || data.relationships[user2.id]) {
            return message.reply('⚠ Một trong hai bạn đã có mối quan hệ rồi!');
        }

        const confirmEmbed = new EmbedBuilder()
            .setTitle('💬 Tìm hiểu mối quan hệ')
            .setDescription(`${message.author} muốn tìm hiểu ${user2}, bạn có đồng ý không?`)
            .setColor(0x00FF00);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Đồng ý')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('decline')
                    .setLabel('Từ chối')
                    .setStyle(ButtonStyle.Danger)
            );

        message.channel.send({ embeds: [confirmEmbed], components: [row] }).then(sentMessage => {
            const filter = (i) => i.user.id === user2.id; // Chỉ người được tag mới có thể nhấn nút
            const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 }); // Thời gian chờ 60 giây

            collector.on('collect', async (i) => {
                if (i.customId === 'accept') {
                    data.relationships[user1] = { partner: user2.id, affection: 50 };
                    data.relationships[user2.id] = { partner: user1, affection: 50 };

                    try {
                        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                    } catch (err) {
                        return message.reply("⚠ Lỗi khi lưu dữ liệu! Hãy báo cáo cho admin.");
                    }

                    message.channel.send(`🎉 Chúc mừng ${message.author} và ${user2} đã thành một cặp! ❤️`);
                } else if (i.customId === 'decline') {
                    message.channel.send(`💔 ${message.author}, có vẻ như ${user2} không đồng ý. Đừng buồn nhé! 😢`);
                }

                i.update({ components: [] }); // Xóa nút sau khi quyết định
                collector.stop(); // Dừng collector ngay khi phản hồi được thực hiện
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    message.channel.send(`⏰ Thời gian phản hồi đã hết! ${user2} chưa đưa ra quyết định.`);
                    sentMessage.edit({ components: [] }); // Xóa nút khi hết thời gian
                }
            });
        });
    }
};
