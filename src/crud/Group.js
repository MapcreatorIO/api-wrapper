import CrudBase from './base/CrudBase';

export default class Group extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/groups/{id}';
  }
}
