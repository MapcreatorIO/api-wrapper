import CrudBase from './base/CrudBase';
import Svg from './Svg';

export default class SvgSet extends CrudBase {
  /**
   * Get items associated with the set
   * @returns {Promise} - Resolves with {@link Svg} instance and rejects with {@link OAuthError}
   */
  items() {
    const url = this.url + '/items';

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(data.map(row => {
          return new Svg(this.api, row);
        })));
    });
  }

  get path() {
    return '/svgs/sets/{id}';
  }

  get resourceName() {
    return 'svg-sets';
  }

  get ownable() {
    return true;
  }
}
