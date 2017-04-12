export default class OAuthToken {
  constructor(token, type, expires) {
    this.token = token;
    this.type = type;

    if (typeof expires === 'number') {
      // Expires is in seconds
      this.expires = new Date(Date.now() + (expires * 1000));
    } else if (expires instanceof Date) {
      this.expires = expires;
    } else {
      throw new TypeError('Expires not of type Date or Number');
    }
  }

  toString() {
    return `${this.type} ${this.token}`;
  }

  get expired() {
    return new Date() > this.expires;
  }

  static get storageName() {
    return 'maps4news_oauth';
  }

  static fromResponseObject(data) {
    if(typeof data === 'string') {
      data = JSON.parse(data);
    }

    return new OAuthToken(
      data['access_token'],
      data['token_type'],
      Number(data['expires_in'])
    )
  }

  save() {
    const data = {
      token: this.token,
      type: this.type,
      expires: this.expires.toUTCString()
    };

    if (window.location.protocol === "https:") {
      console.log('Storing session as https cookie');

      const dataEncoded = encodeURIComponent(JSON.stringify(data));
      document.cookie = `${OAuthToken.storageName}=${dataEncoded}; expires=${this.expires.toUTCString()}`;
    } else {
      console.log('Storing session in localStorage');

      localStorage.setItem(OAuthToken.storageName, JSON.stringify(data));
    }
  }

  static recover() {
    // Cookie
    if (window.location.protocol === "https:") {
      const cookies = `; ${document.cookie}`;
      const parts = cookies.split(`; ${OAuthToken.storageName}=`);
      if (parts.length === 2) {
        const raw = decodeURIComponent(parts[1].split(";")[0]);
        const data = JSON.parse(raw);

        console.log('Recovered session from https cookie');

        return new OAuthToken(data.token, data.type, new Date(data.expires));
      }
    }

    // LocalStorage
    const raw = localStorage.getItem(OAuthToken.storageName);
    if (raw) {
      const data = JSON.parse(raw);

      const instance = new OAuthToken(data.token, data.type, new Date(data.expires));

      if (!instance.expired) {
        console.log('Recovered session from localStorage');

        return instance;
      }
    }

    console.log('Could not recover session from https cookie or localStorage');
    return null;
  }
}
