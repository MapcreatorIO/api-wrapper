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
  get resourceName() {
    return 'users';
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
  /**
   * Get the list notifications linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Notification} instances and rejects with {@link OAuthError}
   */
  notifications() {
    return this._listResource(Notification);
  }

  /**
   * Get the list mapstyle sets linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link MapstyleSet} instances and rejects with {@link OAuthError}
   */
  mapstyleSets() {
    return this._listResource(MapstyleSet);
  }

  /**
   * Get the list dimension sets linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link DimensionSet} instances and rejects with {@link OAuthError}
   */
  dimensionSets() {
    return this._listResource(DimensionSet);
  }

  /**
   * Get the list font families linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link FontFamily} instances and rejects with {@link OAuthError}
   */
  fontFamilies() {
    return this._listResource(FontFamily);
  }

  /**
   * Get the list svg sets linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link SvgSet} instances and rejects with {@link OAuthError}
   */
  svgSets() {
    return this._listResource(SvgSet);
  }

  /**
   * Get the list colors linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Color} instances and rejects with {@link OAuthError}
   */
  colors() {
    return this._listResource(Color);
  }

  /**
   * Get the list jobs linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Job} instances and rejects with {@link OAuthError}
   */
  jobs() {
    return this._listResource(Job);
  }

  /**
   * Get the list features linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Feature} instances and rejects with {@link OAuthError}
   */
  features() {
    return this._listResource(Feature);
  }

  /**
   * Get the list layers linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Layer} instances and rejects with {@link OAuthError}
   */
  layers() {
    return this._listResource(Layer);
  }

  /**
   * Get the list job types linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobType} instances and rejects with {@link OAuthError}
   */
  jobTypes() {
    return this._listResource(JobType);
  }

  /**
   * Get the list job shares linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobShare} instances and rejects with {@link OAuthError}
   */
  jobShares() {
    return this._listResource(JobShare);
  }
}
