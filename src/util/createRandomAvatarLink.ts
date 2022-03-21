import * as argon2 from 'argon2';
const avatarApi = 'https://avatars.dicebear.com/api/adventurer';

export async function createRandomAvatar(seed: string) {
  return avatarApi + `/${seed}.svg?flip=true&radius=50`;
}

export async function createRandomAvatarWithHashedSeed(seed: string) {
  const hashedSeed = await argon2.hash(seed);
  return avatarApi + `/${hashedSeed}.svg?flip=true&radius=50`;
}
