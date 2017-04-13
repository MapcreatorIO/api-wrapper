export class StaticClassError extends Error {
}

// http://stackoverflow.com/a/39828481
export function encodeQueryString(paramsObject) {
  return Object
    .keys(paramsObject)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`)
    .join('&');
}

/**
 *
 * @param parent Instance or Class
 * @param child Instance or Class
 * @returns {boolean}
 */
export function isParentOf(parent, child) {
  parent = typeof parent === 'function' ? parent : parent.constructor;
  child = typeof child === 'function' ? child : child.constructor;

  do {
    if (child.name === parent.name) {
      return true;
    }

    child = Object.getPrototypeOf(child);
  } while (child.name !== '');

  return false;
}

// http://stackoverflow.com/a/8809472
export function generateUUID() { // Public Domain/MIT
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/**
 *
 * @param url
 * @param method
 * @param body
 * @type body string
 * @param headers
 * @returns {Promise}
 */
export function makeRequest(url, method = 'GET', body = '', headers = {}) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    if (typeof body === 'object') {
      body = JSON.stringify(body);
    }

    const hasContentType = Object.keys(headers)
        .filter(x => x.toLowerCase() === 'content-type')
        .length > 0;

    request.open(method.toUpperCase(), url, true);

    if (body && !hasContentType) {
      request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }

    for (let key of Object.keys(headers)) {
      request.setRequestHeader(key, headers[key]);
    }

    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        if (request.status >= 200 && request.status < 300) {
          resolve(request);
        } else {
          reject(request);
        }
      }
    };

    if (body) {
      request.send(body);
    } else {
      request.send();
    }
  });
}
