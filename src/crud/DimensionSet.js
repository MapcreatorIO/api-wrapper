import CrudBase from './base/CrudBase';
import Dimension from './Dimension';

/**
 * Dimension sets
 */
export default class DimensionSet extends CrudBase {
  /**
   * Get items associated with the set
   * @returns {Promise} - Resolves with {@link Dimension} instance and rejects with {@link OAuthError}
   */
  items() {
    const url = this.url + '/items';

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(data.map(row => {
          return new Dimension(this.api, row);
        })));
    });
  }

  get path() {
    return '/dimensions/sets/{id}';
  }

  get resourceName() {
    return 'dimension-sets';
  }

  get ownable() {
    return true;
  }
}