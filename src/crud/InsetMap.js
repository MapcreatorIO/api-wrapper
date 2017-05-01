import ResourceBase from './base/ResourceBase';

export default class InsetMap extends ResourceBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'inset-maps';
    this.path = '/' + this.resourceName + '/{id}';
  }
}
