import CrudBase from './base/CrudBase';

export default class Faq extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'faqs';
    this.path = '/' + this.resourceName + '/{id}';
  }
}
