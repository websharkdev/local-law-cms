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
| `translation-request` | collection | Зеркало заявок на перевод (`requestStatus`, не reserved `status`) |
| `page`, `menu`, `faq`, `testimonial`, `blog-article` | various | Маркетинговый CMS |

Локали i18n: `en` (default) + `ar` (создаётся автоматически при старте, см. `src/index.ts`).

Стабильные ключи (`lawyerId`, `slug`, `active`, `date`, `iconKey` и т.п.) помечены `localized: false`, чтобы EN/AR не расходились.

## Local dev

```bash
npm install
cp .env.example .env   # заполнить секреты: openssl rand -base64 32
npm run develop        # http://localhost:1337/admin
```

Локально используется SQLite (`.tmp/data.db`) при `DATABASE_CLIENT=sqlite` (нужен `better-sqlite3`).

При старте bootstrap:

1. создаёт локаль `ar`, если её ещё нет;
2. выдаёт Public-роли `find` / `findOne` на контентные API (мутации закрыты);
3. регистрирует webhook `local-law-revalidate` → `${LOCAL_LAW_URL}/api/strapi/revalidate`.

## Подключение к Next.js (local-law)

| Сторона | Переменная | Назначение |
|---|---|---|
| CMS | `LOCAL_LAW_URL` | CORS origin + URL webhook |
| CMS | `STRAPI_WEBHOOK_SECRET` | заголовок `x-strapi-signature` |
| Next.js | `STRAPI_URL` | base URL CMS (`http://localhost:1337`) |
| Next.js | `STRAPI_WEBHOOK_SECRET` | тот же секрет, что в CMS |
| Next.js (опц.) | `STRAPI_API_TOKEN` | если Public read отключён; server-side fetch |

После Publish в админке webhook шлёт `{ event, model }` → `revalidateTag('strapi:<model>')`.

## Production

- **База**: Neon PostgreSQL — `DATABASE_CLIENT=postgres`, `DATABASE_URL=...?sslmode=require`, `DATABASE_SSL=true`
- **Uploads**: Cloudflare R2 — задать `AWS_*` переменные (см. `.env.example`); без них файлы пишутся на локальный диск (на PaaS — ephemeral!)
- **URL**: `PUBLIC_URL=https://cms.<domain>`, `IS_PROXIED=true` за reverse proxy
- **CORS**: `LOCAL_LAW_URL=https://<домен Next.js-приложения>`
- **Webhook**: `STRAPI_WEBHOOK_SECRET` — общий секрет с `app/api/strapi/revalidate` в Next.js

После деплоя: создать админа на `/admin`. Public read для контента выдаётся автоматически; для записи/ops используйте API Token (Settings → API Tokens).

## Scripts

```bash
npm run develop          # dev с autoReload
npm run build            # production build
npm run start            # production start
npm run ts:generate-types  # перегенерировать types/generated после изменения схем
```

## API examples (Next.js)

В Strapi 5 нет `populate=deep` — указывайте вложенности явно (`strictParams: true`).

```http
GET /api/lawyers?filters[active][$eq]=true&filters[isTopLawyer][$eq]=true&populate[image]=true&populate[specializations]=true&locale=en
GET /api/legal-categories?filters[active][$eq]=true&sort=order&locale=ar
GET /api/notary-services?filters[active][$eq]=true&sort=order&locale=en
GET /api/notary-config?populate[workingDays]=true&populate[blackoutDates]=true
GET /api/holidays?sort=date
GET /api/pricing
GET /api/site-settings?populate[defaultSeo][populate][0]=shareImage&populate[logo]=true&locale=en
GET /api/dashboard-promo?populate[chatChips]=true&populate[helpBanner]=true&populate[trendingQuestions]=true&locale=en
```
