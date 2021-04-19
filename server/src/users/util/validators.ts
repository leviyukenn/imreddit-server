import { FieldError } from 'src/response/response.dto';

export function validateEmail(email: string): FieldError[] {
  if (!/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(email)) {
    return [
      {
        field: 'email',
        message: 'That email is invalid.',
      },
    ];
  }
  return [];
}

export function validatePassword(password: string): FieldError[] {
  if (!/^\w+$/.test(password)) {
    return [
      {
        field: 'password',
        message:
          'Letters, numbers, underscores only. Please try again without symbols.',
      },
    ];
  }
  return [];
}

export function validateUsername(username: string): FieldError[] {
  if (!/^\w+$/.test(username)) {
    return [
      {
        field: 'username',
        message:
          'Letters, numbers, underscores only. Please try again without symbols.',
      },
    ];
  }

  if (username.length < 3 || username.length > 20) {
    return [
      {
        field: 'username',
        message: 'Username must be between 3 and 20 characters',
      },
    ];
  }
  return [];
}
