"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const users_service_1 = require("../users/users.service");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
let AuthService = class AuthService {
    usersService;
    jwtService;
    refreshTokenRepository;
    constructor(usersService, jwtService, refreshTokenRepository) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.usersService.validatePassword(user, loginDto.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
    async refresh(token) {
        const hashedToken = this.hashToken(token);
        const storedToken = await this.refreshTokenRepository.findOne({
            where: { token: hashedToken },
            relations: ['user'],
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (storedToken.expiresAt < new Date()) {
            await this.refreshTokenRepository.delete({ userId: storedToken.userId });
            throw new common_1.UnauthorizedException('Refresh token expired');
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
    async logout(userId) {
        await this.refreshTokenRepository.delete({ userId });
    }
    generateAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
        };
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '15m',
        });
    }
    async generateRefreshToken(userId) {
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
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map