import { cache, TTL } from "@config/cache";

/**
 * Generic interface for data models with ID
 */
interface Identifiable {
	id: string;
	toJSON?: () => any;
}

/**
 * Get single item with caching
 */
export async function getCachedItem<T extends Identifiable>({
	key,
	fetchFn,
	ttl,
}: {
	key: string;
	fetchFn: () => Promise<T | null>;
	ttl: number;
}): Promise<T | null> {
	const cachedItem = cache.get(key);

	if (cachedItem) {
		console.log(`📦 Serving cached item for ${key}`);
		return cachedItem as T;
	}

	console.log(`🔥 Database: Fetching item for ${key}`);
	const item = await fetchFn();

	if (item) {
		cache.set(key, item, ttl);
	}

	return item;
}

/**
 * Get collection of items with caching
 */
export async function getCachedCollection<T extends Identifiable>({
	key,
	fetchFn,
	ttl,
}: {
	key: string;
	fetchFn: () => Promise<T[]>;
	ttl: number;
}): Promise<T[]> {
	const cachedItems = cache.get(key);

	if (cachedItems) {
		console.log(`📦 Serving cached collection for ${key}`);
		return cachedItems as T[];
	}

	console.log(`🔥 Database: Fetching collection for ${key}`);
	const items = await fetchFn();

	cache.set(key, items, ttl);

	return items;
}

/**
 * Create item with cache update
 */
export async function createCachedItem<T extends Identifiable>({
	item,
	collectionKey,
	itemKeyPrefix,
	saveFn,
	ttl,
}: {
	item: T;
	collectionKey: string;
	itemKeyPrefix: string;
	saveFn: (item: T) => Promise<any>;
	ttl: number;
}): Promise<T> {
	console.log(`🔥 Database: Creating item with ID ${item.id}`);
	await saveFn(item);

	const itemKey = `${itemKeyPrefix}-${item.id}`;

	// Update individual item cache
	cache.set(itemKey, item, ttl);

	// Update collection cache if it exists
	const cachedCollection = cache.get(collectionKey) as T[] | undefined;
	if (cachedCollection) {
		cache.set(collectionKey, [item, ...cachedCollection], ttl);
	}

	return item;
}

/**
 * Update item with cache update
 */
export async function updateCachedItem<T extends Identifiable>({
	item,
	collectionKey,
	itemKeyPrefix,
	updateFn,
	ttl,
}: {
	item: T;
	collectionKey: string;
	itemKeyPrefix: string;
	updateFn: (item: T) => Promise<any>;
	ttl: number;
}): Promise<T> {
	console.log(`🔥 Database: Updating ${typeof item} item with ID ${item.id}`);
	await updateFn(item);

	const itemKey = `${itemKeyPrefix}-${item.id}`;

	// Update individual item cache
	cache.set(itemKey, item, ttl);

	// Update collection cache if it exists
	const cachedCollection = cache.get(collectionKey) as T[] | undefined;
	if (cachedCollection) {
		const updatedCollection = cachedCollection.map((cachedItem) => (cachedItem.id === item.id ? { ...cachedItem, ...item } : cachedItem));
		cache.set(collectionKey, updatedCollection, ttl);
	}

	return item;
}

/**
 * Delete item with cache update
 */
export async function deleteCachedItem<T extends Identifiable>({
	id,
	collectionKey,
	itemKeyPrefix,
	deleteFn,
	ttl,
}: {
	id: string;
	collectionKey: string;
	itemKeyPrefix: string;
	deleteFn: () => Promise<any>;
	ttl: number;
}): Promise<boolean> {
	console.log(`🔥 Database: Deleting item with ID ${id}`);
	await deleteFn();

	const itemKey = `${itemKeyPrefix}-${id}`;

	// Remove item from cache
	cache.del(itemKey);

	// Update collection cache if it exists
	const cachedCollection = cache.get(collectionKey) as T[] | undefined;
	if (cachedCollection) {
		const filteredCollection = cachedCollection.filter((item) => item.id !== id);
		cache.set(collectionKey, filteredCollection, ttl);
	}

	return true;
}
