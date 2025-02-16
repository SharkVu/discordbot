const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, '../../data.json');

module.exports = {
    name: 'chiatay',
    description: 'Chia tay với người yêu',
    execute: async (message, args) => {
        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        } catch (err) {
            return message.reply("⚠ Lỗi khi đọc dữ liệu! Hãy báo cáo cho admin.");
        }

        data.relationships = data.relationships || {};
        let user1 = message.author.id;

        if (!data.relationships[user1]) {
            return message.reply("⚠ Bạn chưa có mối quan hệ nào để chia tay!");
        }

        let user2 = data.relationships[user1].partner;
        let partner = message.guild.members.cache.get(user2);

        if (!partner) {
            delete data.relationships[user1];
            delete data.relationships[user2];
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            return message.reply("🚨 Người yêu của bạn không còn trong server, bạn đã độc thân trở lại!");
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_breakup')
                    .setLabel('Đồng ý')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('deny_breakup')
                    .setLabel('Từ chối')
                    .setStyle(ButtonStyle.Success)
            );

        const breakupEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('💔 Yêu cầu chia tay')
            .setDescription(`${message.author} muốn chia tay với <@${user2}>, bạn có đồng ý không?`);

        const sentMessage = await message.channel.send({
            embeds: [breakupEmbed],
            components: [row],
        });

        const filter = interaction => interaction.user.id === user2 && (interaction.customId === 'accept_breakup' || interaction.customId === 'deny_breakup');
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 86400000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'accept_breakup') {
                delete data.relationships[user1];
                delete data.relationships[user2];
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

                const successEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('💔 Chia tay thành công')
                    .setDescription(`**${message.author} và <@${user2}> đã chính thức chia tay.** 😢`);

                await interaction.update({
                    embeds: [successEmbed],
                    components: [],
                });
            } else {
                const denyEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('❤️ Chia tay bị từ chối')
                    .setDescription(`**<@${user2}> đã từ chối chia tay!** Có vẻ vẫn còn tình cảm? 💕`);

                await interaction.update({
                    embeds: [denyEmbed],
                    components: [],
                });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                sentMessage.edit({
                    content: '⏰ Hết thời gian phản hồi.',
                    components: [],
                });
            }
        });
    },
};
