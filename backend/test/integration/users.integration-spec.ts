import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp } from './setup';

describe('Users Integration', () => {
  let app: INestApplication;
  let accessToken: string;
  const testUser = {
    email: 'user@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const context = await setupTestApp();
    app = context.app;
  });

  afterAll(async () => {
    await teardownTestApp({ app });
  });

  describe('POST /users (Registration)', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 409 when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(409);
    });

    it('should return 400 with missing email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 with missing password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'new@example.com',
        })
        .expect(400);
    });

    it('should return 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 with short password', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'short@example.com',
          password: '12345',
        })
        .expect(400);
    });
  });

  describe('GET /users/me', () => {
    beforeAll(async () => {
      // Login to get access token
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(201);

      accessToken = response.body.accessToken;
    });

    it('should return current user profile with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without access token', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('should return 401 with invalid access token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 with malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'invalid-header')
        .expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update user email successfully', async () => {
      const newEmail = 'updated@example.com';
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: newEmail,
        })
        .expect(200);

      expect(response.body).toHaveProperty('email', newEmail);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 409 when updating to existing email', async () => {
      // Create another user first
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'another@example.com',
          password: 'password123',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'another@example.com',
        })
        .expect(409);
    });

    it('should update password and allow login with new password', async () => {
      const newPassword = 'newpassword123';

      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: newPassword,
        })
        .expect(200);

      // Login with new password should work
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'updated@example.com',
          password: newPassword,
        })
        .expect(201);

      // Login with old password should fail
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'updated@example.com',
          password: testUser.password,
        })
        .expect(401);
    });

    it('should return 401 without access token', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .send({
          email: 'unauthorized@example.com',
        })
        .expect(401);
    });

    it('should return 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 400 with short password', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          password: '123',
        })
        .expect(400);
    });

    it('should handle empty request body', async () => {
      // Empty body returns current user without changes (no fields to update)
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
    });
  });
});
