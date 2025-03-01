import NodeCache from 'node-cache';

// TTL in seconds
const TTL = {
    EVENTS: 1800, // 30 mins
    ACTIVITIES: 600, // 10 min
    ARTICLES: 5400, // 90 mins
    USER_DATA: 3600, // 60 mins
};

const cache = new NodeCache({
    stdTTL: 120,
    checkperiod: 240,
});

export { cache, TTL };