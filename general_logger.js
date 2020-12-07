//code modified from https://thisdavej.com/using-winston-a-versatile-logging-library-for-node-js/
'use strict';
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const logDir = 'log';

var fileOut = new transports.DailyRotateFile({
    filename: `${logDir}/%DATE%-results.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '25m',
    format: format.json(),
    level: 'info'
});

fileOut.on('rotate', function(oldFilename, newFilename) {
    //sloppy but I don't anticipate needing overflow files
    newFilename = `${oldFilename}_overflow`
});

var logger = createLogger({
    format: format.combine(
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.json()
    ),
    transports: [
    new transports.Console({
        level: 'info',
        format: format.combine(
        format.colorize(),
        format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
        )
        )
    }),
    fileOut
    ]
});

module.exports = {logger} 

