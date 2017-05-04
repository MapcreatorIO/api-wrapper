import CrudBase from './base/CrudBase';

export default class Svg extends CrudBase {
  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'svgs';
  }
}
