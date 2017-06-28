import CrudSetBase from './base/CrudSetBase';
import Mapstyle from './Mapstyle';
import {mix} from 'mixwith/src/mixwith';
import {OwnableResource} from '../traits/OwnableResource';

export default class MapstyleSet extends mix(CrudSetBase).with(OwnableResource) {
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
