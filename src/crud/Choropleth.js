import ResourceBase from './base/ResourceBase';

/**
 * Choropleth resource
 */
export default class Choropleth extends ResourceBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'choropleths';
  }
}
