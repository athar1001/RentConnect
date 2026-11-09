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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const prisma_service_1 = require("../src/prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const prisma = app.get(prisma_service_1.PrismaService);
    const password = await bcrypt.hash('password123', 10);
    const testUser = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: password,
            fullName: 'Test User',
            role: client_1.UserRole.USER,
        },
    });
    const testAdmin = await prisma.admin.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: password,
            fullName: 'Test Admin',
        },
    });
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
            where: { pageType: page.pageType },
            update: {},
            create: {
                pageType: page.pageType,
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
//# sourceMappingURL=seed.js.map