const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data.json');
const bankPath = path.join(__dirname, '../../bank.json');
const shopPath = path.join(__dirname, '../../shop.json');

module.exports = {
    name: 'tangqua',
    description: 'Tặng vật phẩm cho người yêu và tăng điểm thân mật',
    execute: async (message, args) => {
        const user = message.author;
        const partner = message.mentions.users.first();

        if (!partner) {
            return message.reply('❌ Bạn phải chỉ định người nhận vật phẩm bằng cách sử dụng @user.');
        }

        const itemIcon = args[0];
        if (!itemIcon) {
            return message.reply('❌ Bạn phải chỉ định vật phẩm cần tặng.');
        }

        // Đọc dữ liệu từ shop.json để lấy vật phẩm
        let shopData;
        try {
            shopData = JSON.parse(fs.readFileSync(shopPath, 'utf8'));
        } catch (error) {
            return message.reply('❌ Lỗi khi đọc dữ liệu shop.');
        }

        // Tìm vật phẩm trong shop.json
        const item = shopData.find(i => i.icon === itemIcon);
        if (!item) {
            return message.reply('❌ Vật phẩm không tồn tại trong cửa hàng.');
        }

        // Đọc dữ liệu từ bank.json để lấy thông tin người dùng
        let bankData;
        try {
            bankData = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
        } catch (error) {
            return message.reply('❌ Lỗi khi đọc dữ liệu người dùng từ bank.json.');
        }

        const userBank = bankData.accounts[user.id];
        if (!userBank || userBank.balance < item.price) {
            return message.reply('❌ Bạn không có đủ tiền trong ngân hàng để mua vật phẩm này.');
        }

        // Tạo hàng với các nút chọn
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Đồng ý')
                    .setStyle('Success'),
                new ButtonBuilder()
                    .setCustomId('deny')
                    .setLabel('Từ chối')
                    .setStyle('Danger')
            );

        // Gửi câu hỏi cho người tặng
        const questionEmbed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('🎁 Tặng quà cho @' + partner.username)
            .setDescription(`Bạn có muốn mua vật phẩm **${item.name}** với giá **${item.price}💵** để tặng cho **@${partner.username}** không?`);

        const questionMessage = await message.reply({
            embeds: [questionEmbed],
            components: [row],
        });

        // Xử lý phản hồi từ người tặng
        const filter = interaction => interaction.user.id === user.id && (interaction.customId === 'accept' || interaction.customId === 'deny');
        const collector = questionMessage.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'accept') {
                // Trừ tiền trong ngân hàng người tặng
                userBank.balance -= item.price;

                // Cập nhật dữ liệu ngân hàng
                try {
                    fs.writeFileSync(bankPath, JSON.stringify(bankData, null, 2), 'utf8');
                } catch (error) {
                    return message.reply('❌ Lỗi khi lưu dữ liệu ngân hàng.');
                }

                // Kiểm tra xem người nhận có phải là partner trong mối quan hệ không
                let relationship = null;
                try {
                    relationship = JSON.parse(fs.readFileSync(dataPath, 'utf8')).relationships?.[user.id];
                } catch (error) {
                    return message.reply('❌ Lỗi khi đọc dữ liệu mối quan hệ.');
                }

                // Nếu người nhận là partner trong mối quan hệ, tăng điểm thân mật
                if (relationship && relationship.partner === partner.id) {
                    relationship.affection += item.affinity;

                    // Lưu lại mối quan hệ
                    try {
                        fs.writeFileSync(dataPath, JSON.stringify({ relationships: { ...JSON.parse(fs.readFileSync(dataPath, 'utf8')).relationships, [user.id]: relationship } }, null, 2), 'utf8');
                    } catch (error) {
                        return message.reply('❌ Lỗi khi lưu dữ liệu mối quan hệ.');
                    }
                }

                // Xác nhận tặng quà thành công
                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Tặng quà thành công!')
                    .setDescription(`Bạn đã tặng quà **${item.name}** cho **@${partner.username}**.${relationship && relationship.partner === partner.id ? `\nĐiểm thân mật tăng lên **${relationship.affection} ❤️**` : ''}`)
                    .setThumbnail(partner.displayAvatarURL({ dynamic: true }));

                await interaction.update({
                    content: '✅ Quà đã được tặng!',
                    embeds: [successEmbed],
                    components: [],
                });
            } else if (interaction.customId === 'deny') {
                // Từ chối tặng quà
                const denyEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Bạn đã từ chối tặng quà')
                    .setDescription(`Ồ! Tiếc quá anh ta không yêu bạn rồi **@${partner.username}**.`);

                await interaction.update({
                    content: '❌ Bạn đã từ chối tặng quà.',
                    embeds: [denyEmbed],
                    components: [],
                });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                questionMessage.edit({
                    content: 'Thông báo nè.',
                    components: [],
                });
            }
        });
    },
};
