import CrudBase from './base/CrudBase';
import Mapstyle from './Mapstyle';

export default class MapstyleSet extends CrudBase {
  /**
   * Get items associated with the set
   * @returns {Promise} - Resolves with {@link Mapstyle} instance and rejects with {@link OAuthError}
   */
  items() {
    const url = `${this.url}/items`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(data.map(row => {
          return new Mapstyle(this.api, row);
        })));
    });
  }

  get path() {
    return '/mapstyles/sets/{id}';
  }

  get resourceName() {
    return 'mapstyle-set';
  }

  get ownable() {
    return true;
  }
}
