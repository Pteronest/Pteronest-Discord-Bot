const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    formatMessage(level, message, data = null) {
        const timestamp = this.getTimestamp();
        let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (data) {
            logMessage += ` | Data: ${JSON.stringify(data)}`;
        }
        
        return logMessage;
    }

    writeToFile(level, message, data = null) {
        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logDir, `${date}.log`);
        const logMessage = this.formatMessage(level, message, data) + '\n';
        
        fs.appendFileSync(logFile, logMessage);
    }

    info(message, data = null) {
        const logMessage = this.formatMessage('info', message, data);
        console.log(`ℹ️  ${logMessage}`);
        this.writeToFile('info', message, data);
    }

    success(message, data = null) {
        const logMessage = this.formatMessage('success', message, data);
        console.log(`✅ ${logMessage}`);
        this.writeToFile('success', message, data);
    }

    warning(message, data = null) {
        const logMessage = this.formatMessage('warning', message, data);
        console.log(`⚠️  ${logMessage}`);
        this.writeToFile('warning', message, data);
    }

    error(message, data = null) {
        const logMessage = this.formatMessage('error', message, data);
        console.log(`❌ ${logMessage}`);
        this.writeToFile('error', message, data);
    }

    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            const logMessage = this.formatMessage('debug', message, data);
            console.log(`🐛 ${logMessage}`);
            this.writeToFile('debug', message, data);
        }
    }
}

module.exports = new Logger(); 