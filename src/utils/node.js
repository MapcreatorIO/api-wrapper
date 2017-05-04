export function isNode() {
  return typeof window === 'undefined' && typeof module !== 'undefined' && module.exports;
}
