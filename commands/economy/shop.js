const { EmbedBuilder } = require('discord.js');
const { loadData } = require('../../utils/dataUtils');
const shopPath = './shop.json';

module.exports = {
    name: 'shop',
    description: 'Xem cửa hàng vật phẩm',
    execute(message) {
        let shop = loadData(shopPath); // Load dữ liệu từ shop.json

        if (!Array.isArray(shop) || shop.length === 0) {
            return message.channel.send("🛒 Cửa hàng hiện đang trống!");
        }

        let shopList = shop.map(item => 
            `${item.icon || '🛍️'} **${item.name}** - \`${item.price.toLocaleString()}💵\` (+${item.affinity}❤️)`
        ).join('\n');

        const shopEmbed = new EmbedBuilder()
            .setTitle('🛒 Cửa Hàng Vật Phẩm')
            .setDescription(shopList)
            .setColor(0xffc107) // Màu vàng
            .setThumbnail('https://i.imgur.com/YOUR_SHOP_ICON.png') // Thay link ảnh shop nếu cần
            .setFooter({ text: 'Dùng !mua <tên vật phẩm> để mua' });

        message.channel.send({ embeds: [shopEmbed] });
    }
};
