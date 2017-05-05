import CrudBase from './base/CrudBase';

export default class Feature extends CrudBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'features';
  }

  get ownable() {
    return true;
  }
}
