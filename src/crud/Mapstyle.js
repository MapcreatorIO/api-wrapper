import CrudBase from './base/CrudBase';
import HandlesImages from '../traits/HandlesImages';
import {mix} from '../utils/reflection';

export default class Mapstyle extends mix(CrudBase, HandlesImages) {
  get resourceName() {
    return 'mapstyles';
  }
}
