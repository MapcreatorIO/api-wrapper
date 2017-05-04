import ResourceBase from './base/ResourceBase';

export default class Permission extends ResourceBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'permissions';
  }
}
