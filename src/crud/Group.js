import CrudBase from './base/CrudBase';
import User from './User';
import Permission from './Permission';

export default class Group extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'groups';
    this.path = '/' + this.resourceName + '/{id}';
  }

  users() {
    return this._listResource(User);
  }

  permissions() {
    return this._listResource(Permission);
  }
}
