import ResourceBase from './base/ResourceBase';

export default class Permission extends ResourceBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/permissions/{id}';
  }
}
