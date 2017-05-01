import {isParentOf} from '../../utils/reflection';
import Maps4News from '../../Maps4News';
import ResourceBase from './ResourceBase';

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
    // TODO: Implement uploading using XMLHttpRequest
    throw new Error('Not implemented');
  }
}
