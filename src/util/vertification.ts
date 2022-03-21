import * as argon2 from 'argon2';
export function vertificationPassword(
  existingHashedPassword: string,
  passwordToCompare: string,
) {
  return argon2.verify(existingHashedPassword, passwordToCompare);
}
