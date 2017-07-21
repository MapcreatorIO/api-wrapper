import ResourceProxy from '../ResourceProxy';
import CrudBase from './base/CrudBase';
import Color from './Color';
import DimensionSet from './DimensionSet';
import Feature from './Feature';
import FontFamily from './FontFamily';
import Job from './Job';
import JobShare from './JobShare';
import JobType from './JobType';
import Language from './Language';
import Layer from './Layer';
import MapstyleSet from './MapstyleSet';
import Notification from './Notification';
import Organisation from './Organisation';
import Permission from './Permission';
import SvgSet from './SvgSet';

export default class User extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    if (String(data.id).toLowerCase() === 'me') {
      this._baseProperties.id = 'me';
    }
  }

  get resourceName() {
    return 'users';
  }

  /**
   * Check if user is an administrator
   * @returns {Promise} - Resolves with a {@link Boolean} and rejects with {@link ApiError}
   */
  isAdmin() {
    return this.permissions().then(permissions => {
      return Boolean(permissions.find(p => p.name === 'is:admin'));
    });
  }

  /**
   * Get all known ips
   * @returns {Promise} - Resolves with {@link array<string>} instance and rejects with {@link ApiError}
   */
  ips() {
    const url = `${this.url}/ips`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(
          data.map(row => row['ip_address']),
        ));
    });
  }

  /**
   * Get the user's organisation
   * @returns {Promise} - Resolves with {@link Organisation} instance and rejects with {@link ApiError}
   */
  organisation() {
    return (new ResourceProxy(this.api, Organisation)).get(this.organisationId);
  }

  /**
   * Get the user's language
   * @returns {Promise} - Resolves with {@link Language} instance and rejects with {@link ApiError}
   */
  language() {
    return (new ResourceProxy(this.api, Language)).get(this.languageCode);
  }

  // region Resource listing
  /**
   * Get the list notifications linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Notification} instances and rejects with {@link ApiError}
   */
  notifications() {
    return this._listResource(Notification);
  }

  /**
   * Get the list mapstyle sets linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link MapstyleSet} instances and rejects with {@link ApiError}
   */
  mapstyleSets() {
    return this._listResource(MapstyleSet);
  }

  /**
   * Get the list dimension sets linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link DimensionSet} instances and rejects with {@link ApiError}
   */
  dimensionSets() {
    return this._listResource(DimensionSet);
  }

  /**
   * Get the list font families linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link FontFamily} instances and rejects with {@link ApiError}
   */
  fontFamilies() {
    return this._listResource(FontFamily);
  }

  /**
   * Get the list svg sets linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link SvgSet} instances and rejects with {@link ApiError}
   */
  svgSets() {
    return this._listResource(SvgSet);
  }

  /**
   * Get the list colors linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Color} instances and rejects with {@link ApiError}
   */
  colors() {
    return this._listResource(Color);
  }

  /**
   * Get the list jobs linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Job} instances and rejects with {@link ApiError}
   */
  jobs() {
    return this._listResource(Job);
  }

  /**
   * Get the list features linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Feature} instances and rejects with {@link ApiError}
   */
  features() {
    return this._listResource(Feature);
  }

  /**
   * Get the list layers linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Layer} instances and rejects with {@link ApiError}
   */
  layers() {
    return this._listResource(Layer);
  }

  /**
   * Get the list job types linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobType} instances and rejects with {@link ApiError}
   */
  jobTypes() {
    return this._listResource(JobType);
  }

  /**
   * Get the list job shares linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link JobShare} instances and rejects with {@link ApiError}
   */
  jobShares() {
    return this._listResource(JobShare);
  }

  /**
   * Get the list job shares linked to the user
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance containing {@link Permission} instances and rejects with {@link ApiError}
   */
  permissions() {
    return this._listResource(Permission);
  }

  // endregion
}
