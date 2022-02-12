import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';
import { Connection } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly configService: ConfigService,
    private connection: Connection,
  ) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET');

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async createUser(userInput: {
    username: string;
    password: string;
    email: string;
    avatar: string;
    role: UserRole;
  }): Promise<User> {
    return User.create(userInput).save();
  }

  async findByUserId(userId: string) {
    return User.findOne(userId);
  }

  async findAllUser() {
    return User.find();
  }

  async findByUserName(username: string): Promise<User | undefined> {
    return User.findOne({ username: username });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return User.findOne({ email: email });
  }

  async findByUsernameAndEmail(
    username: string,
    email: string,
  ): Promise<User | undefined> {
    return User.findOne({ username, email });
  }

  async updateUserPassword(userId: string, password: string) {
    return User.update(userId, { password });
  }

  async googleAuthenticate(idToken: string) {
    const ticket = await this.oauthClient.verifyIdToken({
      idToken,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) throw Error('invalid id token');
    let user = await this.findByEmail(payload.email!);

    if (user) return user;

    let userName = '';
    while (user) {
      //generate user name randomly
      userName = Math.random().toString(36).substr(2, 9);
      user = await this.findByUserName(userName);
    }

    user = await User.create({
      username: userName!,
      email: payload.email,
      isGoogleAuthentication: true,
    }).save();

    return user;
  }

  async updateUserAvatar(userId: string, avatar: string) {
    const result = await this.connection
      .createQueryBuilder()
      .update(User)
      .set({ avatar })
      .where('id = :userId', {
        userId,
      })
      .execute();

    return result.affected;
  }

  // async remove(id: string): Promise<void> {
  //   await this.usersRepository.delete(id);
  // }
}
