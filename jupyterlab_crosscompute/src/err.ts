export class AutomationError {
  constructor(message = '', code = 0) {
    this.message = message;
    this.code = code;
  }

  message: string;
  code: number;
}
