import { FieldError } from 'src/response/response.dto';
import { RegisterInput } from '../dto/user.dto';

export function validateRegister(registerInput: RegisterInput) {
  if (!/^\w+$/.test(registerInput.username)) {
    return [
      {
        field: 'username',
        message:
          'Letters, numbers, underscores only. Please try again without symbols.',
      },
    ];
  } else if (!/^\w+$/.test(registerInput.password)) {
    return [
      {
        field: 'password',
        message:
          'Letters, numbers, underscores only. Please try again without symbols.',
      },
    ];
  } else if (
    !/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(registerInput.email)
  ) {
    return [
      {
        field: 'email',
        message: 'That email is invalid.',
      },
    ];
  }

  if (registerInput.username.length < 3 || registerInput.username.length > 20) {
    return [
      {
        field: 'username',
        message: 'Username must be between 3 and 20 characters',
      },
    ];
  }

  if (registerInput.password.length < 4) {
    return [
      {
        field: 'password',
        message: 'Password must be at least 4 characters long',
      },
    ];
  }
}
