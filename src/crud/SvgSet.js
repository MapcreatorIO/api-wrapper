import {mix} from 'mixwith/src/mixwith';
import {OwnableResource} from '../traits/OwnableResource';
import CrudSetBase from './base/CrudSetBase';
import Svg from './Svg';

export default class SvgSet extends mix(CrudSetBase).with(OwnableResource) {
  get resourcePath() {
    return '/svgs/sets/{id}';
  }

  get resourceName() {
    return 'svg-sets';
  }

  get _Child() {
    return Svg;
  }
}
