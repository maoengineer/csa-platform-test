import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const supportedLocales = ['en', 'kh'];
  const finalLocale = supportedLocales.includes(locale) ? locale : 'en';

  return {
    locale: finalLocale,
    messages: (await import(`../lib/i18n/${finalLocale}.json`)).default,
  };
});
