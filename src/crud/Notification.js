import CrudBase from './CrudBase';

export default class Notification extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/notifications/{id}';
  }
}
