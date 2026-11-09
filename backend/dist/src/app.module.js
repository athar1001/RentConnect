"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const apartments_module_1 = require("./apartments/apartments.module");
const scraper_service_1 = require("./scraper/scraper.service");
const scraper_controller_1 = require("./scraper/scraper.controller");
const documents_module_1 = require("./documents/documents.module");
const reminders_module_1 = require("./reminders/reminders.module");
const logs_module_1 = require("./logs/logs.module");
const checklists_module_1 = require("./checklists/checklists.module");
const admin_module_1 = require("./admin/admin.module");
const feedbacks_module_1 = require("./feedbacks/feedbacks.module");
const notifications_module_1 = require("./notifications/notifications.module");
const users_module_1 = require("./users/users.module");
const notes_module_1 = require("./notes/notes.module");
const blog_module_1 = require("./blog/blog.module");
const cookie_consent_module_1 = require("./cookie-consent/cookie-consent.module");
const legal_pages_module_1 = require("./legal-pages/legal-pages.module");
const housing_identity_module_1 = require("./housing-identity/housing-identity.module");
const applications_module_1 = require("./applications/applications.module");
const landlords_module_1 = require("./landlords/landlords.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'public'),
                serveRoot: '/public/',
            }),
            auth_module_1.AuthModule,
            prisma_module_1.PrismaModule,
            apartments_module_1.ApartmentsModule,
            documents_module_1.DocumentsModule,
            reminders_module_1.RemindersModule,
            logs_module_1.LogsModule,
            checklists_module_1.ChecklistsModule,
            admin_module_1.AdminModule, feedbacks_module_1.FeedbacksModule, notifications_module_1.NotificationsModule, users_module_1.UsersModule, notes_module_1.NotesModule,
            blog_module_1.BlogModule,
            cookie_consent_module_1.CookieConsentModule,
            legal_pages_module_1.LegalPagesModule,
            housing_identity_module_1.HousingIdentityModule,
            applications_module_1.ApplicationsModule,
            landlords_module_1.LandlordsModule,
        ],
        controllers: [app_controller_1.AppController, scraper_controller_1.ScraperController],
        providers: [app_service_1.AppService, scraper_service_1.ScraperService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map