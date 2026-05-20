import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp } from './setup';

describe('Auth Integration', () => {
  let app: INestApplication;
  let refreshToken: string;
  let accessToken: string;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const context = await setupTestApp();
    app = context.app;

    // Register a test user for auth tests
    await request(app.getHttpServer())
      .post('/users')
      .send(testUser)
      .expect(201);
  });

  afterAll(async () => {
    await teardownTestApp({ app });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials and return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');

      // Store tokens for later tests
      accessToken = response.body.accessToken;

      // Check refresh token cookie
      const cookies = response.headers['set-cookie'] as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie) => cookie.includes('refreshToken='))).toBe(
        true,
      );
      expect(
        cookies.some((cookie) => cookie.includes('HttpOnly')),
      ).toBe(true);

      // Extract refresh token from cookie
      const refreshCookie = cookies.find((cookie) =>
        cookie.includes('refreshToken='),
      );
      refreshToken = refreshCookie?.match(/refreshToken=([^;]+)/)?.[1] || '';
    });

    it('should return 401 with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 with non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 400 with missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 with missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);
    });

    it('should return 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);

      // Update access token for subsequent tests
      accessToken = response.body.accessToken;

      // Check new refresh token cookie
      const cookies = response.headers['set-cookie'] as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie) => cookie.includes('refreshToken='))).toBe(
        true,
      );
    });

    it('should return 401 without refresh cookie', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);
    });

    it('should return 401 with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', ['refreshToken=invalid-token'])
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Check cookie is cleared
      const cookies = response.headers['set-cookie'] as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie) => cookie.includes('refreshToken=;')),
      ).toBe(true);
    });

    it('should return 401 without access token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('should return 401 with invalid access token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should invalidate refresh token after logout', async () => {
      // Try to refresh with old token after logout
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(401);
    });
  });
});
