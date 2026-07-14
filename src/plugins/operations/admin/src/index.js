import { Briefcase } from '@strapi/icons';

import { prefixPluginTranslations } from './utils/prefixPluginTranslations';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.addMenuLink({
      to: `plugins/${pluginId}`,
      icon: Briefcase,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Operations',
      },
      Component: () => import('./pages/App'),
      permissions: [],
      position: 2,
    });

    app.registerPlugin({
      id: pluginId,
      name,
    });
  },

  bootstrap() {},

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => ({
            data: prefixPluginTranslations(data, pluginId),
            locale,
          }))
          .catch(() => ({
            data: {},
            locale,
          }));
      }),
    );

    return Promise.resolve(importedTrads);
  },
};
