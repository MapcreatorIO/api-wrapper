import CrudBase from './base/CrudBase';

export default class JobShare extends CrudBase {
  /**
   * Unsupported method implemented due to CrudBase abstraction
   * @returns {void}
   * @throws Error
   * @private
   */
  save() {
    throw new Error('Unsupported method JobShare::save');
  }

  /**
   * Accessor for {@link JobShareVisibility} enum
   * @returns {JobShareVisibility} - Accessor for enum
   */
  static get visibility() {
    return JobShareVisibility;
  }

  get resourcePath() {
    return '/jobs/shares/{id}';
  }

  get resourceName() {
    return 'job-shares';
  }
}

/**
 * Job share visibility enum
 * @enum {String}
 */
class JobShareVisibility {
  static get PRIVATE() {
    return 'private';
  }

  static get ORGANISATION() {
    return 'organisation';
  }
}
