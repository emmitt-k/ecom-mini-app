import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepository: jest.Mocked<any>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedpassword',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
  };

  const mockRefreshTokenEntity = {
    id: 'refresh-token-id',
    userId: mockUser.id,
    token: 'hashed-token',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    user: mockUser,
  };

  beforeEach(async () => {
    refreshTokenRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-access-token'),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens and user on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'token-id' });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should delete existing refresh tokens before creating new ones', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'token-id' });

      await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
      // Verify delete is called before save
      expect(
        refreshTokenRepository.delete.mock.invocationCallOrder[0],
      ).toBeLessThan(refreshTokenRepository.save.mock.invocationCallOrder[0]);
    });

    it('should generate access token with correct payload', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'token-id' });

      await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      );
    });
  });

  describe('refresh', () => {
    it('should return new tokens on valid refresh token', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshTokenEntity);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'new-token-id' });

      const result = await service.refresh('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
    });

    it('should throw UnauthorizedException when refresh token not found', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      refreshTokenRepository.findOne.mockResolvedValue({
        ...mockRefreshTokenEntity,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should delete old refresh tokens and create new ones', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshTokenEntity);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'new-token-id' });

      await service.refresh('valid-token');

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
      // Verify delete is called before save
      expect(
        refreshTokenRepository.delete.mock.invocationCallOrder[0],
      ).toBeLessThan(refreshTokenRepository.save.mock.invocationCallOrder[0]);
    });

    it('should hash token before searching in database', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshTokenEntity);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'new-token-id' });

      const token = 'test-token-123';
      await service.refresh(token);

      const expectedHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      expect(refreshTokenRepository.findOne).toHaveBeenCalledWith({
        where: { token: expectedHash },
        relations: ['user'],
      });
    });

    it('should generate refresh token with 30 minute expiration', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshTokenEntity);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'new-token-id' });

      const beforeCall = new Date();
      await service.refresh('valid-token');
      const afterCall = new Date();

      const createdToken = refreshTokenRepository.create.mock.calls[0][0];
      expect(createdToken.expiresAt.getTime()).toBeGreaterThanOrEqual(
        beforeCall.getTime() + 30 * 60 * 1000 - 1000,
      );
      expect(createdToken.expiresAt.getTime()).toBeLessThanOrEqual(
        afterCall.getTime() + 30 * 60 * 1000 + 1000,
      );
    });
  });

  describe('logout', () => {
    it('should delete all refresh tokens for user', async () => {
      refreshTokenRepository.delete.mockResolvedValue({ affected: 1 });

      await service.logout(mockUser.id);

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should complete even if no tokens exist', async () => {
      refreshTokenRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.logout(mockUser.id)).resolves.not.toThrow();
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
    });

    it('should handle different user IDs', async () => {
      const differentUserId = 'different-user-id';
      refreshTokenRepository.delete.mockResolvedValue({ affected: 2 });

      await service.logout(differentUserId);

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        userId: differentUserId,
      });
    });
  });

  describe('token generation', () => {
    it('should generate unique refresh tokens each time', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'token-id' });

      // Execute login twice
      const result1 = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });
      const result2 = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Verify different tokens were generated (crypto.randomBytes is called internally)
      expect(result1.refreshToken).toBeDefined();
      expect(result2.refreshToken).toBeDefined();
      expect(result1.refreshToken).not.toBe(result2.refreshToken);
    });

    it('should hash tokens before storing', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshTokenEntity);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'token-id' });

      await service.refresh('valid-token');

      const createdToken = refreshTokenRepository.create.mock.calls[0][0];
      // Token should be hashed (64 chars = SHA-256 hex length)
      expect(createdToken.token).toBeDefined();
      expect(createdToken.token).toHaveLength(64); // SHA-256 hex length
    });

    it('should store refresh token with correct user association', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshTokenEntity);
      refreshTokenRepository.create.mockImplementation((dto) => dto);
      refreshTokenRepository.save.mockResolvedValue({ id: 'token-id' });

      await service.refresh('valid-token');

      const createdToken = refreshTokenRepository.create.mock.calls[0][0];
      expect(createdToken.userId).toBe(mockUser.id);
      expect(createdToken).toHaveProperty('token');
      expect(createdToken).toHaveProperty('expiresAt');
    });
  });

  describe('edge cases', () => {
    it('should handle empty email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: '', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle empty password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: '' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle very long refresh tokens', async () => {
      const longToken = 'a'.repeat(1000);
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh(longToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle special characters in refresh token', async () => {
      const specialToken = 'token!@#$%^&*()_+-=[]{}|;:,.<>?';
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh(specialToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle repository errors gracefully', async () => {
      usersService.findByEmail.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow('Database connection failed');
    });
  });
});
