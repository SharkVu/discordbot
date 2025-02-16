const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { loadData, saveData } = require('../../utils/dataUtils'); // Kiểm tra lại nếu lỗi
const bankPath = './bank.json';

const cooldowns = new Map();
const transactions = new Map(); // Lưu giao dịch đang chờ

module.exports = {
    name: 'tradecoin',
    description: 'Giao dịch 🎟️ giữa hai người',
    execute(message, args, userId) {
        let bank = loadData(bankPath);
        let targetUser = message.mentions.users.first();
        let amount = parseInt(args[1]);

        if (!targetUser) return message.reply('❌ Vui lòng tag người bạn muốn giao dịch!');
        if (!amount || isNaN(amount)) return message.reply('❌ Vui lòng nhập số lượng hợp lệ!');
        if (amount < 1 || amount > 20) return message.reply('❌ Bạn chỉ có thể giao dịch từ **1-20** 🎟️!');

        // Kiểm tra tài khoản tồn tại
        if (!bank.accounts[userId] || !bank.accounts[targetUser.id]) {
            return message.reply('❌ Cả hai người đều phải có tài khoản ngân hàng!');
        }
        if (bank.accounts[userId].tickets < amount) {
            return message.reply('❌ Bạn không có đủ 🎟️ để giao dịch!');
        }

        // Kiểm tra nếu có giao dịch đang chờ xử lý
        if (transactions.has(userId) || transactions.has(targetUser.id)) {
            return message.reply('⚠ Hiện tại bạn hoặc người nhận đang có một giao dịch đang chờ xử lý.');
        }

        // Kiểm tra cooldown
        let lastTradeSender = cooldowns.get(userId) || 0;
        let lastTradeReceiver = cooldowns.get(targetUser.id) || 0;
        let now = Date.now();
        let cooldownTime = 10 * 60 * 1000; // 10 phút

        if (now - lastTradeSender < cooldownTime || now - lastTradeReceiver < cooldownTime) {
            let remaining = Math.ceil((cooldownTime - Math.min(now - lastTradeSender, now - lastTradeReceiver)) / 60000);
            return message.reply(`⏳ Bạn hoặc người nhận phải đợi **${remaining} phút** trước khi giao dịch tiếp!`);
        }

        // Đánh dấu giao dịch đang chờ xử lý
        transactions.set(userId, { target: targetUser.id, amount });

        // Tạo Embed xác nhận
        const confirmEmbed = new EmbedBuilder()
            .setTitle('💱 Xác Nhận Giao Dịch')
            .setDescription(`🔄 <@${userId}> muốn gửi **${amount}🎟️** cho <@${targetUser.id}>.\n\n<@${targetUser.id}>, hãy nhấn nút ✅ để chấp nhận hoặc ❌ để từ chối.`)
            .setColor(0x00c3ff);

        // Tạo nút xác nhận
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_${userId}`)
                    .setLabel('Chấp nhận')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`decline_${userId}`)
                    .setLabel('Từ chối')
                    .setStyle(ButtonStyle.Danger)
            );

        message.channel.send({ embeds: [confirmEmbed], components: [row] }).then(sentMessage => {
            const filter = i => i.user.id === targetUser.id;
            const collector = sentMessage.createMessageComponentCollector({ filter, time: 30000 });

            collector.on('collect', async i => {
                if (i.customId === `accept_${userId}`) {
                    if (bank.accounts[userId].tickets < amount) {
                        i.reply({ content: '❌ Giao dịch thất bại! Bạn không còn đủ 🎟️.', ephemeral: true });
                        transactions.delete(userId);
                        return;
                    }

                    // Thực hiện giao dịch
                    bank.accounts[userId].tickets -= amount;
                    bank.accounts[targetUser.id].tickets += amount;

                    // Lưu lại dữ liệu
                    saveData(bankPath, bank);

                    // Đặt cooldown
                    cooldowns.set(userId, now);
                    cooldowns.set(targetUser.id, now);

                    transactions.delete(userId);
                    i.reply(`✅ Giao dịch thành công! **${amount}🎟️** đã được chuyển từ <@${userId}> đến <@${targetUser.id}>.`);
                } else if (i.customId === `decline_${userId}`) {
                    i.reply({ content: `❌ Giao dịch bị từ chối bởi <@${targetUser.id}>.`, ephemeral: true });
                    transactions.delete(userId);
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    message.channel.send('⏳ Giao dịch đã hết hạn do không có phản hồi.');
                    transactions.delete(userId);
                }
            });
        });
    }
};
