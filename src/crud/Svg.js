import CrudBase from './base/CrudBase';

export default class Svg extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/svgs/{id}';
  }
}
