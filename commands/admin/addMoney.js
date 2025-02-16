const { loadData, saveData } = require('../../utils/dataUtils');
const { PermissionsBitField } = require('discord.js');
const bankPath = './bank.json';

module.exports = {
    name: 'themtien',
    description: 'Thêm hoặc trừ tiền cho user',
    execute: (message, args) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return message.reply('🚫 Bạn không có quyền dùng lệnh này!');

        const user = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!user || isNaN(amount)) 
            return message.reply('⚠ Cách dùng: `!themtien @user <số tiền>`');

        if (amount === 0) 
            return message.reply('⚠ Số tiền phải khác 0!');

        let bank = loadData(bankPath);

        // Kiểm tra nếu không có tài khoản người dùng thì tạo mới
        if (!bank.accounts) bank.accounts = {};
        if (!bank.accounts[user.id]) {
            bank.accounts[user.id] = { money: 0, tickets: 0, items: [] };
        }

        // Cập nhật số tiền
        bank.accounts[user.id].money += amount;

        console.log(`[DEBUG] Số tiền sau cập nhật:`, bank.accounts[user.id].money);

        // Lưu lại vào bank.json
        saveData(bankPath, bank);

        // Kiểm tra lại file sau khi lưu
        const savedData = loadData(bankPath);
        console.log(`[DEBUG] Kiểm tra lại dữ liệu từ file:`, savedData.accounts[user.id]);

        message.channel.send(`✅ Đã ${amount > 0 ? 'cộng' : 'trừ'} **${Math.abs(amount).toLocaleString()}💵** cho **${user.username}**!`);
    }
};
