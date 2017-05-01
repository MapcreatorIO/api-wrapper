import CrudBase from './base/CrudBase';

export default class Svg extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'svgs';
    this.path = '/' + this.resourceName + '/{id}';
  }
}
