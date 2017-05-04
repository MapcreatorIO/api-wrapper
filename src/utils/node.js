/**
 * Test if the application is running under nodejs
 * @returns {boolean} - Is the application running under node?
 * @see https://nodejs.org
 * @private
 */
export function isNode() {
  // eslint-disable-next-line no-undef
  return typeof window === 'undefined' && typeof module !== 'undefined' && module.exports;
}
