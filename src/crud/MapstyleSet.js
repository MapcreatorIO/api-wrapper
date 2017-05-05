import CrudBaCrudSetBasese from './base/CrudSetBase';
import Mapstyle from './Mapstyle';

export default class MapstyleSet extends CrudSetBase {
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
