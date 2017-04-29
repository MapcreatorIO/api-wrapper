import CrudBase from './base/CrudBase';

export default class DimensionSet extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/dimensions/sets/{id}';
  }
}
