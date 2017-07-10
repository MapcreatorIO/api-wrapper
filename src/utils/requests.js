/**
 * Makes a HTTP request and returns a promise. Promise will fail/reject if the
 * status code isn't 2XX.
 * @param {string} url - Target url
 * @param {string} method - HTTP method
 * @param {string|object<string, string>} body - raw body content or object to be json encoded
 * @param {object<string, string>} headers - headers
 * @param {string} responseType - XMLHttpRequest response type
 *
 * @returns {Promise} - resolves/rejects with {@link XMLHttpRequest} object. Rejects if status code != 2xx
 * @protected
 */
export function makeRequest(url, method = 'GET', body = '', headers = {}, responseType = '') {
  return new Promise((resolve, reject) => {
    method = method.toUpperCase();

    const request = new XMLHttpRequest();

    request.responseType = responseType;

    function hasHeader(h) {
      return Object.keys(headers)
        .filter(x => x.toLowerCase() === h.toLowerCase())
        .length > 0;
    }

    request.open(method, url, true);

    // Automatically detect possible content-type header
    if (typeof body === 'object') {
      body = JSON.stringify(body);

      if (!hasHeader('Content-Type')) {
        headers['Content-Type'] = 'application/json';
      }
    } else if (body && !hasHeader('Content-Type')) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (!hasHeader('Accept')) {
      headers['Accept'] = 'application/json';
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
 * Encodes an object to a http query string with support for recursion
 * @param {object<string, *>} paramsObject - data to be encoded
 * @returns {string} - encoded http query string
 *
 * @protected
 */
export function encodeQueryString(paramsObject) {
  return _encodeQueryString(paramsObject);
}

/**
 * Encodes an object to a http query string with support for recursion
 * @param {Object<string, *>} paramsObject - data to be encoded
 * @param {Array<string>} _basePrefix - Used internally for tracking recursion
 * @returns {string} - encoded http query string
 *
 * @see http://stackoverflow.com/a/39828481
 * @private
 */
function _encodeQueryString(paramsObject, _basePrefix = []) {
  return Object
    .keys(paramsObject)
    .map(key => {
      const prefix = _basePrefix.slice(0);

      if (typeof paramsObject[key] === 'object') {
        prefix.push(key);

        return _encodeQueryString(paramsObject[key], prefix);
      }

      prefix.push(key);

      let out = '';

      out += encodeURIComponent(prefix.shift()); // main key
      out += prefix.map(item => `[${encodeURIComponent(item)}]`).join(''); // optional array keys
      out += '=' + encodeURIComponent(paramsObject[key]); // value

      return out;
    }).join('&');
}
