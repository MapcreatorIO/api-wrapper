import ResourceBase from './base/ResourceBase';

export default class PlaceName extends ResourceBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'place-names';
  }
}
