export function isNode() {
  return typeof module !== 'undefined' && module.exports;
}
