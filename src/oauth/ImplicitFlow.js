/**
 * Implicit OAuth flow using redirection
 */
import OAuth from './OAuth';
import OAuthToken from './OAuthToken';
import StateContainer from './StateContainer';
import {encodeQueryString} from '../utils/requests';
import OAuthError from './OAuthError';
import {isNode} from '../utils/node';

export default class ImplicitFlow extends OAuth {

  /**
   * Implicit authentication flow
   * @param {String} clientId - OAuth client id
   * @param {String} redirectUri - redirectUri for obtaining the token. This should be a
   *                               page with this script on it. If left empty the current
   *                               url will be used.
   * @param {Array<String>} scopes - A list of required scopes
   * @param {Boolean} useState - use state verification
   * @returns {void}
   */
  constructor(clientId, redirectUri = '', scopes = ['*'], useState = true) {
    super(clientId, scopes);

    if (isNode()) {
      throw new Error(`${this.constructor.name} can't be used under nodejs`);
    }

    this.path = '/oauth/authorize';

    this.redirectUri = redirectUri;
    this.useState = useState;

    if (!this.redirectUri) {
      // Drop the anchor (if any)
      this.redirectUri = window.location.toString().split('#')[0];
    }

    this._anchorParams = [
      'access_token', 'token_type', 'expires_in',
    ];

    if (this.useState) {
      this._anchorParams.push('state');
    }

    if (this._anchorContainsOAuthResponse()) {
      const anchorParams = this._getOAuthAnchorParams();

      this._cleanAnchorParams();

      if (this.useState && !StateContainer.validate(anchorParams['state'])) {
        throw Error('Invalid state in url');
      } else {
        this.token = OAuthToken.fromResponseObject(anchorParams);
      }
    }
  }

  /**
   * Authenticate
   * @returns {Promise} - Promise resolves with {@link OAuthToken} and rejects with {@link OAuthError}
   */
  authenticate() {
    return new Promise((resolve, reject) => {
      if (this.authenticated) {
        resolve(this.token);
      } else if (this._anchorContainsError()) {
        const err = this._getError();

        this._cleanAnchorParams();

        reject(err);
      } else {
        window.location = this._buildRedirectUrl();
      }
    });
  }

  /**
   * Builds the url for redirection
   * @returns {String} - Redirect url
   * @protected
   */
  _buildRedirectUrl() {
    const queryParams = {
      'client_id': this.clientId,
      'redirect_uri': this.redirectUri,
      'response_type': 'token',
      'scope': this.scopes.join(' '),
    };

    if (this.useState) {
      queryParams['state'] = StateContainer.generate();
    }

    return `${this.host + this.path}?${encodeQueryString(queryParams)}`;
  }

  /**
   * Builds an object containing all the anchor parameters
   * @returns {Object<String, String>} - Anchor paramenters
   * @protected
   */
  _getAnchorParams() {
    const out = {};
    const query = window.location.hash.substr(1);

    for (const raw of query.split('&')) {
      const pair = raw.split('=').map(decodeURIComponent);

      out[pair[0]] = pair[1];
    }

    return out;
  }

  /**
   * Fetch OAuth anchor params
   * @param {Object<String, String>} query - Optional override for the query to analyse, defaults to {@link ImplicitFlow#_getAnchorParams}
   * @returns {Object<String, String>} - List of OAuth anchor parameters
   * @protected
   */
  _getOAuthAnchorParams(query = this._getAnchorParams()) {
    return Object.keys(query)
      .filter(key => this._anchorParams.includes(key))
      .reduce((obj, key) => {
        obj[key] = query[key];
        return obj;
      }, {});
  }

  /**
   * Remove OAuth related anchor parameters
   * @returns {void}
   * @protected
   */
  _cleanAnchorParams() {
    const anchorParams = this._getAnchorParams();
    const targets = this._anchorParams;

    // Just in case
    targets.push('state', 'error');

    for (const key of targets) {
      // Should silently fail when key doesn't exist
      delete anchorParams[key];
    }

    window.location.hash = encodeQueryString(anchorParams);
  }

  /**
   * Test if the anchor contains an OAuth response
   * @returns {Boolean} - if anchor tested positive for containing an OAuth response
   * @protected
   */
  _anchorContainsOAuthResponse() {
    const queryKeys = Object.keys(this._getOAuthAnchorParams());

    // Check if all the params are in the anchor
    return this._anchorParams.reduce((output, key) => {
      return output && queryKeys.includes(key);
    }, true);
  }

  /**
   * Test if the anchor contains an OAuth error
   * @returns {Boolean} - if anchor tested positive for containing an OAuth error
   * @protected
   */
  _anchorContainsError() {
    return Boolean(this._getAnchorParams()['error']);
  }

  /**
   * Get and return the error in the anchor
   * @returns {OAuthError} - OAuthError object
   * @protected
   */
  _getError() {
    if (!this._anchorContainsError()) {
      throw Error('No OAuthError found in anchor');
    }

    const params = this._getAnchorParams();

    return new OAuthError(
      params['error'], params['message']
    );
  }
}
