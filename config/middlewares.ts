import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  // Public host of the media CDN (R2 custom domain), needed in CSP for admin previews
  const mediaBaseUrl = env('AWS_BASE_URL', '');
  const mediaHosts = mediaBaseUrl ? [new URL(mediaBaseUrl).host] : [];

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', ...mediaHosts],
            'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', ...mediaHosts],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        origin: [
          env('LOCAL_LAW_URL', 'http://localhost:3000').replace(/\/$/, ''),
        ],
      },
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
