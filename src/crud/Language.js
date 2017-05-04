import CrudBase from './base/CrudBase';

export default class Language extends CrudBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'languages';
  }
}
