import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<SafeUser | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
  }

  login(user: Pick<SafeUser, 'id' | 'username'>) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, password: string, email?: string) {
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Este usuário já está em uso');
    }

    if (email) {
      const existingEmailUser = await this.usersService.findByEmail(email);
      if (existingEmailUser) {
        throw new ConflictException('Este email já está em uso');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await this.usersService.create({
      username,
      password: hashedPassword,
      email,
    });

    return this.login({ id: createdUser.id, username: createdUser.username });
  }
}
