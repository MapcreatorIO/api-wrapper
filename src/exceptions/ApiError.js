export default class ApiError {
  constructor(type, message, code) {
    this.type = type;
    this.message = message;
    this.code = code;
  }

  toString() {
    return `[${this.code}] ${this.type}: ${this.message}`;
  }
}
