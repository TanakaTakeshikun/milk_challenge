const chalk = require('chalk');
const { Logger } = require('../libs');
const logQueue = ['接続しました。'];


const logger = new Logger({
    levels: ['info', 'warn', 'error', 'debug'],
    writeLog(data) {
        let { lines, level: _level, time, location } = data;
        const errors = lines.filter(line => line instanceof Error);
        if (errors.length > 0) {
            const lineStr = errors
                .map(error => error.message + '\n' + error.stack)
                .join('\n');
            lines = [ '\n' + lineStr ];
        }
        let level = `[${_level}]`;
        logQueue.push(`[${time}][${location.join('][')}] ${level} ${lines}`);
        switch (_level) {
            case 'INFO':
                break;
            case 'WARN':
                level = chalk.magenta(level);
                break;
            case 'ERROR':
                level = chalk.red(level);
                break;
            case 'DEBUG':
                level = chalk.yellow(level);
                break;
        }
        console.log(`[${time}][${location.join('][')}] ${level} ${lines}`);
    }
});

module.exports = logger;