import Notification from './Notification';
import CrudBase from './base/CrudBase';
import MapstyleSet from './MapstyleSet';
import DimensionSet from './DimensionSet';
import FontFamily from './FontFamily';
import SvgSet from './SvgSet';
import Color from './Color';
import Feature from './Feature';
import Layer from './Layer';

export default class User extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/users/{id}';
  }

  ips() {
    const url = `${this.url}/ips`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(
          data.map(row => row['ip_address'])
        ));
    });
  }

  _listResource(path, Target) {
    const url = `${this.url}/${path}`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(data.map(row => {
          return new Target(this.api, row);
        })));
    });
  }

  // Resource listing
  notifications() {
    return this._listResource('notifications', Notification);
  }

  // TODO
  ssos() {
    throw new Error('Not implemented');
  }

  mapstyleSets() {
    return this._listResource('mapstyle-sets', MapstyleSet);
  }

  dimensionSets() {
    return this._listResource('dimension-sets', DimensionSet);
  }

  fontFamilies() {
    return this._listResource('font-families', FontFamily);
  }

  svgSets() {
    return this._listResource('svg-sets', SvgSet);
  }

  colors() {
    return this._listResource('colors', Color);
  }

  jobs() {
    return this._listResource('jobs', Job);
  }

  features() {
    return this._listResource('features', Feature);
  }

  layers() {
    return this._listResource('layers', Layer);
  }

  jobTypes() {
    return this._listResource('job/types', JobType);
  }

  jobShares() {
    return this._listResource('job/shares', JobShare);
  }
}
