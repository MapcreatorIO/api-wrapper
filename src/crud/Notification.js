import CrudBase from './base/CrudBase';

export default class Notification extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'notifications';
    this.path = '/' + this.resourceName + '/{id}';
  }
}
