/* eslint-disable no-trailing-spaces */
/**
 * Used for wrapping {@link PaginatedResourceListing} to make it spa friendly
 */
export default class PaginatedResourceWrapper {
  /**
   *
   * @param {PaginatedResourceListing} listing - Listing result
   * @param {Maps4News} api - Instance of the api
   * @param {Boolean} cacheEnabled - If the pagnation cache should be used
   * @param {Number} cacheTime - Amount of seconds to store a value in cache
   */
  constructor(listing, api = listing.api, cacheEnabled = api.defaults.cacheEnabled, cacheTime = api.defaults.cacheSeconds) {
    this.api = api;
    this._history = [listing];

    this.cacheEnabled = cacheEnabled;
    this.cacheTime = cacheTime;
  }

  /**
   * @todo
   */
  next() {

  }

  get history() {
    return this._history;
  }
}
