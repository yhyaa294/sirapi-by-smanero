package cache

import (
	"time"

	"github.com/patrickmn/go-cache"
)

// CacheService wraps go-cache
type CacheService struct {
	store *cache.Cache
}

var GlobalCache *CacheService

// Init initializes the global cache
func Init() {
	// Create a cache with a default expiration time of 5 minutes, and which
	// purges expired items every 10 minutes
	GlobalCache = &CacheService{
		store: cache.New(5*time.Minute, 10*time.Minute),
	}
}

// Set adds a generic item to the cache
func (c *CacheService) Set(key string, value any, duration time.Duration) {
	c.store.Set(key, value, duration)
}

// Get retrieving an item from the cache
func (c *CacheService) Get(key string) (any, bool) {
	return c.store.Get(key)
}

// Delete removes an item from the cache
func (c *CacheService) Delete(key string) {
	c.store.Delete(key)
}

// Helper for caching function results
// T is the return type
func GetOrSet[T any](key string, duration time.Duration, fetch func() (T, error)) (T, error) {
	if val, found := GlobalCache.store.Get(key); found {
		return val.(T), nil
	}

	result, err := fetch()
	if err != nil {
		return result, err
	}

	GlobalCache.store.Set(key, result, duration)
	return result, nil
}
