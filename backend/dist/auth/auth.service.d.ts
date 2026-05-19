import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
export interface LoginResult extends AuthResponseDto {
    refreshToken: string;
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly refreshTokenRepository;
    constructor(usersService: UsersService, jwtService: JwtService, refreshTokenRepository: Repository<RefreshToken>);
    login(loginDto: LoginDto): Promise<LoginResult>;
    refresh(token: string): Promise<LoginResult>;
    logout(userId: string): Promise<void>;
    private generateAccessToken;
    private generateRefreshToken;
    private hashToken;
}
