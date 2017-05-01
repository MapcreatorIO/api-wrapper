import Notification from './Notification';
import CrudBase from './base/CrudBase';

export default class User extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/users/{id}';
  }

  notifications() {
    const url = `${this.url}/notifications`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(
          data.map(row => new Notification(this.api, row))
        ));
    });
  }

  ips() {
    const url = `${this.url}/ips`;

    return new Promise((resolve, reject) => {
      this.api.request(url)
        .catch(reject)
        .then(data => resolve(
          data.map(row => row['ip_address'])
        ));
    });
  }
}
