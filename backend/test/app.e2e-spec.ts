import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('auth/register creates a new user and returns a token', async () => {
    const server = app.getHttpServer() as unknown as App;

    const registerResponse = await request(server)
      .post('/auth/register')
      .send({
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com',
      })
      .expect(201);

    const { access_token: token } = registerResponse.body as {
      access_token: string;
    };

    expect(token).toBeDefined();

    // Verify the user was created
    const user = await prisma.user.findUnique({
      where: { username: 'newuser' },
    });
    expect(user).toBeDefined();
    expect(user?.email).toBe('newuser@example.com');
  });

  it('auth/login returns a token and profile is accessible', async () => {
    const password = await bcrypt.hash('changeme', 10);
    await prisma.user.upsert({
      where: { username: 'john' },
      update: { password },
      create: {
        username: 'john',
        email: 'john@example.com',
        password,
      },
    });

    const server = app.getHttpServer() as unknown as App;

    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ username: 'john', password: 'changeme' })
      .expect(201);

    const { access_token: token } = loginResponse.body as {
      access_token: string;
    };

    await request(server)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
