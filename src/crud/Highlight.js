import ResourceBase from './ResourceBase';

export default class Highlight extends ResourceBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/highlights/{id}';
  }
}
