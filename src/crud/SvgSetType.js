import CrudBase from './base/CrudBase';

export default class SvgSetType extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'svg-set-types';
    this.path = '/svgs/sets/types/{id}';
  }
}
