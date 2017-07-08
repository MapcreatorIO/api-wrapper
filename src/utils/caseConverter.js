/**
 * Converts snake_case strings to camelCase
 * @param {String} str - a snake_case string
 * @returns {String} - Converted camelCase string
 * @private
 */
export function snakeToCamelCase(str) {
  return str.replace(/(?:(_[a-z\d]))/g, x => x[1].toUpperCase());
}

/**
 * Converts camelCase strings to snake_case
 * @param {String} str - a camelCase string
 * @returns {String} - Converted snake_case string
 * @private
 */
export function camelToSnakeCase(str) {
  return str.replace(/([A-Z])/g, x => '_' + x.toLowerCase());
}

export function pascalToCamelCase(str) {
  return str.replace(/^([A-Z])/g, x => x.toLowerCase());
}
