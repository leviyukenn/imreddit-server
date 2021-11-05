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
      return new InputParameterValidator([
        ...this.fieldErrors,
        {
          field: 'input parameter: email',
          errorCode: ResponseErrorCode.ERR0005,
        },
      ]);
    }
    return new InputParameterValidator(this.fieldErrors);
  }

  validatePassword(password: string) {
    if (!/^\w+$/.test(password)) {
      return new InputParameterValidator([
        ...this.fieldErrors,
        {
          field: 'input parameter: password',
          errorCode: ResponseErrorCode.ERR0006,
        },
      ]);
    }
    return new InputParameterValidator(this.fieldErrors);
  }

  validateUsername(username: string) {
    const field = 'input parameter: username';
    if (!/^\w+$/.test(username)) {
      return new InputParameterValidator([
        ...this.fieldErrors,
        {
          field,
          errorCode: ResponseErrorCode.ERR0006,
        },
      ]);
    }

    if (username.length < 3 || username.length > 20) {
      return new InputParameterValidator([
        ...this.fieldErrors,
        {
          field,
          errorCode: ResponseErrorCode.ERR0007,
        },
      ]);
    }
    return new InputParameterValidator(this.fieldErrors);
  }

  isValid() {
    return this.fieldErrors.length === 0 ? true : false;
  }

  getErrorResponse() {
    return createErrorResponse(...this.fieldErrors);
  }
}
