/**
 * Get all the pages from a {@link PaginatedResourceListing} or a range
 * @param {Promise<PaginatedResourceListing>|PaginatedResourceListing} page - Promise that returns a {@link PaginatedResourceWrapper}
 * @param {?Number} [start=1] - Start page
 * @param {?Number} [stop] - Stop page
 * @returns {Promise<Array<ResourceBase>>} - Resolves with an {@link Array} containing {@link PaginatedResourceListing} instance and rejects with {@link ApiError}
 * @example
 * const first = api.users.list();
 *
 * getPaginatedRange(promise).then(data => {
 *    data.map(row => `[${row.id}] ${row.name}`) // We just want the names
 *        .forEach(console.log) // Log the names and ids of every user
 * })
 */
export function getPaginatedRange(page, start = 1, stop) {
  // Resolve promise if any
  if (page instanceof Promise) {
    return page.then(res => getPaginatedRange(res, start, stop));
  }

  const out = page.data;
  const promises = [];

  // Handle defaults
  start = start || page.page;
  stop = stop || page.pageCount;

  if (start === page.page) {
    start++;
  }

  return new Promise((resolve, reject) => {
    // Get all pages
    for (let i = start; i <= stop; i++) {
      promises.push(page.get(i));
    }

    // Resolve
    Promise.all(promises).then(rows => {
      rows.map(x => x.data).forEach(out.push);

      resolve(out);
    }, reject);
  });
}
