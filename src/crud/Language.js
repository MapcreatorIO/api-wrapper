import CrudBase from './base/CrudBase';

export default class Language extends CrudBase {
  get resourceName() {
    return 'languages';
  }

  toString() {
    return `${this.constructor.name}(${this.code})`;
  }
}
