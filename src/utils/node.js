export function isNode() {
  // eslint-disable-next-line no-undef
  return typeof window === 'undefined' && typeof module !== 'undefined' && module.exports;
}
