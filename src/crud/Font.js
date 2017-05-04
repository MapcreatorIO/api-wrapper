import CrudBase from './base/CrudBase';

export default class Font extends CrudBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'fonts';
  }
}
