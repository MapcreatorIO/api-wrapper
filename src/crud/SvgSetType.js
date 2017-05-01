import CrudBase from './base/CrudBase';

export default class SvgSetType extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'svg-set-types';
    this.path = '/svgs/sets/types/{id}';
  }

  restore() {
    throw new Error('Svg set types don\'t support soft deletes');
  }
}
