export enum ResponseErrorCode {
  ERR0001,
  ERR0002,
  ERR0003,
  ERR0004,
  ERR0005,
  ERR0006,
  ERR0007,
  ERR0008,
  ERR0009,
  ERR0010,
  ERR0011,
  ERR0012,
  ERR0013,
  ERR0014,
  ERR0015,
  ERR0016,
  ERR0017,
  ERR0018,
  ERR0019,
  ERR0020,
  ERR0021,
  ERR0022,
  ERR0023,
  ERR0024,
  ERR0025,
  ERR0026,
  ERR0027,
  ERR0028,
  ERR0029,
  ERR0030,
  ERR0031,
  ERR0032,
  ERR0033,
  ERR0034,
  ERR0035,
  ERR0036,
  ERR0037,
  ERR0038,
}
export const responseErrorMessages = new Map<ResponseErrorCode, string>([
  [ResponseErrorCode.ERR0001, 'only accept image-type file'],
  [ResponseErrorCode.ERR0002, 'uploading image failed'],
  [ResponseErrorCode.ERR0003, 'That community name is already taken'],
  [ResponseErrorCode.ERR0004, 'Failed to create community'],
  [ResponseErrorCode.ERR0005, 'That email is invalid.'],
  [
    ResponseErrorCode.ERR0006,
    'Letters, numbers, underscores only. Please try again without symbols.',
  ],
  [ResponseErrorCode.ERR0007, 'Username must be between 3 and 20 characters'],
  [ResponseErrorCode.ERR0008, 'The token has been expired.'],
  [ResponseErrorCode.ERR0009, 'User no longer exits.'],
  [ResponseErrorCode.ERR0010, 'That username is already taken'],
  [ResponseErrorCode.ERR0011, 'That email is already registered'],
  [ResponseErrorCode.ERR0012, "that username doesn't exists"],
  [ResponseErrorCode.ERR0013, 'incorrect password'],
  [ResponseErrorCode.ERR0014, 'No such community.'],
  [
    ResponseErrorCode.ERR0015,
    'This account is authenticated by google. Please login with google account.',
  ],
  [ResponseErrorCode.ERR0016, 'Invalid google authentication id token.'],
  [ResponseErrorCode.ERR0017, 'Invalid user.'],
  [ResponseErrorCode.ERR0018, 'Failed to join the community.'],
  [ResponseErrorCode.ERR0019, 'Failed to save community settings.'],
  [
    ResponseErrorCode.ERR0020,
    'Community description must be less than 300 characters',
  ],
  [ResponseErrorCode.ERR0021, 'Invalid color format.'],
  [ResponseErrorCode.ERR0022, 'Post title must be less than 300 characters'],
  [ResponseErrorCode.ERR0023, 'Post text must be less than 40000 characters'],
  [ResponseErrorCode.ERR0024, 'Not the member of that community.'],
  [ResponseErrorCode.ERR0025, 'Post no longer exits.'],
  [ResponseErrorCode.ERR0026, 'Not the creator of that post.'],
  [ResponseErrorCode.ERR0027, 'Failed to delete that post.'],
  [ResponseErrorCode.ERR0028, 'Failed to update avatar of user.'],
  [ResponseErrorCode.ERR0029, 'No such user.'],
  [ResponseErrorCode.ERR0030, 'Please login first.'],
  [ResponseErrorCode.ERR0031, 'User about must be less than 300 characters'],
  [ResponseErrorCode.ERR0032, 'Failed to save user settings.'],
  [ResponseErrorCode.ERR0033, 'Not the moderator of that community'],
  [ResponseErrorCode.ERR0034, 'Invalid post status.'],
  [ResponseErrorCode.ERR0035, 'Failed to update post status of that post.'],
  [ResponseErrorCode.ERR0036, 'Internal server Error.'],
  [ResponseErrorCode.ERR0037, 'Failed to upvote.'],
  [ResponseErrorCode.ERR0038, 'Failed to leave the community.'],
]);
