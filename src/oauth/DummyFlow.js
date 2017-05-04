import OAuthError from './OAuthError';
import OAuth from './OAuth';

/**
 * Dummy flow for when the token should be available in the
 * cache and no attempt at authentication should be made.
 */
export default class DummyFlow extends OAuth {

  /**
   * Authenticate
   * @returns {Promise} - Promise resolves with {@link OAuthToken} and rejects with {@link OAuthError}
   */
  authenticate() {
    return new Promise((resolve, reject) => {
      if (this.authenticated) {
        resolve(this.token);
      } else {
        reject(new OAuthError('dummy_error', 'Attempted authentication using a dummy authenticator'));
      }
    });
  }
}
