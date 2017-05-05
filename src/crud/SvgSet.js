import CrudSetBase from './base/CrudSetBase';
import Svg from './Svg';

export default class SvgSet extends CrudSetBase {
  get path() {
    return '/svgs/sets/{id}';
  }

  get resourceName() {
    return 'svg-sets';
  }

  get ownable() {
    return true;
  }

  get _Child() {
    return Svg;
  }
}
