import ResourceBase from './ResourceBase';

export default class Choropleth extends ResourceBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/choropleths/{id}';
  }
}
