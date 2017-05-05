import CrudBase from './base/CrudBase';

export default class JobResult extends CrudBase {
  get resourceName() {
    return 'job-result';
  }

  /**
   * Job result archive url
   * @returns {string} - Archive url
   */
  get archiveUrl() {
    return `${this.url}/archive`;
  }

  /**
   * Job result preview url, usable in an `<img>` tag
   * @returns {string} - Preview url
   */
  get previewUrl() {
    return `${this.url}/preview`;
  }
}
