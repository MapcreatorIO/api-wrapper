export function snakeToCamelCase(str) {
  return str.replace(/(?:(_[a-z\d]))/g, x => x[1].toUpperCase());
}

export function camelToSnakeCase(str) {
  return str.replace(/([A-Z])/g, x => '_' + x.toLowerCase());
}
