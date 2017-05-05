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

  get resourceName() {
    return 'layers';
  }

  get ownable() {
    return true;
  }
}
