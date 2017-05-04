import CrudBase from './base/CrudBase';

export default class Notification extends CrudBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'notifications';
  }
}
