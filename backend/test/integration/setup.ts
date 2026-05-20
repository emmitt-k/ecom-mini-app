import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import { User } from '@/users/entities/user.entity';
import { RefreshToken } from '@/auth/entities/refresh-token.entity';
import { Product } from '@/products/entities/product.entity';
import { SharedModule } from '@/shared/shared.module';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { ProductsModule } from '@/products/products.module';

export interface TestContext {
  app: INestApplication;
}

export async function setupTestApp(): Promise<TestContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        entities: [User, RefreshToken, Product],
        synchronize: true,
        logging: false,
      }),
      ThrottlerModule.forRoot([
        {
          name: 'short',
          ttl: 1000,
          limit: 3,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 20,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 100,
        },
      ]),
      SharedModule,
      AuthModule,
      UsersModule,
      ProductsModule,
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('');

  await app.init();

  return { app };
}

export async function teardownTestApp(context: TestContext): Promise<void> {
  await context.app.close();
}
