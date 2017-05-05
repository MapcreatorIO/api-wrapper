import StaticClass from './StaticClass';

/**
 * UUID util class
 * @static
 * @protected
 */
export default class Uuid extends StaticClass {
  /**
   * Generate a UUID4 string
   * @returns {string} - Uuid
   */
  static uuid4() {
    // Use the secure method if possible
    return typeof crypto !== 'undefined' ? Uuid._uuid4Safe() : Uuid._uuid4Unsafe();
  }

  /**
   * Unsafe UUID4 generation using Math.random
   * @returns {string} - Uuid
   *
   * @see http://stackoverflow.com/a/8809472
   * @license MIT|Public Domain
   * @private
   */
  static _uuid4Unsafe() {
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
   * Safe UUID4 generation using the crypto api
   * @returns {String} - Uuid
   * @private
   */
  static _uuid4Safe() {
    let data = new Uint8Array(16);

    crypto.getRandomValues(data);

    // cast to array so we can use pop()
    data = [].slice.call(data);

    // Replace 'xx' with a two width base 16 number
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/xx/g, () => {
      // Prepend 00 for padding and grab the last two characters
      return ('00' + data.pop().toString(16)).slice(-2);
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
