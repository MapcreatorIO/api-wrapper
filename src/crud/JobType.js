import CrudBase from './base/CrudBase';
import {mix} from 'mixwith/src/mixwith';
import {OwnableResource} from '../traits/OwnableResource';

/**
 * Job type
 * @extends CrudBase
 */
export default class JobType extends mix(CrudBase).with(OwnableResource) {
  get resourcePath() {
    return '/jobs/types/{id}';
  }

  get resourceName() {
    return 'job-types';
  }
}
