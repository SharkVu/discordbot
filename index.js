const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk').default;
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

client.commands = new Collection();
const prefix = config.prefix || '!';

// Biến lưu trữ tin nhắn của bot đã được gửi theo từng kênh và thời gian
let messageHistory = new Map(); // Map chứa kênh và tin nhắn theo thời gian

// Biến lưu trữ các thông điệp đã ghi log
let loggedCommands = new Set();

const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));

for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, 'commands', folder);
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const command = require(path.join(folderPath, file));
            if (command.name && typeof command.execute === 'function') {
                client.commands.set(command.name, command);
                console.log(chalk.blue(`✅ Đã tải lệnh: ${command.name}`));
            } else {
                console.warn(chalk.yellow(`⚠ Lệnh ${file} trong ${folder} không hợp lệ.`));
            }
        } catch (error) {
            console.error(chalk.red(`❌ Lỗi khi tải lệnh ${file}:`), error);
        }
    }
}

// 📜 **Hàm ghi log vào logs.txt và hiển thị trên CMD**
function logCommand(userId, commandName, username) {
    const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const logMessage = `[${time}] User: ${username} (${userId}) - Lệnh: ${commandName}\n`;

    // Kiểm tra nếu đã ghi log cho lệnh này
    if (!loggedCommands.has(logMessage)) {
        fs.appendFile('logs.txt', logMessage, (err) => {
            if (err) console.error(`❌ Lỗi khi ghi log:`, err);
        });

        loggedCommands.add(logMessage);  // Thêm vào Set để tránh ghi lại lần nữa

        console.log(chalk.green(`[📜 LOG] ${time}`) + 
                    chalk.blue(` | User: ${username} (${userId})`) + 
                    chalk.yellow(` | Lệnh: ${commandName}`));
    }
}

// 📜 **Ghi log danh sách máy chủ bot tham gia**
function logGuilds() {
    const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const guildList = client.guilds.cache.map(guild => {
        const inviteLink = `https://discord.gg/${guild.id}`;
        return `${guild.name} (ID: ${guild.id}) - Link mời: ${inviteLink}`;
    }).join('\n');

    const logMessage = `[${time}] Máy chủ bot tham gia:\n${guildList}\n`;

    // Kiểm tra nếu đã ghi log danh sách máy chủ
    if (!loggedCommands.has(logMessage)) {
        fs.appendFile('logs.txt', logMessage, (err) => {
            if (err) console.error(`❌ Lỗi khi ghi log danh sách máy chủ:`, err);
        });

        loggedCommands.add(logMessage);  // Thêm vào Set để tránh ghi lại lần nữa

        console.log(chalk.green(`[📜 LOG] ${time}`) + 
                    chalk.yellow(` | Máy chủ bot tham gia:\n${guildList}`));

        console.log(`Danh sách các server mà bot tham gia: \n${guildList}`);
    }
}

// 📜 **Ghi log tin nhắn người dùng tại máy chủ**
function logUserMessage(message) {
    const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const logMessage = `[${time}] Máy chủ: ${message.guild.name} (ID: ${message.guild.id}) - Kênh: ${message.channel.name} (ID: ${message.channel.id}) - User: ${message.author.username} (${message.author.id}) - Tin nhắn: ${message.content}\n`;

    // Ghi log tin nhắn người dùng vào file log
    fs.appendFile('userMessages.txt', logMessage, (err) => {
        if (err) console.error(`❌ Lỗi khi ghi log tin nhắn người dùng:`, err);
    });

    console.log(chalk.green(`[📜 LOG] ${time}`) + 
                chalk.blue(` | Máy chủ: ${message.guild.name}`) + 
                chalk.yellow(` | Kênh: ${message.channel.name}`) +
                chalk.blue(` | User: ${message.author.username} (${message.author.id})`) + 
                chalk.yellow(` | Tin nhắn: ${message.content}`));
}

// ✅ **Bot sẵn sàng**
client.once('ready', () => {
    console.log(chalk.green(`✅ Bot đã hoạt động với tên: ${client.user.tag}`));

    // Ghi log danh sách các máy chủ bot tham gia
    logGuilds();
});

// 📨 **Lắng nghe tin nhắn**
client.on('messageCreate', async (message) => {
    // Ghi log tin nhắn người dùng
    if (!message.author.bot) {
        logUserMessage(message);
    }

    if (message.author.bot) {
        const currentTime = Date.now(); // Lấy thời gian hiện tại
        const channelId = message.channel.id; // Lấy ID kênh

        // Kiểm tra nếu kênh chưa có trong messageHistory
        if (!messageHistory.has(channelId)) {
            messageHistory.set(channelId, []);
        }

        const channelMessages = messageHistory.get(channelId); // Lấy danh sách tin nhắn của kênh

        const lastMessage = channelMessages.find(msg => msg.content === message.content);

        if (lastMessage) {
            const timeDifference = currentTime - lastMessage.timestamp;

            // Nếu tin nhắn trùng lặp và cách nhau dưới 1 giây, xóa tin nhắn
            if (timeDifference < 1000) {
                try {
                    await message.delete(); // Thêm try-catch để xử lý lỗi khi xóa
                    console.log(chalk.yellow(`⚠ Đã xóa tin nhắn trùng lặp của bot trong kênh ${message.channel.name}: ${message.content}`));
                } catch (error) {
                    console.error(chalk.red(`❌ Lỗi khi xóa tin nhắn trùng lặp: ${error.message}`));
                }
                return;
            }
        }

        // Lưu tin nhắn của bot vào mảng với thời gian gửi
        channelMessages.push({ content: message.content, timestamp: currentTime });
        // Giới hạn số lượng tin nhắn lưu trữ để tránh quá tải
        if (channelMessages.length > 100) {
            channelMessages.shift(); // Xóa tin nhắn cũ nếu vượt quá 100 tin nhắn
        }
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) {
        return message.reply("⚠ Lệnh không hợp lệ!");
    }

    try {
        logCommand(message.author.id, commandName, message.author.username);

        command.execute(message, args, client);

    } catch (error) {
        console.error(chalk.red(`❌ Lỗi khi chạy lệnh ${commandName}:`), error);
        message.reply("⚠ Đã xảy ra lỗi khi thực thi lệnh này.");
    }
});

// 🔑 **Đăng nhập bot**
client.login(config.token);
