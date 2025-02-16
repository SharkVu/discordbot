const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'huongdan',
    description: '📜 Liệt kê danh sách lệnh và chức năng',
    execute(message) {
        const commands = [
            { name: '!bank', desc: '💰 Xem số dư ngân hàng' },
            { name: '!dangkybank', desc: '🏦 Đăng ký tài khoản ngân hàng' },
            { name: '!pay @user <số tiền>', desc: '💸 Chuyển tiền cho người khác' },
            { name: '!shop', desc: '🛒 Mở cửa hàng mua sắm' },
            { name: '!mua <item>', desc: '🛍️ Mua vật phẩm từ cửa hàng' },
            { name: '!ban <item>', desc: '💵 Bán vật phẩm để lấy tiền' },
            { name: '!daocoin', desc: '⛏️ Đào tiền mỗi 30 phút' },
            { name: '!tradecoin @user <số lượng>', desc: '🔄 Trao đổi 🎟️ với người khác' },
            { name: '!diemdanh', desc: '📅 Nhận thưởng hàng ngày' },
            { name: '!nhiemvu', desc: '🎯 Nhận thưởng nhiệm vụ' },
            { name: '!top', desc: '🏆 Xem bảng xếp hạng người giàu nhất' },
            { name: '!timhieu @user', desc: '❤️ Bắt đầu một mối quan hệ' },
            { name: '!kyniem', desc: '💞 Xem thông tin mối quan hệ' },
            { name: '!chiatay @user', desc: '💔 Chia tay người yêu' },
            { name: '!thongtin @user', desc: '🔍 Xem thông tin người dùng' },
            { name: '!themtien @user <số tiền>', desc: '💳 Thêm tiền (Admin)' }
        ];
        
        const itemsPerPage = 5;
        const totalPages = Math.ceil(commands.length / itemsPerPage);
        let currentPage = 1;
        
        function generateEmbed(page) {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageCommands = commands.slice(start, end);
            
            return new EmbedBuilder()
                .setTitle('📜 Danh sách lệnh')
                .setDescription(pageCommands.map(cmd => `**${cmd.name}** - ${cmd.desc}`).join('\n'))
                .setColor(0x00FF00)
                .setFooter({ text: `Trang ${page}/${totalPages}` });
        }

        function generateRow(page) {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_page')
                        .setLabel('⬅ Trước')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 1),
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('Tiếp ➡')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages)
                );
        }
        
        message.channel.send({ embeds: [generateEmbed(currentPage)], components: [generateRow(currentPage)] }).then(sentMessage => {
            const collector = sentMessage.createMessageComponentCollector({ time: 120000 });

            collector.on('collect', interaction => {
                if (interaction.user.id !== message.author.id) return interaction.reply({ content: "⛔ Bạn không thể điều khiển hướng dẫn của người khác!", ephemeral: true });

                if (interaction.customId === 'prev_page' && currentPage > 1) {
                    currentPage--;
                } else if (interaction.customId === 'next_page' && currentPage < totalPages) {
                    currentPage++;
                }

                interaction.update({ embeds: [generateEmbed(currentPage)], components: [generateRow(currentPage)] });
            });
        });
    }
};
