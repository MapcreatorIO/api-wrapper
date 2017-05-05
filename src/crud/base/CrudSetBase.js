import CrudBase from './CrudBase';

/**
 * Crud base for resource sets
 * @abstract
 */
export default class CrudSetBase extends CrudBase {

  /**
   * Get items associated with the set
   * @returns {Promise} - Resolves with {@link Dimension} instance and rejects with {@link OAuthError}
   */
  items() {
    const url = `${this.url}/items`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(data.map(row => {
          return new this._Child(this.api, row);
        })));
    });
  }

  /**
   * Child constructor
   * @returns {ResourceBase} - Child constructor
   * @constructor
   * @abstract
   * @protected
   */
  get _Child() {
    throw new AbstractError();
  }
}
