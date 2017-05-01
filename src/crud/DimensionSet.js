import CrudBase from './base/CrudBase';
import Dimension from './Dimension';

export default class DimensionSet extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'dimension-sets';
    this.path = '/dimensions/sets/{id}';
  }

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

  get ownable() {
    return true;
  }
}
