import {isParentOf} from '../../utils/reflection';
import Maps4News from '../../Maps4News';
import ResourceBase from './ResourceBase';
import ApiError from '../../exceptions/ApiError';
import ValidationError from '../../exceptions/ValidationError';

/**
 * Image resource handler
 * @protected
 */
export default class ImageHandler {
  /**
   * @param {Maps4News} api - Api instance
   * @param {ResourceBase} target - Instance of target item
   */
  constructor(api, target) {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    if (!isParentOf(ResourceBase, target)) {
      throw new TypeError('Expected target to be of type ResourceBase');
    }

    this._api = api;
    this._target = target;
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Resource url, can be used in an image tag
   * @returns {string} - Resource url
   */
  get url() {
    return `${this._target.url}/image`;
  }

  /**
   * Delete image
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link ApiError}
   */
  delete() {
    return this._api.request(this.url, 'DELETE');
  }

  /**
   * Get image base64 representation
   * @returns {Promise} - Resolves with a {@link String} containing a base64 representation of the image and rejects with {@link ApiError}
   */
  download() {
    return new Promise((resolve, reject) => {
      this._api.request(this.url, 'GET', {}, {}, 'arraybuffer')
        .catch(reject)
        .then(data => {
          const blob = new Blob([data], {type: 'image'});

          // noinspection JSUnresolvedFunction
          const url = (window.URL || window.webkitURL).createObjectURL(blob);

          resolve(url);
        });
    });
  }

  /**
   * Upload new image
   * @param {File} image - Image file
   * @returns {Promise} - Resolves with an empty {@link Object} and rejects with {@link ApiError}
   * @todo refactor
   */
  upload(image) {
    if (!isParentOf(File, image)) {
      throw new TypeError('Expected image to be of type File');
    }

    return new Promise((resolve, reject) => {
      const formData = new FormData();

      formData.append('image', image);

      const request = new XMLHttpRequest();

      request.open('POST', this.url, true);
      request.setRequestHeader('Authorization', this.api.auth.token.toString());
      request.setRequestHeader('Accept', 'application/json');

      request.onreadystatechange = () => {
        if (request.readyState !== XMLHttpRequest.DONE) {
          return;
        }

        try {
          const response = JSON.parse(request.responseText);

          if (!response.success) {
            const err = response.error;

            if (!err.validation_errors) {
              reject(new ApiError(err.type, err.message, request.status));
            } else {
              reject(new ValidationError(err.type, err.message, request.status, err.validation_errors));
            }
          } else {
            // Return an empty object if no data has been sent
            // instead of returning undefined.
            resolve(response.data || {});
          }
        } catch (ignore) {
          reject(new ApiError('ResponseException', 'The server returned an invalid response', request.status));
        }
      };

      request.send(formData);
    });
  }
}
