import HandlesImages from '../traits/HandlesImages';
import OwnableResource from '../traits/OwnableResource';
import {mix} from '../utils/reflection';
import CrudSetBase from './base/CrudSetBase';
import Mapstyle from './Mapstyle';

/**
 * Mapstyle set
 * @extends {CrudSetBase}
 * @extends {OwnableResource}
 * @extends {HandlesImages}
 */
export default class MapstyleSet extends mix(CrudSetBase, OwnableResource, HandlesImages) {
  get resourcePath() {
    return '/mapstyles/sets/{id}';
  }

  get resourceName() {
    return 'mapstyle-set';
  }

  get _Child() {
    return Mapstyle;
  }
}
