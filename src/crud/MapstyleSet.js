import CrudSetBase from './base/CrudSetBase';
import Mapstyle from './Mapstyle';
import OwnableResource from '../traits/OwnableResource';
import {mix} from '../utils/reflection';


/**
 * Mapstyle set
 * @extends {CrudSetBase}
 * @extends {OwnableResource}
 */
export default class MapstyleSet extends mix(CrudSetBase, OwnableResource) {
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
