/**
 * storage.js — small localStorage helpers.
 */

/**
 * @param {string} key
 * @param {unknown} fallback
 * @returns {unknown}
 */
export function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("[storage] Could not read", key, error);
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean}
 */
export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("[storage] Could not write", key, error);
    return false;
  }
}
