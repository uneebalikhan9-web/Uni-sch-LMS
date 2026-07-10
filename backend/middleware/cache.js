const NodeCache = require('node-cache');
// Cache instance: stdTTL = 5 mins, checkperiod = 60s
const myCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Use the original URL as the cache key
    const key = req.originalUrl || req.url;
    const cachedResponse = myCache.get(key);
    
    if (cachedResponse) {
      // Send the cached JSON response
      return res.json(cachedResponse);
    } else {
      // Override res.json to intercept the response before sending it
      const originalJson = res.json;
      res.json = function(body) {
        // Only cache if it's a successful response
        if (res.statusCode >= 200 && res.statusCode < 300) {
          myCache.set(key, body, duration);
        }
        originalJson.call(this, body);
      };
      next();
    }
  };
};

// Export cache instance to clear programmatically if needed
module.exports = { cacheMiddleware, myCache };
