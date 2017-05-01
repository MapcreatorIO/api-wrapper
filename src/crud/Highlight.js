import ResourceBase from './base/ResourceBase';

export default class Highlight extends ResourceBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'highlights';
    this.path = '/' + this.resourceName + '/{id}';
  }
}
