import CrudBase from './base/CrudBase';

export default class Feature extends CrudBase {
  get resourceName() {
    return 'features';
  }

  get ownable() {
    return true;
  }
}
