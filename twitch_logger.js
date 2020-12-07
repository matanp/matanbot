//code modified from https://thisdavej.com/using-winston-a-versatile-logging-library-for-node-js/
'use strict';
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const logDir = 'twtich-chat-history';

const logger_levels = {
  levels: {
    message: 0,
    user: 1,
    misc: 2
  }
}

var messageOut = new transports.DailyRotateFile({
    filename: `${logDir}/chat/%DATE%-chat.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '25m',
    format: format.json(),
    level: 'message'
});

var usersOut = new transports.DailyRotateFile({
  filename: `${logDir}/users/%DATE%-users.log`,
  datePattern: 'YYYY-MM-DD',
  maxSize: '25m',
  format: format.json(),
  level: 'user'
});


messageOut.on('rotate', function(oldFilename, newFilename) {
    //sloppy but I don't anticipate needing overflow files
    newFilename = `${oldFilename}_overflow`
});

usersOut.on('rotate', function(oldFilename, newFilename) {
  //sloppy but I don't anticipate needing overflow files
  newFilename = `${oldFilename}_overflow`
});


const twitch_log = createLogger({
    format: format.combine(
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.json()
    ),
    transports: [
    new transports.Console({
        level: 'misc',
        format: format.combine(
        format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
        )
        )
    }),
    messageOut,
    usersOut
    ],
    levels: logger_levels.levels
});

module.exports = { twitch_log } 

