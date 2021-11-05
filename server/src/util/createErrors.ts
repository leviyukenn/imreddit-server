import { ResponseErrorCode, responseErrorMessages } from 'src/constant/errors';
import { IFieldError } from 'src/response/response.dto';

export function createErrorResponse(
  ...fieldErrors: { field: string; errorCode: ResponseErrorCode }[]
): { errors: IFieldError[] } {
  return {
    errors: fieldErrors.map((fieldError) => {
      const message = responseErrorMessages.get(fieldError.errorCode);
      if (!message) {
        throw new Error('no correspond error message.');
      }
      return {
        ...fieldError,
        errorCode: ResponseErrorCode[fieldError.errorCode],
        message,
      };
    }),
  };
}
