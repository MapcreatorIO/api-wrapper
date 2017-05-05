import CrudBase from './base/CrudBase';

export default class Notification extends CrudBase {
  get resourceName() {
    return 'notifications';
  }
}
