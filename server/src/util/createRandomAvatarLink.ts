import * as argon2 from 'argon2';
const avatarApi = 'https://avatars.dicebear.com/api/adventurer';

export async function createRandomAvatar(seed: string) {
  const hashedSeed = await argon2.hash(seed);
  return avatarApi + `/${hashedSeed}.svg?flip=true`;
}
