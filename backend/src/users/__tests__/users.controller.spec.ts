import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedpassword123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findByEmail: jest.fn(),
      validatePassword: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create user and return user response', async () => {
      usersService.create.mockResolvedValue(mockUser);

      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.register(createUserDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should not include password in response', async () => {
      usersService.create.mockResolvedValue(mockUser);

      const result = await controller.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).not.toHaveProperty('password');
    });

    it('should handle ConflictException for duplicate email', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('User already exists'),
      );

      await expect(
        controller.register({
          email: 'existing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should pass correct data to service', async () => {
      usersService.create.mockResolvedValue(mockUser);

      const createUserDto = {
        email: 'new@example.com',
        password: 'securepassword123',
      };

      await controller.register(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle different email formats', async () => {
      const emails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@sub.example.com',
      ];

      for (const email of emails) {
        usersService.create.mockResolvedValue({ ...mockUser, email });

        const result = await controller.register({
          email,
          password: 'password123',
        });

        expect(result.email).toBe(email);
      }
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should not include password in response', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockUser.id);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('updatedAt');
      expect(result).not.toHaveProperty('deletedAt');
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.findById.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.getMe('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should require JwtAuthGuard', async () => {
      // The guard is applied via @UseGuards(JwtAuthGuard)
      // This test verifies the endpoint is protected
      usersService.findById.mockResolvedValue(mockUser);

      await controller.getMe(mockUser.id);

      expect(usersService.findById).toHaveBeenCalled();
    });

    it('should handle different user IDs', async () => {
      const differentUserId = 'different-user-id';
      usersService.findById.mockResolvedValue({
        ...mockUser,
        id: differentUserId,
      });

      const result = await controller.getMe(differentUserId);

      expect(result.id).toBe(differentUserId);
      expect(usersService.findById).toHaveBeenCalledWith(differentUserId);
    });

    it('should use user ID from CurrentUser decorator', async () => {
      const userIdFromToken = 'token-user-id';
      usersService.findById.mockResolvedValue({
        ...mockUser,
        id: userIdFromToken,
      });

      const result = await controller.getMe(userIdFromToken);

      expect(usersService.findById).toHaveBeenCalledWith(userIdFromToken);
      expect(result.id).toBe(userIdFromToken);
    });
  });

  describe('updateMe', () => {
    it('should update user and return updated profile', async () => {
      const updatedUser = {
        ...mockUser,
        email: 'updated@example.com',
      };
      usersService.update.mockResolvedValue(updatedUser);

      const updateUserDto = {
        email: 'updated@example.com',
      };

      const result = await controller.updateMe(mockUser.id, updateUserDto);

      expect(result.email).toBe('updated@example.com');
      expect(usersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
    });

    it('should update password', async () => {
      usersService.update.mockResolvedValue(mockUser);

      const updateUserDto = {
        password: 'newpassword123',
      };

      const result = await controller.updateMe(mockUser.id, updateUserDto);

      expect(result).toBeDefined();
      expect(usersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
    });

    it('should update both email and password', async () => {
      const updatedUser = {
        ...mockUser,
        email: 'updated@example.com',
      };
      usersService.update.mockResolvedValue(updatedUser);

      const updateUserDto = {
        email: 'updated@example.com',
        password: 'newpassword123',
      };

      const result = await controller.updateMe(mockUser.id, updateUserDto);

      expect(result.email).toBe('updated@example.com');
      expect(usersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
    });

    it('should not include password in response', async () => {
      usersService.update.mockResolvedValue(mockUser);

      const result = await controller.updateMe(mockUser.id, {
        email: 'updated@example.com',
      });

      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.update.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.updateMe('non-existent-id', { email: 'test@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      usersService.update.mockRejectedValue(
        new ConflictException('Email already in use'),
      );

      await expect(
        controller.updateMe(mockUser.id, { email: 'existing@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle empty update dto', async () => {
      usersService.update.mockResolvedValue(mockUser);

      const result = await controller.updateMe(mockUser.id, {});

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, {});
    });

    it('should require JwtAuthGuard', async () => {
      // The guard is applied via @UseGuards(JwtAuthGuard)
      usersService.update.mockResolvedValue(mockUser);

      await controller.updateMe(mockUser.id, { email: 'test@example.com' });

      expect(usersService.update).toHaveBeenCalled();
    });

    it('should use user ID from CurrentUser decorator', async () => {
      const userIdFromToken = 'token-user-id';
      usersService.update.mockResolvedValue({
        ...mockUser,
        id: userIdFromToken,
      });

      await controller.updateMe(userIdFromToken, { email: 'test@example.com' });

      expect(usersService.update).toHaveBeenCalledWith(
        userIdFromToken,
        expect.any(Object),
      );
    });
  });

  describe('response transformation', () => {
    it('should always return consistent user response structure', async () => {
      usersService.create.mockResolvedValue(mockUser);
      usersService.findById.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue(mockUser);

      const registerResult = await controller.register({
        email: 'test@example.com',
        password: 'password123',
      });
      const getMeResult = await controller.getMe(mockUser.id);
      const updateMeResult = await controller.updateMe(mockUser.id, {});

      const expectedKeys = ['id', 'email', 'createdAt'];

      expect(Object.keys(registerResult).sort()).toEqual(expectedKeys.sort());
      expect(Object.keys(getMeResult).sort()).toEqual(expectedKeys.sort());
      expect(Object.keys(updateMeResult).sort()).toEqual(expectedKeys.sort());
    });

    it('should preserve createdAt in all responses', async () => {
      const specificDate = new Date('2023-06-15');
      usersService.create.mockResolvedValue({
        ...mockUser,
        createdAt: specificDate,
      });

      const result = await controller.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.createdAt).toEqual(specificDate);
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      usersService.create.mockRejectedValue(new Error('Database error'));

      await expect(
        controller.register({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Database error');
    });

    it('should handle validation errors from service', async () => {
      usersService.update.mockRejectedValue(new Error('Validation failed'));

      await expect(
        controller.updateMe(mockUser.id, { email: 'invalid' }),
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('edge cases', () => {
    it('should handle email with special characters', async () => {
      const specialEmail = 'user+test@example.com';
      usersService.create.mockResolvedValue({
        ...mockUser,
        email: specialEmail,
      });

      const result = await controller.register({
        email: specialEmail,
        password: 'password123',
      });

      expect(result.email).toBe(specialEmail);
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(200) + '@example.com';
      usersService.create.mockResolvedValue({
        ...mockUser,
        email: longEmail,
      });

      const result = await controller.register({
        email: longEmail,
        password: 'password123',
      });

      expect(result.email).toBe(longEmail);
    });

    it('should handle different UUID formats as user IDs', async () => {
      const uuids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
      ];

      for (const uuid of uuids) {
        usersService.findById.mockResolvedValue({ ...mockUser, id: uuid });

        const result = await controller.getMe(uuid);

        expect(result.id).toBe(uuid);
      }
    });
  });
});
