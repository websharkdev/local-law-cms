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

const REVALIDATE_WEBHOOK_NAME = 'local-law-revalidate';

const REVALIDATE_EVENTS = [
  'entry.create',
  'entry.update',
  'entry.delete',
  'entry.publish',
  'entry.unpublish',
  'entry.draft-discard',
];

async function ensureRevalidateWebhook(strapi: Core.Strapi) {
  const baseUrl = process.env.LOCAL_LAW_URL;
  const secret = process.env.STRAPI_WEBHOOK_SECRET;

  if (!baseUrl || !secret) {
    strapi.log.warn(
      'webhook: LOCAL_LAW_URL or STRAPI_WEBHOOK_SECRET missing, revalidate webhook not configured',
    );
    return;
  }

  const desired = {
    name: REVALIDATE_WEBHOOK_NAME,
    url: `${baseUrl.replace(/\/$/, '')}/api/strapi/revalidate`,
    headers: { 'x-strapi-signature': secret },
    events: REVALIDATE_EVENTS,
  };

  const store = strapi.get('webhookStore');
  const webhooks: Array<{
    id: string;
    name: string;
    url: string;
    headers: Record<string, string>;
  }> = await store.findWebhooks();
  const existing = webhooks.find((webhook) => webhook.name === REVALIDATE_WEBHOOK_NAME);

  if (!existing) {
    const created = await store.createWebhook(desired);
    strapi.get('webhookRunner').add(created);
    strapi.log.info(`webhook: created "${REVALIDATE_WEBHOOK_NAME}" -> ${desired.url}`);
    return;
  }

  const isStale =
    existing.url !== desired.url ||
    existing.headers['x-strapi-signature'] !== secret;

  if (isStale) {
    // The runner loads webhooks before user bootstrap; the update lands on next boot
    await store.updateWebhook(existing.id, { ...existing, ...desired });
    strapi.log.info(`webhook: updated "${REVALIDATE_WEBHOOK_NAME}", restart to apply`);
  }
}

/**
 * Content the Next.js app reads. Mutations stay closed on the Public role;
 * writes go through API tokens or the admin UI.
 */
const PUBLIC_READ_PERMISSIONS: Record<string, string[]> = {
  lawyer: ['find', 'findOne'],
  'legal-category': ['find', 'findOne'],
  'notary-service': ['find', 'findOne'],
  'notary-config': ['find'],
  holiday: ['find', 'findOne'],
  pricing: ['find'],
  'site-settings': ['find'],
  'dashboard-promo': ['find'],
  'document-template': ['find', 'findOne'],
  page: ['find', 'findOne'],
  menu: ['find', 'findOne'],
  faq: ['find', 'findOne'],
  testimonial: ['find', 'findOne'],
  'blog-article': ['find', 'findOne'],
  'service-pricing': ['find', 'findOne'],
};

async function ensurePublicReadPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) {
    strapi.log.warn('permissions: Public role not found, skipping content read setup');
    return;
  }

  const existing: Array<{ action: string }> = await strapi.db
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: publicRole.id } });
  const existingActions = new Set(existing.map((permission) => permission.action));

  const toCreate: Array<{ action: string; role: number }> = [];

  for (const [uid, actions] of Object.entries(PUBLIC_READ_PERMISSIONS)) {
    for (const action of actions) {
      const fullAction = `api::${uid}.${uid}.${action}`;
      if (!existingActions.has(fullAction)) {
        toCreate.push({ action: fullAction, role: publicRole.id });
      }
    }
  }

  if (toCreate.length === 0) {
    return;
  }

  await Promise.all(
    toCreate.map((data) =>
      strapi.db.query('plugin::users-permissions.permission').create({ data }),
    ),
  );

  strapi.log.info(
    `permissions: granted Public read on ${toCreate.length} content action(s) for local-law`,
  );
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureLocales(strapi);
    await ensurePublicReadPermissions(strapi);
    await ensureRevalidateWebhook(strapi);
  },
};
