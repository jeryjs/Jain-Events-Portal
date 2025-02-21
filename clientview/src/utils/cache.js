const CACHE_CONFIG = {
  events: { ttl: 10 * 60 * 1000 }, // 10 minutes
  matches: { ttl: 20 * 60 * 1000 },  // 20 minutes
  userdata: { ttl: 30 * 60 * 1000 },  // 30 minutes
};

export const cacheManager = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, timestamp, retryCount = 0 } = JSON.parse(item);
      const ttl = CACHE_CONFIG[key]?.ttl;

      // Don't use cache if retry count >= 3 or TTL expired
      if (retryCount >= 3 || (ttl && Date.now() - timestamp > ttl)) {
        localStorage.removeItem(key);
        return null;
      }

      return value;
    } catch {
      return null;
    }
  },

  set: (key, value, retry = false) => {
    try {
      const existing = localStorage.getItem(key);
      const retryCount = retry && existing ? JSON.parse(existing).retryCount + 1 : 0;

      localStorage.setItem(key, JSON.stringify({
        value,
        timestamp: Date.now(),
        retryCount
      }));
    } catch {
      // Ignore storage errors
    }
  }
};
