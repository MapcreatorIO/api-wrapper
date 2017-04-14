/**
 * Implicit OAuth flow using redirection
 */
import OAuth from "./OAuth";
import OAuthToken from "./OAuthToken";
import StateContainer from "./StateContainer";
import {encodeQueryString} from "../util/requests";
import OAuthError from "./OAuthError";

export default class ImplicitFlow extends OAuth {

  /**
   * Implicit authentication flow
   * @param {string} clientId - OAuth client id
   * @param {string} redirectUri - redirectUri for obtaining the token. This should be a
   *                               page with this script on it. If left empty the current
   *                               url will be used.
   * @param {boolean} useState - use state verification
   * @param {Array<string>} scopes - A list of required scopes
   */
  constructor(clientId, redirectUri = '', scopes = ['*'], useState = true) {
    super(clientId, scopes);

    this.path = '/oauth/authorize';

    this.redirectUri = redirectUri;
    this.useState = useState;

    if (!this.redirectUri) {
      // Drop the anchor (if any)
      this.redirectUri = window.location.toString().split('#')[0];
    }

    this._anchorParams = [
      'access_token', 'token_type', 'expires_in'
    ];

    if (this.useState) {
      this._anchorParams.push('state');
    }

    if (this._anchorContainsOAuthResponse()) {
      const anchorParams = this._getOAuthAnchorParams();
      this._cleanAnchorParams();

      if (this.useState && !StateContainer.validate(anchorParams['state'])) {
        console.log('Encountered an invalid state response, ignoring token');
        console.log('State: ' + anchorParams['state']);
        console.log(StateContainer.list());

        throw Error('Invalid state in url');
      } else {
        this.token = OAuthToken.fromResponseObject(anchorParams)
      }
    }
  }

  /**
   * Authenticate
   * @returns {Promise}
   */
  authenticate() {
    if(this.authenticated) {
      return new Promise(resolve => {
        resolve(this.token);
      });
    } else if(this._anchorContainsError()) {

      return new Promise((resolve, reject) => {
        const err = this._getError();

        this._cleanAnchorParams();

        reject(err);
      });
    }

    // This promise will never be fulfilled
    return new Promise(() => {
      window.location = this._buildRedirectUrl();
    });
  }

  /**
   * Builds the url for redirection
   * @returns {string}
   * @protected
   */
  _buildRedirectUrl() {
    const queryParams = {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'token',
      scope: this.scopes.join(' '),
    };

    if (this.useState) {
      queryParams['state'] = StateContainer.generate();
    }

    return `${this.host + this.path}?${encodeQueryString(queryParams)}`;
  }

  //noinspection JSMethodCanBeStatic
  /**
   * Builds an object containing all the anchor parameters
   * @returns {object<string, string>}
   * @protected
   */
  _getAnchorParams() {
    const out = {};
    const query = window.location.hash.substr(1);

    for (let raw of query.split('&')) {
      let pair = raw.split('=').map(decodeURIComponent);
      out[pair[0]] = pair[1];
    }

    return out;
  }

  /**
   * Fetch OAuth anchor params
   * @param {string|undefined} query
   * @returns {object<string, string>} List of OAuth anchor parameters
   * @protected
   */
  _getOAuthAnchorParams(query = undefined) {
    query = query || this._getAnchorParams();

    return Object.keys(query)
      .filter(key => this._anchorParams.includes(key))
      .reduce((obj, key) => {
        obj[key] = query[key];
        return obj;
      }, {});
  }

  /**
   * Remove OAuth related anchor parameters
   * @protected
   */
  _cleanAnchorParams() {
    const anchorParams = this._getAnchorParams();
    const targets = this._anchorParams;

    // Just in case
    targets.push('state', 'error');

    for (let key of targets) {
      // Should silently fail when key doesn't exist
      delete anchorParams[key];
    }

    window.location.hash = encodeQueryString(anchorParams);
  }

  /**
   * Test if the anchor contains an OAuth response
   * @returns {boolean}
   * @protected
   */
  _anchorContainsOAuthResponse() {
    const queryKeys = Object.keys(this._getOAuthAnchorParams());

    // Check if all the params are in the anchor
    return this._anchorParams.reduce((output, key) =>
      output && queryKeys.includes(key), true);
  }

  /**
   * Test if the anchor contains an OAuth error
   * @returns {boolean}
   * @protected
   */
  _anchorContainsError() {
    return Boolean(this._getAnchorParams()['error']);
  }

  /**
   * Get and return the error in the anchor
   * @returns {OAuthError|boolean}
   * @protected
   */
  _getError() {
    if(!this._anchorContainsError()) {
      return null;
    }

    const params = this._getAnchorParams();

    return new OAuthError(
      params['error'], params['message']
    );
  }
}
