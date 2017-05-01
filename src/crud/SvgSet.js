import CrudBase from './base/CrudBase';
import Mapstyle from './Mapstyle';

export default class SvgSet extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'svg-sets';
    this.path = '/svgs/sets/{id}';
  }

  items() {
    const url = this.url + '/items';

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(data.map(row => {
          return new Mapstyle(this.api, row);
        })));
    });
  }

  get ownable() {
    return true;
  }
}
