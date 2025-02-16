const fs = require('fs');
const path = require('path');

// Hàm tải dữ liệu từ file JSON
function loadData(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            // Nếu file không tồn tại, tạo mới file với dữ liệu mặc định
            fs.writeFileSync(filePath, JSON.stringify({}, null, 2), 'utf8');
            return {};
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Lỗi khi đọc file ${filePath}:`, error);
        return {}; // Trả về dữ liệu mặc định để bot không bị crash
    }
}

// Hàm ghi dữ liệu vào file JSON
function saveData(filePath, data) {
    try {
        const dir = path.dirname(filePath);
        // Kiểm tra xem thư mục chứa file có tồn tại không
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }); // Tạo thư mục nếu chưa có
        }
        // Ghi dữ liệu vào file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Lỗi khi ghi file ${filePath}:`, error);
    }
}

module.exports = { loadData, saveData };
