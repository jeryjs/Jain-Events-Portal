const NodeCache = require('node-cache');

// TTL in seconds
const TTL = {
    EVENTS: 300, // 5 mins
    MATCHES: 60, // 1 min
    USER_DATA: 1800, // 30 mins
}

const cache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120,
});

module.exports = {
    TTL,
    cache,
};