"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedItem = getCachedItem;
exports.getCachedCollection = getCachedCollection;
exports.createCachedItem = createCachedItem;
exports.updateCachedItem = updateCachedItem;
exports.deleteCachedItem = deleteCachedItem;
const cache_1 = require("@config/cache");
/**
 * Get single item with caching
 */
function getCachedItem(_a) {
    return __awaiter(this, arguments, void 0, function* ({ key, fetchFn, ttl, }) {
        const cachedItem = cache_1.cache.get(key);
        if (cachedItem) {
            console.log(`📦 Serving cached item for ${key}`);
            return cachedItem;
        }
        console.log(`🔥 Database: Fetching item for ${key}`);
        const item = yield fetchFn();
        if (item) {
            cache_1.cache.set(key, item, ttl);
        }
        return item;
    });
}
/**
 * Get collection of items with caching
 */
function getCachedCollection(_a) {
    return __awaiter(this, arguments, void 0, function* ({ key, fetchFn, ttl, }) {
        const cachedItems = cache_1.cache.get(key);
        if (cachedItems) {
            console.log(`📦 Serving cached collection for ${key}`);
            return cachedItems;
        }
        console.log(`🔥 Database: Fetching collection for ${key}`);
        const items = yield fetchFn();
        cache_1.cache.set(key, items, ttl);
        return items;
    });
}
/**
 * Create item with cache update
 */
function createCachedItem(_a) {
    return __awaiter(this, arguments, void 0, function* ({ item, collectionKey, itemKeyPrefix, saveFn, ttl, }) {
        console.log(`🔥 Database: Creating item with ID ${item.id}`);
        yield saveFn(item);
        const itemKey = `${itemKeyPrefix}-${item.id}`;
        // Update individual item cache
        cache_1.cache.set(itemKey, item, ttl);
        // Update collection cache if it exists
        const cachedCollection = cache_1.cache.get(collectionKey);
        if (cachedCollection) {
            cache_1.cache.set(collectionKey, [item, ...cachedCollection], ttl);
        }
        return item;
    });
}
/**
 * Update item with cache update
 */
function updateCachedItem(_a) {
    return __awaiter(this, arguments, void 0, function* ({ item, collectionKey, itemKeyPrefix, updateFn, ttl, }) {
        console.log(`🔥 Database: Updating ${typeof item} item with ID ${item.id}`);
        yield updateFn(item);
        const itemKey = `${itemKeyPrefix}-${item.id}`;
        // Update individual item cache
        cache_1.cache.set(itemKey, item, ttl);
        // Update collection cache if it exists
        const cachedCollection = cache_1.cache.get(collectionKey);
        if (cachedCollection) {
            const updatedCollection = cachedCollection.map((cachedItem) => (cachedItem.id === item.id ? Object.assign(Object.assign({}, cachedItem), item) : cachedItem));
            cache_1.cache.set(collectionKey, updatedCollection, ttl);
        }
        return item;
    });
}
/**
 * Delete item with cache update
 */
function deleteCachedItem(_a) {
    return __awaiter(this, arguments, void 0, function* ({ id, collectionKey, itemKeyPrefix, deleteFn, ttl, }) {
        console.log(`🔥 Database: Deleting item with ID ${id}`);
        yield deleteFn();
        const itemKey = `${itemKeyPrefix}-${id}`;
        // Remove item from cache
        cache_1.cache.del(itemKey);
        // Update collection cache if it exists
        const cachedCollection = cache_1.cache.get(collectionKey);
        if (cachedCollection) {
            const filteredCollection = cachedCollection.filter((item) => item.id !== id);
            cache_1.cache.set(collectionKey, filteredCollection, ttl);
        }
        return true;
    });
}
