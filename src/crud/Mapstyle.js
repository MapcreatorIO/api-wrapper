import CrudBase from './base/CrudBase';
import HandlesImages from '../traits/HandlesImages';
import {mix} from '../utils/reflection';

/**
 * @extends {CrudBase}
 * @extends {HandlesImages}
 */
export default class Mapstyle extends mix(CrudBase, HandlesImages) {
  get resourceName() {
    return 'mapstyles';
  }
}
