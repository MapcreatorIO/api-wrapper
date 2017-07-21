import StaticClass from './StaticClass';

/**
 * UUID util class
 * @static
 * @private
 */
export default class Uuid extends StaticClass {
  /**
   * Generate a UUID4 string
   * @returns {string} - Uuid
   */
  static uuid4() {
    let d = new Date().getTime();

    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); // use high-precision timer if available
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (d + Math.random() * 16) % 16 | 0;

      d = Math.floor(d / 16);
      return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
  }

  /**
   * Empty uuid as per spec
   * @returns {string} - Uuid
   */
  static nil() {
    return '0000000-0000-0000-0000-000000000000';
  }
}
