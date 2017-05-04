import {encodeQueryString} from './utils/requests';
import {isParentOf} from './utils/reflection';
import Maps4News from './Maps4News';

export default class PaginatedResourceListing {
  constructor(api, route, Target, page = 1, pageCount = null, rowCount = 0, data = {}) {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    this.api = api;
    this.route = route;
    this.Target = Target;

    this._data = data;
    this._page = page;
    this._rows = rowCount;
    this._pageCount = pageCount;
  }

  static get headerPrefix() {
    return 'X-Paginate-';
  }

  get page() {
    return this._page;
  }

  get pageCount() {
    return this._pageCount;
  }

  get data() {
    return this._data;
  }

  get rows() {
    return this._rows;
  }

  getPage(page, perPage = 12) {
    page = Math.max(1, page);

    if (this.pageCount) {
      page = Math.min(this.pageCount, page);
    }

    const query = {page};

    if (perPage) {
      query['per_page'] = Math.max(1, perPage);
    }

    const url = `${this.route}?${encodeQueryString(query)}`;

    return new Promise((resolve, reject) => {
      this.api.request(url, 'GET', {}, {}, '', true)
        .then(request => {
          const response = JSON.parse(request.responseText);
          const rowCount = Number(request.getResponseHeader(PaginatedResourceListing.headerPrefix + 'Total'));
          const totalPages = Number(request.getResponseHeader(PaginatedResourceListing.headerPrefix + 'Pages'));

          const instance = new PaginatedResourceListing(
            this.api, this.route,
            this.Target, page,
            totalPages, rowCount,
            response.data.map(row => new this.Target(this.api, row))
          );

          resolve(instance, request);
        }).catch(reject);
    });
  }

  hasNext() {
    return this.page < this.pageCount;
  }

  hasPrevious() {
    return this.page > 1;
  }

  next() {
    return this.getPage(this.page + 1);
  }

  previous() {
    return this.getPage(this.page - 1);
  }
}
