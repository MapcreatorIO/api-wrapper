// http://stackoverflow.com/a/40393932
export function getBaseClass(targetClass) {
  if (targetClass instanceof Function) {
    let baseClass = targetClass;

    while (baseClass) {
      const newBaseClass = Object.getPrototypeOf(baseClass);

      if (newBaseClass && newBaseClass !== Object && newBaseClass.name) {
        baseClass = newBaseClass;
      } else {
        break;
      }
    }

    return baseClass;
  } else {
    throw new TypeError();
  }
}

// http://stackoverflow.com/a/39828481
export function encodeQueryString(paramsObject) {
  return Object
    .keys(paramsObject)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`)
    .join('&');
}

