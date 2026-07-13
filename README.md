# local-law-cms

Strapi v5 CMS для сайта local-law. Управляет контентом (юристы, услуги нотариуса, цены, шаблоны документов, настройки сайта); бизнес-данные приложения остаются в Prisma/PostgreSQL local-law.

Полная спецификация полей и приоритетов: [`docs/ADMIN_SPEC.md`](docs/ADMIN_SPEC.md).

## Content types (Phase 1)

| API | Kind | Назначение |
|---|---|---|
| `lawyer` | collection | Профили юристов (каталог, дашборд, профиль) |
| `legal-category` | collection | Категории для формы консультации и поиска |
| `notary-service` | collection | Услуги нотариуса |
| `notary-config` | single | Расписание и правила бронирования нотариуса |
| `holiday` | collection | Праздничные дни |
| `pricing` | single | Тарифы (`translationRatePerPageAed`, `notaryConfirmationFeeAed`) |
| `site-settings` | single | Глобальные настройки сайта + SEO |

## Content types (Phase 2+)

| API | Kind | Назначение |
|---|---|---|
| `dashboard-promo` | single | AI chips, help banner, trending questions |
| `document-template` | collection | Шаблоны документов (вне скоупа UI) |
| `translation-request` | collection | Заявки на перевод (mirror из приложения) |
| `page`, `menu`, `faq`, `testimonial`, `blog-article` | various | Маркетинговый CMS |

Локали i18n: `en` (default) + `ar` (создаётся автоматически при старте, см. `src/index.ts`).

## Local dev

```bash
npm install
cp .env.example .env   # заполнить секреты: openssl rand -base64 32
npm run develop        # http://localhost:1337/admin
```

Локально используется SQLite (`.tmp/data.db`) при `DATABASE_CLIENT=sqlite`.

## Production

- **База**: Neon PostgreSQL — `DATABASE_CLIENT=postgres`, `DATABASE_URL=...?sslmode=require`, `DATABASE_SSL=true`
- **Uploads**: Cloudflare R2 — задать `AWS_*` переменные (см. `.env.example`); без них файлы пишутся на локальный диск (на PaaS — ephemeral!)
- **URL**: `PUBLIC_URL=https://cms.<domain>`, `IS_PROXIED=true` за reverse proxy
- **CORS**: `LOCAL_LAW_URL=https://<домен Next.js-приложения>`
- **Webhook**: `STRAPI_WEBHOOK_SECRET` — общий секрет с `app/api/strapi/revalidate` в Next.js

После деплоя: создать админа на `/admin`, затем Settings → API Tokens → токен для Next.js (используется server-side, public role остаётся закрытой).

## Scripts

```bash
npm run develop          # dev с autoReload
npm run build            # production build
npm run start            # production start
npm run ts:generate-types  # перегенерировать types/generated после изменения схем
```

## API examples (Next.js)

```http
GET /api/lawyers?filters[active][$eq]=true&filters[isTopLawyer][$eq]=true&populate=*&locale=en
GET /api/legal-categories?filters[active][$eq]=true&sort=order&locale=ar
GET /api/notary-services?filters[active][$eq]=true&sort=order&locale=en
GET /api/notary-config?populate=deep
GET /api/holidays?sort=date
GET /api/pricing
GET /api/site-settings?populate=deep&locale=en
GET /api/dashboard-promo?populate=deep&locale=en
```
