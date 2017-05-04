import ImplicitFlow from './ImplicitFlow';
import OAuthToken from './OAuthToken';
import OAuthError from './OAuthError';

/**
 * Implicit OAuth flow using a pop-up.
 */
export default class ImplicitFlowPopup extends ImplicitFlow {
  /**
   * Implicit pop-up authentication flow
   * @param {String} clientId - OAuth client id
   * @param {String} redirectUri - redirectUri for obtaining the token. This should be a
   *                               page with this script on it. If left empty the current
   *                               url will be used.
   * @param {Array<String>} scopes - A list of required scopes
   * @param {Boolean} useState - use state verification
   * @param {String} windowOptions - optional window options for the pop-up window
   * @returns {void}
   */
  constructor(clientId, redirectUri = '', scopes = ['*'], useState = false, windowOptions = 'width=800, height=600') {
    super(clientId, redirectUri, scopes, useState);

    this.windowOptions = windowOptions;

    if (window.name === ImplicitFlowPopup.popupWindowName) {
      const data = this.token.toResponseObject() || this._getAnchorParams();

      localStorage.setItem(ImplicitFlowPopup.localStorageKey, JSON.stringify(data));

      window.close();
    }
  }

  /**
   * Popup window name
   * @returns {String} - window.name of the created pop-up
   * @constant
   */
  static get popupWindowName() {
    return 'm4n_api_auth';
  }

  /**
   * localStorage key name for temporarily storing the token
   * @returns {String} - key name
   * @constant
   */
  static get localStorageKey() {
    return 'm4n_api_auth_response';
  }

  /**
   * Authenticate
   * @returns {Promise} - Promise resolves with {@link OAuthToken} and rejects with {@link OAuthError}
   */
  authenticate() {
    if (window.name === ImplicitFlowPopup.popupWindowName) {
      return new Promise(() => {
      });
    }

    // Should be super.super.authenticate() :/
    if (this.authenticated) {
      return new Promise(resolve => {
        resolve(this.token);
      });
    }

    return new Promise((resolve, reject) => {
      const popup = window.open(
        this._buildRedirectUrl(),
        ImplicitFlowPopup.popupWindowName,
        this.windowOptions
      );

      const ticker = setInterval(() => {
        if (popup.closed) {
          clearInterval(ticker);

          const data = JSON.parse(localStorage.getItem(ImplicitFlowPopup.localStorageKey));

          localStorage.removeItem(ImplicitFlowPopup.localStorageKey);

          if (!data) {
            reject(new OAuthError('window_closed', 'Pop-up window was closed'));
          } else if (data.error) {
            reject(new OAuthError(data.error, data.message));
          } else {
            resolve(this.token = OAuthToken.fromResponseObject(data));
          }
        }
      }, 500);
    });
  }
}
