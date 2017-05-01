/**
 * Makes a HTTP request and returns a promise. Promise will fail/reject if the
 * status code isn't 2XX.
 * @param {string} url - Target url
 * @param {string} method - HTTP method
 * @param {string|object<string, string>} body - raw body content or object to be json encoded
 * @param {object<string, string>} headers - headers
 * @param {string} responseType - XMLHttpRequest response type
 *
 * @returns {Promise} - resolves/rejects with XMLHttpRequest object. Rejects if status code != 2xx
 */
export function makeRequest(url, method = 'GET', body = '', headers = {}, responseType = '') {
  return new Promise((resolve, reject) => {
    method = method.toUpperCase();

    const request = new XMLHttpRequest();

    request.responseType = responseType;

    const hasContentType = Object.keys(headers)
        .filter(x => x.toLowerCase() === 'content-type')
        .length > 0;

    request.open(method, url, true);

    // Automatically detect possible content-type header
    if (typeof body === 'object' ) {
      body = JSON.stringify(body);

      if (!hasContentType) {
        headers['Content-Type'] = 'application/json';
      }
    } else if (body && !hasContentType) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    // Apply headers
    for (const key of Object.keys(headers)) {
      request.setRequestHeader(key, headers[key]);
    }

    request.onreadystatechange = () => {
      // State 4 === Done
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status >= 200 && request.status < 300) {
          resolve(request);
        } else {
          reject(request);
        }
      }
    };

    if (body && method !== 'GET') {
      request.send(body);
    } else {
      request.send();
    }
  });
}

/**
 * Encodes an object to a http query string
 * @param {object<string, string>} paramsObject - data to be encoded
 * @returns {string} - encoded http query string
 *
 * @see http://stackoverflow.com/a/39828481
 */
export function encodeQueryString(paramsObject) {
  return Object
    .keys(paramsObject)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`)
    .join('&');
}
