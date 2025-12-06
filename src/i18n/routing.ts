import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'sk'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the locale, the external
  // paths are rewritten to the shared, internal ones.
  pathnames: {
    // If all locales use the same pathname, a single
    // string or a template string can be provided.
    '/': '/',
    '/about': {
      en: '/about',
      sk: '/o-nas'
    }
    // Dynamic params are supported via square brackets
    // '/news/[articleSlug]-[articleId]': {
    //   en: '/news/[articleSlug]-[articleId]',
    //   sk: '/novinky/[articleSlug]-[articleId]'
    // }
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
