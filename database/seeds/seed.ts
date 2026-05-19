import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../backend/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ecommerce',
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const userCount = await AppDataSource.query(
    'SELECT COUNT(*) FROM users',
  );

  if (parseInt(userCount[0].count) > 0) {
    console.log('Database already seeded. Skipping...');
    await AppDataSource.destroy();
    return;
  }

  await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  console.log('Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await AppDataSource.query(
    `INSERT INTO users (id, email, password, created_at, updated_at) VALUES 
    (uuid_generate_v4(), 'admin@example.com', $1, NOW(), NOW())`,
    [hashedPassword],
  );

  for (let i = 0; i < 10; i++) {
    await AppDataSource.query(
      `INSERT INTO users (id, email, password, created_at, updated_at) 
       VALUES (uuid_generate_v4(), $1, $2, NOW(), NOW())`,
      [faker.internet.email(), hashedPassword],
    );
  }

  console.log('Seeding products...');
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Beauty', 'Automotive'];
  
  for (let i = 0; i < 100; i++) {
    const category = faker.helpers.arrayElement(categories);
    await AppDataSource.query(
      `INSERT INTO products (id, name, description, price, image_url, stock_quantity, created_at, updated_at) 
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        faker.commerce.productName(),
        faker.commerce.productDescription(),
        parseFloat(faker.commerce.price({ min: 5, max: 500 })),
        faker.image.url({ width: 400, height: 400 }),
        faker.number.int({ min: 0, max: 100 }),
      ],
    );
  }

  console.log('Seeding completed!');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
