import CrudBase from './base/CrudBase';
import ImageHandler from './base/ImageHandler';

export default class Mapstyle extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/mapstyles/{id}';
  }

  imageHandler() {
    return new ImageHandler(this.api, this);
  }
}
