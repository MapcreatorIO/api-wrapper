/**
 * Simple logger implementation
 */
export default class Logger {
  /**
   * Create a Logger instance
   * @param {string} [logLevel=warn] - Log level
   */
  constructor(logLevel = 'warn') {
    this.logLevel = logLevel;
  }

  /**
   * Get available log levels
   * @returns {Array<string>} - Log levels
   */
  getLogLevels() {
    return [
      'debug',
      'info',
      'warn',
      'error',
      'none',
    ];
  }

  /**
   * Log a message
   * @param {string} message - Message to be logged
   * @param {string} level - Log level
   * @returns {void}
   */
  log(message, level = 'info') {
    if (level === 'none') {
      return;
    }

    if (this._shouldLog(level)) {
      // eslint-disable-next-line no-console
      console[level](message);
    }
  }

  /**
   * Log a debug message
   * @param {string} message - Message to be logged
   * @returns {void}
   */
  debug(message) {
    this.log(message, 'debug');
  }

  /**
   * Log an informative message
   * @param {string} message - Message to be logged
   * @returns {void}
   */
  info(message) {
    this.log(message, 'info');
  }

  /**
   * Log a warning message
   * @param {string} message - Message to be logged
   * @returns {void}
   */
  warn(message) {
    this.log(message, 'warn');
  }

  /**
   * Log an error message
   * @param {string} message - Message to be logged
   * @returns {void}
   */
  error(message) {
    this.log(message, 'error');
  }

  /**
   * Get the current log level
   * @returns {string} - Log level
   */
  get logLevel() {
    return this._logLevel;
  }

  /**
   * Set the current log level
   * @param {string} value - Log level
   * @see Logger#getLogLevels
   */
  set logLevel(value) {
    value = value.toLowerCase();

    if (!this.getLogLevels().includes(value)) {
      throw new TypeError(`Expected one of ${this.getLogLevels().join(', ')}. Got ${value}`);
    }

    this._logLevel = value;
  }

  _shouldLog(level) {
    const logLevels = this.getLogLevels();

    const targetLevel = logLevels.findIndex(x => x === level);
    const currentLevel = logLevels.findIndex(x => x === this.logLevel);

    return targetLevel >= currentLevel;
  }
}
