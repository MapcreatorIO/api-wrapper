import {encodeQueryString} from './utils/requests';
import {isParentOf} from './utils/reflection';
import Maps4News from './Maps4News';

/**
 * Proxy for accessing paginated resources
 */
export default class PaginatedResourceListing {
  /**
   * @param {Maps4News} api - Instance of the api
   * @param {String} route - Resource route
   * @param {ResourceBase} Target - Wrapper target
   * @param {Number} page - Page number
   * @param {Number} perPage - Amount of items per page
   * @param {Number} pageCount - Resolved page count
   * @param {Number} rowCount - Resolved rowCount
   * @param {Array<ResourceBase>} data - Resolved data
   * @private
   */
  constructor(api, route, Target, page = 1, perPage = 12, pageCount = null, rowCount = 0, data = []) {
    if (!isParentOf(Maps4News, api)) {
      throw new TypeError('Expected api to be of type Maps4News');
    }

    this._api = api;
    this._route = route;
    this._Target = Target;

    this._data = data;
    this._page = page;
    this._perPage = perPage;
    this._rows = rowCount;
    this._pageCount = pageCount;
  }

  /**
   * Pagination header prefix
   * @returns {String} - Header prefix
   */
  static get headerPrefix() {
    return 'X-Paginate-';
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Target route
   * @returns {String} - url
   */
  get route() {
    return this._route;
  }

  /**
   * Target to wrap results in
   * @returns {ResourceBase} - Target constructor
   * @constructor
   */
  get Target() {
    return this._Target;
  }

  /**
   * Current page number
   * @returns {Number} - Current page
   */
  get page() {
    return this._page;
  }

  /**
   * Maximum amount of items per page
   * @returns {Number} - Amount of items
   */
  get perPage() {
    return this._perPage;
  }

  /**
   * Amount of pages available
   * @returns {Number} - Page count
   */
  get pageCount() {
    return this._pageCount;
  }

  /**
   * Page data
   * @returns {Array<ResourceBase>} - Wrapped data
   */
  get data() {
    return this._data;
  }

  /**
   * Row count
   * @returns {Number} - Row count
   */
  get rows() {
    return this._rows;
  }

  /**
   * Get target page
   * @param {Number} page - Page number
   * @param {Number} perPage - Amount of items per page (max 50)
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link OAuthError}
   */
  getPage(page, perPage = this.perPage) {
    page = Math.max(1, page);
    page = Math.min(50, page);

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
            this._Target, page, perPage,
            totalPages, rowCount,
            response.data.map(row => new this._Target(this.api, row))
          );

          resolve(instance, request);
        }).catch(reject);
    });
  }

  /**
   * Test if there is a next page
   * @returns {boolean} - If there is a next page
   */
  get hasNext() {
    return this.page < this.pageCount;
  }

  /**
   * Test if there is a previous page
   * @returns {boolean} - If there is a previous page
   */
  get hasPrevious() {
    return this.page > 1;
  }

  /**
   * Get next page
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link OAuthError}
   */
  next() {
    return this.getPage(this.page + 1);
  }

  /**
   * Get previous page
   * @returns {Promise} - Resolves with {@link PaginatedResourceListing} instance and rejects with {@link OAuthError}
   */
  previous() {
    return this.getPage(this.page - 1);
  }
}
