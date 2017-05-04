import CrudBase from './base/CrudBase';
import ImageHandler from './base/ImageHandler';

export default class Layer extends CrudBase {
  /**
   * Handler for item image management
   * @returns {ImageHandler} - Image handler
   */
  get imageHandler() {
    return new ImageHandler(this.api, this);
  }

  get ownable() {
    return true;
  }

  get path() {
    return '/' + this.resourceName + '/{id}';
  }

  get resourceName() {
    return 'layers';
  }
}
