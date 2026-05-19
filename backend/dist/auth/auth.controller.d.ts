import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
interface RequestWithCookies extends Request {
    cookies: {
        refreshToken?: string;
    };
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, response: Response): Promise<AuthResponseDto>;
    refresh(request: RequestWithCookies, response: Response): Promise<AuthResponseDto>;
    logout(userId: string, response: Response): Promise<void>;
    private setRefreshTokenCookie;
}
export {};
