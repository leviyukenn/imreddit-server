import { ResponseErrorCode } from 'src/constant/errors';
import { createErrorResponse } from './createErrors';

export class InputParameterValidator {
  private fieldErrors: { field: string; errorCode: ResponseErrorCode }[];

  private constructor(
    fieldErrors: { field: string; errorCode: ResponseErrorCode }[],
  ) {
    this.fieldErrors = fieldErrors;
  }
  static object() {
    return new InputParameterValidator([]);
  }

  validateEmail(email: string) {
    if (!/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(email)) {
      this.fieldErrors.push({
        field: 'email',
        errorCode: ResponseErrorCode.ERR0005,
      });
    }
    return this;
  }

  validatePassword(password: string) {
    if (!/^\w+$/.test(password)) {
      this.fieldErrors.push({
        field: 'password',
        errorCode: ResponseErrorCode.ERR0006,
      });
    }
    return this;
  }

  validateUsername(username: string) {
    const field = 'username';
    if (!/^\w+$/.test(username)) {
      this.fieldErrors.push({
        field,
        errorCode: ResponseErrorCode.ERR0006,
      });
    }

    if (username.length < 3 || username.length > 20) {
      this.fieldErrors.push({
        field,
        errorCode: ResponseErrorCode.ERR0007,
      });
    }
    return this;
  }

  validateCommunityDescription(description: string) {
    const field = 'description';

    if (description.length > 300) {
      this.fieldErrors.push({
        field,
        errorCode: ResponseErrorCode.ERR0020,
      });
    }
    return this;
  }

  validateCommunityAppearanceColor(colorHex: string) {
    const field = 'color';
    const regex = /^#[0-9A-F]{6}$/i;

    if (!regex.test(colorHex)) {
      this.fieldErrors.push({
        field,
        errorCode: ResponseErrorCode.ERR0021,
      });
    }
    return this;
  }

  validatePostTitle(title: string) {
    if (title.length > 300) {
      this.fieldErrors.push({
        field: 'title',
        errorCode: ResponseErrorCode.ERR0022,
      });
    }
    return this;
  }

  validatePostText(title: string) {
    if (title.length > 40000) {
      this.fieldErrors.push({
        field: 'text',
        errorCode: ResponseErrorCode.ERR0023,
      });
    }
    return this;
  }

  isValid() {
    return this.fieldErrors.length === 0;
  }

  getErrorResponse() {
    return createErrorResponse(...this.fieldErrors);
  }
}
