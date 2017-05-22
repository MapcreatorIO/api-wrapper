// Polyfill for terrible browsers (looking at you IE)
import 'babel-polyfill';

import {isParentOf} from './utils/reflection';
import OAuth from './oauth/OAuth';
import {makeRequest} from './utils/requests';
import ApiError from './exceptions/ApiError';
import ValidationError from './exceptions/ValidationError';
import ResourceProxy from './ResourceProxy';
import Color from './crud/Color';
import Choropleth from './crud/Choropleth';
import Contract from './crud/Contract';
import DimensionSet from './crud/DimensionSet';
import Dimension from './crud/Dimension';
import Faq from './crud/Faq';
import Feature from './crud/Feature';
import Group from './crud/Group';
import FontFamily from './crud/FontFamily';
import Font from './crud/Font';
import Highlight from './crud/Highlight';
import InsetMap from './crud/InsetMap';
import User from './crud/User';
import Notification from './crud/Notification';
import Language from './crud/Language';
import Layer from './crud/Layer';
import Mapstyle from './crud/Mapstyle';
import Permission from './crud/Permission';
import MapstyleSet from './crud/MapstyleSet';
import JobShare from './crud/JobShare';
import Job from './crud/Job';
import JobType from './crud/JobType';
import Organisation from './crud/Organisation';
import PlaceName from './crud/PlaceName';
import Svg from './crud/Svg';
import SvgSetType from './crud/SvgSetType';
import SvgSet from './crud/SvgSet';
import DummyFlow from './oauth/DummyFlow';

/**
 * Base API class
 */
export default class Maps4News {
  /**
   * @param {OAuth} auth - Authentication flow
   * @param {string} host - Remote API host
   */
  constructor(auth = new DummyFlow(), host = 'https://api.maps4news.com') {
    this.auth = auth;
    this.host = host;
  }

  /**
   * Get api version
   * @returns {string} - Api version
   * @constant
   */
  get version() {
    return 'v1';
  }

  /**
   * Get authentication provider instance
   * @returns {OAuth} - OAuth instance
   */
  get auth() {
    return this._auth;
  }

  /**
   * Set authentication provider instance
   * @param {OAuth} value -- OAuth instance
   */
  set auth(value) {
    if (!isParentOf(OAuth, value)) {
      throw new TypeError('auth must be an instance of OAuth');
    }

    this._auth = value;
  }

  /**
   * Test if the client is authenticated with the api and has a valid token
   * @returns {boolean} - If the client is authenticated with the api
   */
  get authenticated() {
    return this._auth.authenticated;
  }

  /**
   * The current host
   * @returns {string} - The current host
   */
  get host() {
    return this._host;
  }

  /**
   * The remote host
   * @param {string} value - A valid url
   */
  set host(value) {
    this._host = value;
    this._auth.host = value;
  }

  /**
   * Authenticate with the api using the authentication method provided.
   * @returns {Promise} - Resolves with {@link Maps4News} instance and rejects with {@link OAuthError}
   */
  authenticate() {
    return new Promise((resolve, reject) => {
      this._auth.authenticate().then(() => {
        this._auth.token.save();

        resolve(this);
      }).catch(reject);
    });
  }

  /**
   * Request an url using the API token (if available)
   * @param {string} url - Relative or absolute url, api version will be prepended to relative urls
   * @param {string} method - Http method
   * @param {string|object} data - Raw string or object. If an object is passed it will be encoded
   *                               and the content-type will be set to `application/json`
   * @param {object} headers - Any headers that should be set for the request
   * @param {string} responseType - The XmlHttpRequest type
   * @param {boolean} raw - When set to true the promise will resolve with the request object
   * @returns {Promise} - Resolves with either an object or the raw data by checking the `Content-Type` header and rejects with {@link ApiError}
   */
  request(url, method = 'GET', data = {}, headers = {}, responseType = '', raw = false) {
    if (!url.startsWith('http')) {
      // Removes '/' at the start of the string (if any)
      url = url.replace(/(^\/+)/, () => '');
      url = `${this._host}/${this.version}/${url}`;
    }

    if (this.authenticated) {
      headers.Authorization = this._auth.token.toString();
    }

    return new Promise((resolve, reject) => {
      makeRequest(url, method, data, headers, responseType).then(request => {
        if (request.getResponseHeader('Content-Type') !== 'application/json') {
          resolve(raw ? request : request.response);
        } else {
          const response = JSON.parse(request.responseText);

          if (!response.success) {
            const err = response.error;

            if (!err.validation_errors) {
              reject(new ApiError(err.type, err.message, request.status));
            } else {
              reject(new ValidationError(err.type, err.message, request.status, err.validation_errors));
            }
          } else {
            // Return an empty object if no data has been sent
            // instead of returning undefined.
            resolve(raw ? request : response.data || {});
          }
        }
      }).catch(request => {
        const err = JSON.parse(request.responseText).error;

        reject(new ApiError(err.type, err.message, request.status));
      });
    });
  }

  /**
   * Choropleth accessor
   * @see {@link Choropleth}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get choropleths() {
    return new ResourceProxy(this, Choropleth);
  }

  /**
   * Color accessor
   * @see {@link Color}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get colors() {
    return new ResourceProxy(this, Color);
  }

  /**
   * Contract accessor
   * @see {@link Contract}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get contracts() {
    return new ResourceProxy(this, Contract);
  }

  /**
   * Dimension accessor
   * @see {@link Dimension}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get dimensions() {
    return new ResourceProxy(this, Dimension);
  }

  /**
   * Dimension set accessor
   * @see {@link DimensionSet}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get dimensionSets() {
    return new ResourceProxy(this, DimensionSet);
  }

  /**
   * Faq accessor
   * @see {@link Faq}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get faqs() {
    return new ResourceProxy(this, Faq);
  }

  /**
   * Feature accessor
   * @see {@link Feature}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get features() {
    return new ResourceProxy(this, Feature);
  }

  /**
   * Font accessor
   * @see {@link Font}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get fonts() {
    return new ResourceProxy(this, Font);
  }

  /**
   * FontFamily accessor
   * @see {@link FontFamily}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get fontFamilies() {
    return new ResourceProxy(this, FontFamily);
  }

  /**
   * Group accessor
   * @see {@link Group}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get groups() {
    return new ResourceProxy(this, Group);
  }

  /**
   * Highlight accessor
   * @see {@link Highlight}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get highlights() {
    return new ResourceProxy(this, Highlight);
  }

  /**
   * InsetMap accessor
   * @see {@link InsetMap}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get insetMaps() {
    return new ResourceProxy(this, InsetMap);
  }

  /**
   * Job accessor
   * @see {@link Job}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get jobs() {
    return new ResourceProxy(this, Job);
  }

  /**
   * JobShare accessor
   * @see {@link JobShare}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get jobShares() {
    return new ResourceProxy(this, JobShare);
  }

  /**
   * JobType accessor
   * @see {@link JobType}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get jobTypes() {
    return new ResourceProxy(this, JobType);
  }

  /**
   * Language accessor
   * @see {@link Language}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get languages() {
    return new ResourceProxy(this, Language);
  }

  /**
   * Layer accessor
   * @see {@link Layer}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get layers() {
    return new ResourceProxy(this, Layer);
  }

  /**
   * Mapstyle accessor
   * @see {@link Mapstyle}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get mapstyles() {
    return new ResourceProxy(this, Mapstyle);
  }

  /**
   * MapstyleSet accessor
   * @see {@link MapstyleSet}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get mapstylesSets() {
    return new ResourceProxy(this, MapstyleSet);
  }

  /**
   * Notification accessor
   * @see {@link Notification}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get notifications() {
    return new ResourceProxy(this, Notification);
  }

  /**
   * Organisation accessor
   * @see {@link Organisation}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get organisations() {
    return new ResourceProxy(this, Organisation);
  }

  /**
   * Permission accessor
   * @see {@link Permission}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get permissions() {
    return new ResourceProxy(this, Permission);
  }

  /**
   * PlaceName accessor
   * @see {@link PlaceName}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get placeNames() {
    return new ResourceProxy(this, PlaceName);
  }

  /**
   * Svg accessor
   * @see {@link Svg}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get svgs() {
    return new ResourceProxy(this, Svg);
  }

  /**
   * SvgSet accessor
   * @see {@link SvgSet}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get svgSets() {
    return new ResourceProxy(this, SvgSet);
  }

  /**
   * SvgSetType accessor
   * @see {@link SvgSetType}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get svgSetTypes() {
    return new ResourceProxy(this, SvgSetType);
  }

  /**
   * User accessor
   * @see {@link User}
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get users() {
    return new ResourceProxy(this, User);
  }
}
