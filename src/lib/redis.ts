// Mock Redis implementation for development
console.warn('⚠️ Using mock Redis implementation for development')

// Use global storage to persist across module reloads
declare global {
  var __mockRedisStorage: Map<string, string> | undefined
}

// Use global storage or create a new one
const memoryStorage = global.__mockRedisStorage || new Map()
global.__mockRedisStorage = memoryStorage

// Debug function to print current storage
const debugStorage = () => {
  console.log('[Mock Redis] Current storage:', Array.from(memoryStorage.entries()))
}

const mockRedis = {
  get: async (key: string) => {
    const value = memoryStorage.get(key)
    console.log(`[Mock Redis] GET ${key} = ${value}`)
    debugStorage()
    return value
  },
  set: async (key: string, value: string, options?: { ex?: number }) => {
    console.log(`[Mock Redis] SET ${key} = ${value}`, options)
    memoryStorage.set(key, value)
    if (options?.ex) {
      // For testing purposes, disable TTL completely or make it very long
      console.log(`[Mock Redis] TTL disabled for testing purposes`)
      // Comment out the TTL for testing
      /*
      setTimeout(() => {
        memoryStorage.delete(key)
        console.log(`[Mock Redis] EXPIRED ${key}`)
      }, options.ex * 1000)
      */
    }
    debugStorage()
  },
  del: async (key: string) => {
    console.log(`[Mock Redis] DEL ${key}`)
    memoryStorage.delete(key)
    debugStorage()
  },
  incr: async (key: string) => {
    const current = parseInt(memoryStorage.get(key) || '0')
    const newValue = current + 1
    memoryStorage.set(key, newValue.toString())
    console.log(`[Mock Redis] INCR ${key} = ${newValue}`)
    debugStorage()
    return newValue
  },
  expire: async (key: string, seconds: number) => {
    console.log(`[Mock Redis] EXPIRE ${key} ${seconds}s`)
    // Disable expire for testing
    console.log(`[Mock Redis] EXPIRE disabled for testing`)
    return 1
  },
  ttl: async (key: string) => {
    const hasKey = memoryStorage.has(key)
    console.log(`[Mock Redis] TTL ${key} = ${hasKey ? 3600 : -1}`)
    return hasKey ? 3600 : -1 // Return 1 hour for existing keys
  }
}

export default mockRedis