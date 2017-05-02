import {isParentOf} from '../../utils/reflection';
import Maps4News from '../../Maps4News';
import ResourceBase from './ResourceBase';
import ApiError from '../../exceptions/ApiError';
import ValidationException from '../../exceptions/ValidationException';

export default class ImageHandler {
  constructor(api, target) {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    if (!isParentOf(ResourceBase, target)) {
      throw new TypeError('Expected target to be of type ResourceBase');
    }

    this.api = api;
    this.target = target;
  }

  get url() {
    return this.target.url + '/image';
  }

  delete() {
    return this.api.request(this.url, 'DELETE');
  }

  download() {
    return new Promise((resolve, reject) => {
      this.api.request(this.url, 'GET', {}, {}, 'arraybuffer')
        .catch(reject)
        .then(data => {
          const blob = new Blob([data], {type: 'image'});

          // noinspection JSUnresolvedFunction
          const url = (window.URL || window.webkitURL).createObjectURL(blob);

          resolve(url);
        });
    });
  }

  upload(image) {
    if (!isParentOf(File, image)) {
      throw new TypeError('Expected image to be of type File');
    }

    return new Promise((resolve, reject) => {
      const formData = new FormData();

      formData.append('image', image);

      const request = new XMLHttpRequest();

      request.open('POST', this.url, true);
      request.setRequestHeader('Authorization', this.api.token.toString());
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
              reject(new ValidationException(err.type, err.message, request.status, err.validation_errors));
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
