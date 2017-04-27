import ResourceBase from './ResourceBase';

export default class InsetMap extends ResourceBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/inset-maps/{id}';
  }
}
