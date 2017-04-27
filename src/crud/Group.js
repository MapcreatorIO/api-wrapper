import CrudBase from './CrudBase';

export default class Group extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/groups/{id}';
  }
}
