import type { Core } from '@strapi/strapi';

const REQUIRED_LOCALES = [{ code: 'ar', name: 'Arabic (ar)' }];

async function ensureLocales(strapi: Core.Strapi) {
  const localesService = strapi.plugin('i18n').service('locales');
  const existing: Array<{ code: string }> = await localesService.find();

  for (const locale of REQUIRED_LOCALES) {
    if (!existing.some((item) => item.code === locale.code)) {
      await localesService.create(locale);
      strapi.log.info(`i18n: created locale "${locale.code}"`);
    }
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureLocales(strapi);
  },
};
