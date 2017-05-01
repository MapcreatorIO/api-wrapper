import ResourceBase from './base/ResourceBase';

export default class PlaceName extends ResourceBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/place-names/{id}';
  }
}
