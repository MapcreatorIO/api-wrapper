import CrudBase from './base/CrudBase';
import ImageHandler from './base/ImageHandler';

export default class Layer extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/layers/{id}';
  }

  imageHandler() {
    return new ImageHandler(this.api, this);
  }
}
