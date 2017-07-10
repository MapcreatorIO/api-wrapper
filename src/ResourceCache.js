import Singleton from './utils/Singleton';


export default class ResourceCache extends Singleton {
  constructor() {
    super();

    // If first instance
    if (this._instanceCount === 1) {

    }
  }
}
