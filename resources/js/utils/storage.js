/**
 * SafeWatch LocalStorage Helper Utility
 * Safe, fault-tolerant getter/setter for client-side persistence and offline caching.
 */

export const getStorageItem = (key, fallback = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.warn(`[SafeWatch Storage] Error reading key "${key}":`, e);
        return fallback;
    }
};

export const setStorageItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`[SafeWatch Storage] Error saving key "${key}":`, e);
    }
};

export const removeStorageItem = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.warn(`[SafeWatch Storage] Error removing key "${key}":`, e);
    }
};

export const clearSafeWatchStorage = () => {
    try {
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith('safewatch_')) {
                localStorage.removeItem(k);
            }
        });
    } catch (e) {
        console.warn('[SafeWatch Storage] Error clearing storage:', e);
    }
};
