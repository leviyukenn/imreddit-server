import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth, google } from 'googleapis';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  oauthClient: Auth.OAuth2Client;
  constructor(private readonly configService: ConfigService) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET');

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async createUser(userInput: {
    username: string;
    password: string;
    email: string;
    role: UserRole;
  }): Promise<User> {
    return User.create(userInput).save();
  }

  async findByUserId(userId: string) {
    return User.findOne(userId);
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
    const user = await this.findByEmail(payload.email!);

    if (!user) {
      '_' + Math.random().toString(36).substr(2, 9);
    }

    // const accessToken = await this.oauthClient
    //   .getToken(authorizationCode)
    //   .catch((err) => console.log(err));
    // const tokenInfo = await this.oauthClient.getTokenInfo(authorizationCode);
    // console.log('accessToken:', accessToken);
    // console.log('tokenInfo', tokenInfo);
  }

  // async remove(id: string): Promise<void> {
  //   await this.usersRepository.delete(id);
  // }
}
