import ResourceBase from './base/ResourceBase';

export default class Highlight extends ResourceBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'highlights';
  }
}
