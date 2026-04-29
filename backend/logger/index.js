// const winston = require("winston") 
const {createLogger, format, transports} = require('winston')
const {combine, timestamp, printf, colorize} = format

const REQUEST_WINDOW_MS = 5000


const myFormat = printf(({level, message, timestamp})=>{
    return `${timestamp} [${level}] [${message}]`
})

const appendRequestCount = (requestTimestamps) => format((info) => {
    pruneOldRequests(requestTimestamps)
    info.message = `${info.message} | Requests in last 5s: ${requestTimestamps.length}`

    return info
})

const pruneOldRequests = (requestTimestamps) => {
    const cutoff = Date.now() - REQUEST_WINDOW_MS

    while (requestTimestamps.length > 0 && requestTimestamps[0] <= cutoff) {
        requestTimestamps.shift()
    }
}

const log_func = () => {
    const requestTimestamps = []
    const logger = createLogger({
        level: "debug",
        format: combine(
            appendRequestCount(requestTimestamps)(),
            colorize(),
            timestamp({format:"HH:mm:ss"}),
            myFormat,
        ),
        transports: [new transports.Console(),
                    new transports.File({ filename: 'logs/log_file.txt' }) 

        ],
    })

    logger.trackRequests = () => (req, res, next) => {
        requestTimestamps.push(Date.now())
        pruneOldRequests(requestTimestamps)
        next()
    }

    return logger
}

module.exports = log_func
