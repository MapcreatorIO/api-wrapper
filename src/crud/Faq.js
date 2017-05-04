import CrudBase from './base/CrudBase';

/**
 * Faq resource
 */
export default class Faq extends CrudBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'faqs';
  }
}
