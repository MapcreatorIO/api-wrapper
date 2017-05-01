import Notification from './Notification';
import CrudBase from './base/CrudBase';
import MapstyleSet from './MapstyleSet';
import DimensionSet from './DimensionSet';
import FontFamily from './FontFamily';
import SvgSet from './SvgSet';
import Color from './Color';
import Feature from './Feature';
import Layer from './Layer';
import Job from './Job';
import JobType from './JobType';
import JobShare from './JobShare';

export default class User extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'users';
    this.path = '/' + this.resourceName + '/{id}';
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

  // Resource listing
  notifications() {
    return this._listResource(Notification);
  }

  mapstyleSets() {
    return this._listResource(MapstyleSet);
  }

  dimensionSets() {
    return this._listResource(DimensionSet);
  }

  fontFamilies() {
    return this._listResource(FontFamily);
  }

  svgSets() {
    return this._listResource(SvgSet);
  }

  colors() {
    return this._listResource(Color);
  }

  jobs() {
    return this._listResource(Job);
  }

  features() {
    return this._listResource(Feature);
  }

  layers() {
    return this._listResource(Layer);
  }

  jobTypes() {
    return this._listResource(JobType);
  }

  jobShares() {
    return this._listResource(JobShare);
  }
}
