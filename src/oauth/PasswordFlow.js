import OAuth from "./oauth";

export default class PasswordFlow extends OAuth {
  constructor(client_id, secret, username, password, scope = '') {
    super(client_id, scope);

    this.secret = secret;
    this.username = username;
    this.password = password;


  }

  authenticate() {
    return new Promise((resolve, reject) => {
      // Todo build request wrapper using promises
      const request = new XMLHttpRequest();
    });
  }
}