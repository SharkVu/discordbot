const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { loadData } = require('../../utils/dataUtils');
const bankPath = './bank.json';

module.exports = {
    name: 'top',
    description: '🏆 Xem bảng xếp hạng người giàu nhất (tiền + ticket)',
    async execute(message) {
        let bankData = loadData(bankPath);
        if (!bankData.accounts) return message.reply("⚠ Không có dữ liệu ngân hàng!");

        const ticketValue = 1_000_000; // 1 ticket = 1 triệu 💵

        let leaderboard = await Promise.all(
            Object.entries(bankData.accounts).map(async ([userId, acc]) => {
                let member = await message.guild.members.fetch(userId).catch(() => null);
                let username = member ? member.user.username : `Người #${userId}`;
                let money = acc.balance || 0;
                let tickets = acc.tickets || 0;
                let totalValue = money + tickets * ticketValue;
                return { userId, username, money, tickets, totalValue };
            })
        );

        leaderboard = leaderboard.sort((a, b) => b.totalValue - a.totalValue).slice(0, 50);

        if (leaderboard.length === 0) return message.reply("⚠ Không có ai trong bảng xếp hạng!");

        let page = 0;
        const itemsPerPage = 10;
        const totalPages = Math.ceil(leaderboard.length / itemsPerPage);

        const generateEmbed = (page) => {
            let start = page * itemsPerPage;
            let end = start + itemsPerPage;
            let topList = leaderboard.slice(start, end)
                .map((user, index) => {
                    let rank = start + index + 1;
                    let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                    return `${medal} <@${user.userId}> — 💵 ${user.money.toLocaleString()} | 🎟️ ${user.tickets}`;
                }).join("\n");

            return new EmbedBuilder()
                .setTitle("🏆 **Bảng Xếp Hạng Đại Gia** 🏆")
                .setDescription(topList || "Không có dữ liệu!")
                .setFooter({ text: `Trang ${page + 1}/${totalPages}` })
                .setColor('#FFD700');
        };

        let embed = generateEmbed(page);

        let buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('⬅️ Trang Trước')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('➡️ Trang Sau')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages - 1)
            );

        let msg = await message.channel.send({ embeds: [embed], components: [buttons] });

        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'prev' && page > 0) page--;
            if (i.customId === 'next' && page < totalPages - 1) page++;

            embed = generateEmbed(page);
            buttons.components[0].setDisabled(page === 0);
            buttons.components[1].setDisabled(page === totalPages - 1);

            await i.update({ embeds: [embed], components: [buttons] });
        });

        collector.on('end', () => msg.edit({ components: [] }));
    }
};
