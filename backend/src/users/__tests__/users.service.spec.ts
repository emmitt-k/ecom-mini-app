import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

type MockRepository<T = unknown> = {
  [P in keyof Repository<T>]: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: MockRepository<User>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedpassword123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as MockRepository<User>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
      };

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((dto: unknown) => dto);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
      };

      await service.create(createUserDto);

      const createdUser = mockUserRepository.create.mock.calls[0]?.[0] as
        | { password: string }
        | undefined;
      expect(createdUser?.password).not.toBe(createUserDto.password);
      expect(createdUser?.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle different email formats', async () => {
      const emails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@sub.example.com',
      ];

      for (const email of emails) {
        mockUserRepository.findOne.mockResolvedValue(null);
        mockUserRepository.create.mockReturnValue({ ...mockUser, email });
        mockUserRepository.save.mockResolvedValue({ ...mockUser, email });

        const result = await service.create({ email, password: 'password123' });
        expect(result.email).toBe(email);
      }
    });

    it('should preserve email case sensitivity', async () => {
      const mixedCaseEmail = 'User@Example.COM';
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        email: mixedCaseEmail,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: mixedCaseEmail,
      });

      const result = await service.create({
        email: mixedCaseEmail,
        password: 'password123',
      });

      expect(result.email).toBe(mixedCaseEmail);
    });

    it('should handle long passwords', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((dto: unknown) => dto);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const longPassword = 'a'.repeat(100);
      await service.create({
        email: 'test@example.com',
        password: longPassword,
      });

      const createdUser = mockUserRepository.create.mock.calls[0]?.[0] as { password: string } | undefined;
      expect(createdUser?.password).not.toBe(longPassword);
      expect(createdUser?.password).toMatch(/^\$2[aby]\$\d+\$/);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should search with exact email match', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await service.findByEmail('specific@example.com');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'specific@example.com' },
      });
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle valid UUID format', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        id: validUuid,
      });

      const result = await service.findById(validUuid);

      expect(result.id).toBe(validUuid);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const user = {
        ...mockUser,
        password: await bcrypt.hash('correctpassword', 10),
      };

      const result = await service.validatePassword(user, 'correctpassword');

      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const user = {
        ...mockUser,
        password: await bcrypt.hash('correctpassword', 10),
      };

      const result = await service.validatePassword(user, 'wrongpassword');

      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      const user = { ...mockUser, password: await bcrypt.hash('password', 10) };

      const result = await service.validatePassword(user, '');

      expect(result).toBe(false);
    });

    it('should handle bcrypt comparison errors gracefully', async () => {
      const user = { ...mockUser, password: 'invalid-hash-format' };

      // bcrypt.compare returns false for invalid hashes instead of throwing
      const result = await service.validatePassword(user, 'password');

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update user email', async () => {
      const updatedUser = { ...mockUser, email: 'updated@example.com' };
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // findById call
        .mockResolvedValueOnce(null); // check for existing email
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, {
        email: 'updated@example.com',
      });

      expect(result.email).toBe('updated@example.com');
    });

    it('should update user password', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.update(mockUser.id, {
        password: 'newpassword123',
      });

      expect(result.password).not.toBe('newpassword123');
      expect(result.password).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should update both email and password', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.update(mockUser.id, {
        email: 'updated@example.com',
        password: 'newpassword123',
      });

      expect(result.email).toBe('updated@example.com');
      expect(result.password).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { email: 'test@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new email already exists', async () => {
      const existingUser = {
        ...mockUser,
        id: 'different-id',
        email: 'existing@example.com',
      };
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // findById
        .mockResolvedValueOnce(existingUser); // check email exists

      await expect(
        service.update(mockUser.id, { email: 'existing@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow keeping same email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.update(mockUser.id, {
        email: mockUser.email,
      });

      expect(result.email).toBe(mockUser.email);
    });

    it('should not modify password if not provided', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.update(mockUser.id, {});

      expect(result.password).toBe(mockUser.password);
    });

    it('should handle empty update dto', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );

      const result = await service.update(mockUser.id, {});

      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
    });
  });

  describe('edge cases', () => {
    it('should handle repository errors gracefully', async () => {
      mockUserRepository.findOne.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findById(mockUser.id)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle email with special characters', async () => {
      const specialEmail = 'user+test.special@example.co.uk';
      mockUserRepository.findOne.mockResolvedValue(null);

      await service.findByEmail(specialEmail);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: specialEmail },
      });
    });

    it('should handle password with special characters', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((dto: unknown) => dto);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const specialPassword = 'P@$$w0rd!#$%^&*()';
      await service.create({
        email: 'test@example.com',
        password: specialPassword,
      });

      const createdUser = mockUserRepository.create.mock.calls[0]?.[0] as { password: string } | undefined;
      expect(createdUser?.password).not.toBe(specialPassword);
      // Verify bcrypt can still validate it
      if (createdUser?.password) {
        const isValid = await bcrypt.compare(
          specialPassword,
          createdUser.password,
        );
        expect(isValid).toBe(true);
      }
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(200) + '@example.com';
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        email: longEmail,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: longEmail,
      });

      const result = await service.create({
        email: longEmail,
        password: 'password123',
      });

      expect(result.email).toBe(longEmail);
    });
  });
});
