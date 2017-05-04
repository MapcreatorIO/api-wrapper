import CrudBase from './base/CrudBase';
import ImageHandler from './base/ImageHandler';

export default class Mapstyle extends CrudBase {
  /**
   * Handler for item image management
   * @returns {ImageHandler} - Image handler
   */
  get imageHandler() {
    return new ImageHandler(this.api, this);
  }

  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'mapstyles';
  }
}
