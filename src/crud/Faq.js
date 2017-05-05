import CrudBase from './base/CrudBase';

/**
 * Faq resource
 */
export default class Faq extends CrudBase {
  get resourceName() {
    return 'faqs';
  }
}
