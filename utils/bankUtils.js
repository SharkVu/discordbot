const fs = require('fs');
const path = require('path');
const bankFile = path.join(__dirname, '../bank.json');

function readBankData() {
    try {
        if (!fs.existsSync(bankFile)) {
            fs.writeFileSync(bankFile, JSON.stringify({}, null, 2), 'utf8');
            return {};
        }
        return JSON.parse(fs.readFileSync(bankFile, 'utf8'));
    } catch (error) {
        console.error('Lỗi khi đọc bank.json:', error);
        return {}; // Trả về dữ liệu mặc định để tránh lỗi
    }
}

function writeBankData(data) {
    try {
        fs.writeFileSync(bankFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Lỗi khi ghi bank.json:', error);
    }
}

module.exports = { readBankData, writeBankData };
