import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'de'],
  defaultLocale: 'de',
  pathnames: {
    '/': '/',
    '/privacy-policy': {
      en: '/privacy-policy',
      de: '/datenschutzerklaerung'
    },
    '/terms-of-service': {
      en: '/terms-of-service',
      de: '/nutzungsbedingungen'
    },
    '/cookie-policy': {
      en: '/cookie-policy',
      de: '/cookie-richtlinie'
    },
    '/imprint': {
      en: '/imprint',
      de: '/impressum'
    },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/control/blog': '/control/blog',
    '/control/blog/[id]': '/control/blog/[id]',
    '/control/blog/create': '/control/blog/create',
    '/control/blog/edit/[id]': '/control/blog/edit/[id]',
    '/control': '/control',
    '/control/sign-in': '/control/sign-in',
    '/control/imports': '/control/imports',
    '/control/logs': '/control/logs',
    '/control/platforms': '/control/platforms',
    '/control/settings': '/control/settings',
    '/control/system': '/control/system',
    '/control/users': '/control/users',
    '/control/feedback': '/control/feedback',
    '/control/content/legal-pages': '/control/content/legal-pages',
    '/control/content/legal-pages/[id]': '/control/content/legal-pages/[id]',
    '/control/content/legal-pages/[id]/edit': '/control/content/legal-pages/[id]/edit',
    '/control/content/legal-pages/[id]/preview/[lang]': '/control/content/legal-pages/[id]/preview/[lang]',
    '/app': '/app',
    '/app/dashboard': '/app/dashboard',
    '/app/apartments': '/app/apartments',
    '/app/apartments/[id]': '/app/apartments/[id]',
    '/app/kanban': '/app/kanban',
    '/app/documents': '/app/documents',
    '/app/reminders': '/app/reminders',
    '/app/settings': '/app/settings',
    '/app/notes': '/app/notes',
    '/app/housing-identity': '/app/housing-identity',
    '/app/applications': '/app/applications',
    '/app/applications/[id]': '/app/applications/[id]',
    '/app/apartments/[id]/apply': '/app/apartments/[id]/apply',
    '/application/[token]': '/application/[token]',
    '/landlord/dashboard': '/landlord/dashboard',
    '/landlord/properties': '/landlord/properties',
    '/landlord/properties/[id]': '/landlord/properties/[id]',
    '/landlord/applications': '/landlord/applications',
    '/landlord/applications/[id]': '/landlord/applications/[id]',
    '/landlord/compare': '/landlord/compare',
    '/landlord/calendar': '/landlord/calendar',
    '/landlord/analytics': '/landlord/analytics',
    '/landlord/settings': '/landlord/settings',
    '/login': '/login',
    '/register': '/register',
    '/forgot-password': '/forgot-password',
    '/reset-password': '/reset-password',
    '/pricing': '/pricing'
  }
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
