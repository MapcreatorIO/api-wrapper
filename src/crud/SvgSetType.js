import CrudBase from './base/CrudBase';

export default class SvgSetType extends CrudBase {
  /**
   * Disabled because svg set type does not support soft deletes
   * @returns {void}
   * @throws Error
   * @private
   */
  restore() {
    throw new Error('Svg set types don\'t support soft deletes');
  }

  get path() {
    return '/svgs/sets/types/{id}';
  }

  get resourceName() {
    return 'svg-set-types';
  }
}
