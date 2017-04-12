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
    if(child.name === parent.name) {
      return true;
    }

    child = Object.getPrototypeOf(child);
  } while(child.name !== '');

  return false;
}