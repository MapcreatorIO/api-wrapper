import CrudBase from './base/CrudBase';
import UnsupportedCrudError from '../exceptions/UnsupportedCrudError';

export default class SvgSetType extends CrudBase {
  /**
   * Disabled because svg set type does not support soft deletes
   * @returns {void}
   * @throws Error
   * @private
   */
  restore() {
    throw new UnsupportedCrudError('Svg set types don\'t support soft deletes');
  }

  get resourcePath() {
    return '/svgs/sets/types/{id}';
  }

  get resourceName() {
    return 'svg-set-types';
  }
}
