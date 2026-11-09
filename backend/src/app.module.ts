import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { ScraperService } from './scraper/scraper.service';
import { ScraperController } from './scraper/scraper.controller';
import { DocumentsModule } from './documents/documents.module';
import { RemindersModule } from './reminders/reminders.module';
import { LogsModule } from './logs/logs.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { AdminModule } from './admin/admin.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { BlogModule } from './blog/blog.module';
import { CookieConsentModule } from './cookie-consent/cookie-consent.module';
import { LegalPagesModule } from './legal-pages/legal-pages.module';
import { HousingIdentityModule } from './housing-identity/housing-identity.module';
import { ApplicationsModule } from './applications/applications.module';
import { LandlordsModule } from './landlords/landlords.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public/',
    }),
    AuthModule, 
    PrismaModule, 
    ApartmentsModule, 
    DocumentsModule, 
    RemindersModule, 
    LogsModule, 
    ChecklistsModule, 
    AdminModule, FeedbacksModule, NotificationsModule, UsersModule, NotesModule,
    BlogModule,
    CookieConsentModule,
    LegalPagesModule,
    HousingIdentityModule,
    ApplicationsModule,
    LandlordsModule,
  ],
  controllers: [AppController, ScraperController],
  providers: [AppService, ScraperService],
})
export class AppModule {}
