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

    if(typeof body === 'object') {
      body = JSON.stringify(body);
    }

    request.open(method.toUpperCase(), url, true);

    if (body) {
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    for(let key of Object.keys(headers)) {
      request.setRequestHeader(key, headers[key]);
    }

    request.onreadystatechange = () => {
      if(request.readyState === 4) {
        if(request.status >= 200 && request.status < 300) {
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