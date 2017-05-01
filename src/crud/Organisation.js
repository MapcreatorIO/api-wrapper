import CrudBase from './base/CrudBase';
import MapstyleSet from './MapstyleSet';
import DimensionSet from './DimensionSet';
import FontFamily from './FontFamily';
import SvgSet from './SvgSet';
import Color from './Color';
import Feature from './Feature';
import Layer from './Layer';
import JobType from './JobType';
import JobShare from './JobShare';
import Contract from './Contract';
import User from './User';

export default class Organisation extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'organisations';
    this.path = '/' + this.resourceName + '/{id}';
  }

  sync(items) {
    return this._syncOrAttach(items, 'PATCH');
  }

  attach(items) {
    return this._syncOrAttach(items, 'POST');
  }

  _syncOrAttach(items, method) {
    const collections = this._reduceOwnable(items);
    const out = [];

    for (const key of Object.keys(collections)) {
      const url = `${this.url}/${key}`;
      const data = {keys: collections[key]};
      const promise = this.api.request(url, method, data);

      out.push(promise);
    }

    return out;
  }

  _reduceOwnable(items) {
    const out = {};

    for (const row of items) {
      if (row.ownable) {
        const key = row.resourceName;

        if (!out[key]) {
          out[key] = [row.id];
        } else {
          out[key].push(row.id);
        }
      }
    }

    return out;
  }

  // Resource listing
  fontFamilies() {
    return this._listResource(FontFamily);
  }

  dimensionSets() {
    return this._listResource(DimensionSet);
  }

  mapstyleSets() {
    return this._listResource(MapstyleSet);
  }

  svgSets() {
    return this._listResource(SvgSet);
  }

  colors() {
    return this._listResource(Color);
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

  users() {
    return this._listResource(User);
  }

  contracts() {
    return this._listResource(Contract);
  }
}
