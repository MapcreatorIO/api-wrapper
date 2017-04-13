import ImplicitFlow from "./ImplicitFlow";
import OAuthToken from "./OAuthToken";

export default class ImplicitFlowPopup extends ImplicitFlow {
  constructor(client_id, redirect_uri = '', scope = '*', useState = false) {
    super(client_id, redirect_uri, scope, useState);

    this.windowOptions = 'width=800, height=600';

    if (this.token && window.name === ImplicitFlowPopup.popupWindowName) {
      this.token.save(ImplicitFlowPopup.localStorageKey, true);
      console.log(this.token);
      window.close();
    }
  }

  static get popupWindowName() {
    return 'm4n_api_auth';
  }

  static get localStorageKey() {
    return 'm4n_api_auth_response';
  }

  authenticate() {
    // Should be super.super.authenticate() :<
    /*
     let promise = super.authenticate();
     if (promise) {
     return promise;
     }
     */

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

      const ticker = setInterval(function () {
        if (popup.closed) {
          clearInterval(ticker);
          console.log('Pop-up auth window closed');

          const token = OAuthToken.recover(ImplicitFlowPopup.localStorageKey);
          localStorage.removeItem(ImplicitFlowPopup.localStorageKey);

          if (!token) {
            // TODO: Make reject consistent
            reject()
          } else {
            console.log('Pop-up auth returned token');

            this.token = token;
            resolve(this.token);
          }
        }
      }, 500);
    });
  }
}
