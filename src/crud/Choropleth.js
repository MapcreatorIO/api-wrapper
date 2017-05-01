import ResourceBase from './base/ResourceBase';

export default class Choropleth extends ResourceBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'choropleths';
    this.path = '/' + this.resourceName + '/{id}';
  }
}
