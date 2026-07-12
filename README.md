# local-law-cms

Strapi v5 CMS для сайта local-law. Управляет контентом (юристы, услуги нотариуса, цены, шаблоны документов, настройки сайта); бизнес-данные приложения остаются в Prisma/PostgreSQL local-law.

## Content types

| API | Kind | Назначение |
|---|---|---|
| `lawyer` | collection | Карточки юристов |
| `legal-category` | collection | Категории юридических услуг |
| `notary-service` | collection | Услуги нотариуса |
| `notary-config` | single | Настройки записи к нотариусу (расписание, blackout-даты) |
| `holiday` | collection | Праздничные дни |
| `document-template` | collection | Шаблоны документов (динамические поля) |
| `translation-request` | collection | Заявки на перевод |
| `pricing` | single | Страница цен |
| `site-settings` | single | Глобальные настройки сайта + SEO |

Локали i18n: `en` (default) + `ar` (создаётся автоматически при старте, см. `src/index.ts`).

## Local dev

```bash
npm install
cp .env.example .env   # заполнить секреты: openssl rand -base64 32
npm run develop        # http://localhost:1337/admin
```

Локально используется SQLite (`.tmp/data.db`).

## Production

- **База**: Neon PostgreSQL — `DATABASE_CLIENT=postgres`, `DATABASE_URL=...?sslmode=require`, `DATABASE_SSL=true`
- **Uploads**: Cloudflare R2 — задать `AWS_*` переменные (см. `.env.example`); без них файлы пишутся на локальный диск (на PaaS — ephemeral!)
- **URL**: `PUBLIC_URL=https://cms.<domain>`, `IS_PROXIED=true` за reverse proxy
- **CORS**: `LOCAL_LAW_URL=https://<домен Next.js-приложения>`

После деплоя: создать админа на `/admin`, затем Settings → API Tokens → токен для Next.js (используется server-side, public role остаётся закрытой).

## Scripts

```bash
npm run develop   # dev с autoReload
npm run build     # production build
npm run start     # production start
npm run strapi ts:generate-types   # перегенерировать types/generated после изменения схем
```
