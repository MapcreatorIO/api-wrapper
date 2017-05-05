import CrudBase from './base/CrudBase';
import Mapstyle from './Mapstyle';

export default class MapstyleSet extends CrudBase {
  get path() {
    return '/mapstyles/sets/{id}';
  }

  get resourceName() {
    return 'mapstyle-set';
  }

  get ownable() {
    return true;
  }

  get _Child() {
    return Mapstyle;
  }
}
