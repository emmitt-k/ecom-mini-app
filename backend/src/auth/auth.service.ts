import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

export interface LoginResult extends AuthResponseDto {
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResult> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.refreshTokenRepository.delete({ userId: user.id });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async refresh(token: string): Promise<LoginResult> {
    const hashedToken = this.hashToken(token);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: hashedToken },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.delete({ userId: storedToken.userId });
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = storedToken.user;

    await this.refreshTokenRepository.delete({ userId: user.id });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }

  private generateAccessToken(user: { id: string; email: string }): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token: hashedToken,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return token;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
