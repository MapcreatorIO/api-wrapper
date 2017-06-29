import CrudBase from './base/CrudBase';
import OwnableResource from '../traits/OwnableResource';
import {mix} from '../utils/reflection';

/**
 * Job type
 * @extends {CrudBase}
 * @extends {OwnableResource}
 */
export default class JobType extends mix(CrudBase, OwnableResource) {
  get resourcePath() {
    return '/jobs/types/{id}';
  }

  get resourceName() {
    return 'job-types';
  }
}
