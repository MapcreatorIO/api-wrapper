import CrudBase from './base/CrudBase';

export default class JobShare extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.path = '/jobs/shares/{id}';
  }

  save() {
    throw new Error('Unsupported method JobShare::save');
  }
}
