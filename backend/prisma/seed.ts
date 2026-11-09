import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  const password = await bcrypt.hash('password123', 10);

  // 1. Create a Test User
  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: password,
      fullName: 'Test User',
      role: UserRole.USER,
    },
  });

  // 2. Create a Test Admin
  const testAdmin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: password,
      fullName: 'Test Admin',
    },
  });

  // 3. Create default draft legal pages if they don't exist
  const legalPages = [
    {
      pageType: 'PRIVACY_POLICY',
      titleEn: 'Privacy Policy',
      slugEn: 'privacy-policy',
      contentEn: '<h1>Privacy Policy</h1><p>Draft Privacy Policy content...</p>',
      titleDe: 'Datenschutzerklärung',
      slugDe: 'datenschutzerklaerung',
      contentDe: '<h1>Datenschutzerklärung</h1><p>Entwurf Datenschutzerklärung...</p>',
    },
    {
      pageType: 'TERMS_OF_SERVICE',
      titleEn: 'Terms of Service',
      slugEn: 'terms-of-service',
      contentEn: '<h1>Terms of Service</h1><p>Draft Terms of Service content...</p>',
      titleDe: 'Nutzungsbedingungen',
      slugDe: 'nutzungsbedingungen',
      contentDe: '<h1>Nutzungsbedingungen</h1><p>Entwurf Nutzungsbedingungen...</p>',
    },
    {
      pageType: 'COOKIE_POLICY',
      titleEn: 'Cookie Policy',
      slugEn: 'cookie-policy',
      contentEn: '<h1>Cookie Policy</h1><p>Draft Cookie Policy content...</p>',
      titleDe: 'Cookie-Richtlinie',
      slugDe: 'cookie-richtlinie',
      contentDe: '<h1>Cookie-Richtlinie</h1><p>Entwurf Cookie-Richtlinie...</p>',
    },
    {
      pageType: 'IMPRINT',
      titleEn: 'Imprint',
      slugEn: 'imprint',
      contentEn: '<h1>Imprint</h1><p>Draft Imprint content...</p>',
      titleDe: 'Impressum',
      slugDe: 'impressum',
      contentDe: '<h1>Impressum</h1><p>Entwurf Impressum...</p>',
    },
  ];

  for (const page of legalPages) {
    await prisma.legalPage.upsert({
      where: { pageType: page.pageType as any },
      update: {},
      create: {
        pageType: page.pageType as any,
        status: 'DRAFT',
        titleEn: page.titleEn,
        slugEn: page.slugEn,
        contentEn: page.contentEn,
        titleDe: page.titleDe,
        slugDe: page.slugDe,
        contentDe: page.contentDe,
        noIndex: true,
      },
    });
  }

  console.log('Created accounts:');
  console.log(`USER: ${testUser.email} / password123`);
  console.log(`ADMIN: ${testAdmin.email} / password123`);

  await app.close();
}

bootstrap()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
