import ImplicitFlow from "./ImplicitFlow";
import OAuthToken from "./OAuthToken";

/**
 * Implicit OAuth flow using a pop-up.
 */
export default class ImplicitFlowPopup extends ImplicitFlow {
  /**
   * Implicit pop-up authentication flow
   * @param {string} clientId - OAuth client id
   * @param {string} redirectUri - redirectUri for obtaining the token. This should be a
   *                               page with this script on it. If left empty the current
   *                               url will be used.
   * @param {boolean} useState - use state verification
   * @param {Array<string>} scopes - A list of required scopes
   */
  constructor(clientId, redirectUri = '', scopes = ['*'], useState = false) {
    super(clientId, redirectUri, scopes, useState);

    this.windowOptions = 'width=800, height=600';

    if (this.token && window.name === ImplicitFlowPopup.popupWindowName) {
      this.token.save(ImplicitFlowPopup.localStorageKey, true);
      console.log(this.token);
      window.close();
    }
  }

  /**
   * Popup window name
   * @returns {string}
   * @constant
   */
  static get popupWindowName() {
    return 'm4n_api_auth';
  }

  /**
   * localStorage key name for temporarily storing the token
   * @returns {string}
   * @constant
   */
  static get localStorageKey() {
    return 'm4n_api_auth_response';
  }

  /**
   * Authenticate
   * @returns {Promise}
   */
  authenticate() {
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

          const token = OAuthToken.recover(ImplicitFlowPopup.localStorageKey);
          localStorage.removeItem(ImplicitFlowPopup.localStorageKey);

          if (!token) {
            // TODO: Make reject consistent
            reject()
          } else {
            this.token = token;
            resolve(this.token);
          }
        }
      }, 500);
    });
  }
}
