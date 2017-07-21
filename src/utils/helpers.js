// it will have to wait for the first request :<
/**
 *
 * @param {Promise} promise - Promise that returns a {@link PaginatedResourceWrapper}
 * @param {?Number} [start=1] - Start page
 * @param {?Number} [stop] - Stop page
 * @returns {Promise}
 */
export function getPaginatedRange(promise, start = 1, stop) {
  return promise.then(page => {
    const out = page.data;
    const promises = [];

    // Handle defaults
    start = start || page.page;
    stop = stop || page.pageCount;

    return new Promise((resolve, reject) => {
      for (let i = start + 1; i <= stop; i++) {
        promises.push(page.get(i));
      }

      Promise.all(promises).then(rows => {
        rows.map(x => x.data).forEach(out.push);

        resolve(out);
      }, reject);
    });
  });
}
