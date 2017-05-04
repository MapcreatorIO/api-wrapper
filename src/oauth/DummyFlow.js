import OAuthError from './OAuthError';
import OAuth from './OAuth';

export default class DummyFlow extends OAuth {

  /**
   * Authenticate
   * @returns {Promise} - Always rejects with OAuthError
   */
  authenticate() {
    return new Promise((resolve, reject) => {
      reject(new OAuthError('dummy_error', 'Attempted authentication using a dummy authenticator'));
    });
  }
}
