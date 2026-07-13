# Спецификация админки (Strapi CMS)

> **Цель:** зафиксировать, что именно настраивается через админку, какие поля влияют на приложение, и что сознательно остаётся вне CMS.
>
> **Админка:** Strapi (`STRAPI_URL`). Приложение читает контент через `lib/strapi/content.server.ts`, кэш инвалидируется webhook'ом `app/api/strapi/revalidate/route.ts`.
>
> **Документы:** вне скоупа первой итерации (см. §8).

---

## Принципы

| Тип данных | Где хранится | Кто редактирует |
|---|---|---|
| **Контент** (профили, услуги, цены, расписание) | Strapi | Контент-менеджер / операции |
| **Транзакции** (бронирования, заявки, чаты, платежи) | PostgreSQL (Prisma) | Только через приложение / будущая ops-панель |
| **UI-копирайт** (кнопки, заголовки секций) | `messages/*.json` (i18n) | Разработчик / локализация |
| **Поведение** (валидация, лимиты файлов) | Код | Разработчик |

**Локализация:** все коллекции с `locale` (EN/AR) должны иметь опубликованные записи в обеих локалях. Single Types (`pricing`, `notary-config`, `dashboard-promo`) — без локали, кроме `dashboard-promo` (локализован).

**Публикация:** изменения попадают в приложение только после `Publish` в Strapi + webhook revalidate.

---

## 1. Общие настройки

### 1.1 Site Settings (`site-settings`, Single Type, локализованный)

**Зачем:** глобальные контакты и SEO всего сайта.

| Поле | Тип | Где используется | Обязательно |
|---|---|---|---|
| `siteName` | string | `<title>`, OpenGraph `siteName` | да |
| `contactEmail` | string | футер, контактные блоки (будущее) | нет |
| `contactPhone` | string | футер, контактные блоки (будущее) | нет |
| `whatsappNumber` | string | WhatsApp-ссылки (будущее) | нет |
| `address` | text | футер (будущее) | нет |
| `defaultSeo.metaTitle` | string | fallback `<title>` | нет |
| `defaultSeo.metaDescription` | text | meta description, OG | нет |
| `defaultSeo.shareImage` | media | OG/Twitter image | нет |

**Источник в коде:** `lib/site/metadata.server.ts` → `getSiteSettings()`.

**Fallback:** `lib/metadata.ts` (`defaultMetadata`).

---

### 1.2 Pricing (`pricing`, Single Type)

**Зачем:** единая точка для тарифов, которые влияют на оплату.

| Поле | Тип | Где используется | Сейчас |
|---|---|---|---|
| `translationRatePerPageAed` | number | Legal Translation — расчёт стоимости | ✅ `lib/translation/rate.server.ts` |
| `notaryConfirmationFeeAed` | number (default 25) | Notary Review & Pay | ✅ схема CMS |
| `currency` | string (default `AED`) | отображение валюты (будущее) | в типах, не в UI |

**Не в Pricing (пока):**
- `consultationPriceAed` у каждого лоера — отдельное поле профиля

---

## 2. Дашборд

Дашборд — **композитный экран**: часть данных из CMS, часть из БД, часть статична.

### 2.1 Что настраивается через CMS

| Блок на дашборде | Источник | Что менять в админке |
|---|---|---|
| **Top Lawyers** | Strapi `lawyer` где `isTopLawyer = true` и `active = true` | Флаг `isTopLawyer` + поля профиля (§3) |
| **Legal Categories** | Strapi `legal-category` | `title`, `slug`, `order`, `active` |
| **Trending Questions** | `dashboard-promo.trendingQuestions` | Dashboard Promo (§2.2) |
| **Help Banner** | `dashboard-promo.helpBanner` | Dashboard Promo (§2.2) |
| **AI Chat chips** | `dashboard-promo.chatChips` | Dashboard Promo (§2.2) |
| **Статистика** | Prisma, персональная для юзера | ❌ не CMS |
| **Recent Chats** | Prisma `LegalChat` | ❌ не CMS |

### 2.2 Dashboard Promo (`dashboard-promo`, Single Type, локализованный)

| Поле | Тип | Зачем |
|---|---|---|
| `chatChips[]` | component | Подсказки AI-чата (`label`, `prompt`) |
| `helpBanner` | component | CTA-баннер (`title`, `description`, `ctaLabel`, `ctaHref`) |
| `trendingQuestions[]` | component | Промо-вопросы (`text`) |

**Приоритет подключения в приложении:** низкий (после лоеров и нотариуса). Схема готова в CMS.

---

## 3. Лоеры (Lawyers)

> **Ключевой блок.** Цель — полный перенос контента в Strapi, убрать хардкод в `lawyer-profile.shared.ts`.

### 3.1 Профиль — что видит пользователь

| Секция UI | Поле(я) | Strapi | Админка |
|---|---|---|---|
| **Имя** | `name` | ✅ | ✅ |
| **Должность / роль** | `title` | ✅ | ✅ |
| **Фирма** | `firmName` | ✅ | ✅ |
| **Фото** | `image` | ✅ (media) | ✅ upload |
| **Локация** | `location` | ✅ | ✅ |
| **Язык** | `language` | ✅ | ✅ |
| **Специализации** | `specializations[]` | ✅ (component `shared.tag`) | ✅ repeatable |
| **Кол-во дел** | `casesCount` | ✅ | ✅ |
| **Стаж (лет)** | `experienceYears` | ✅ | ✅ |
| **Top Lawyer** | `isTopLawyer` | ✅ | ✅ boolean |
| **Активен** | `active` | ✅ | ✅ скрыть из каталога |
| **Телефон офиса** | `officePhone` | ✅ | ✅ |
| **Email** | `contactEmail` | ✅ | ✅ |
| **WhatsApp** | `whatsapp` | ✅ | ✅ |
| **Цена консультации** | `consultationPriceAed` | ✅ | ✅ |
| **Саммари** | `about` | ✅ | ✅ rich text |
| **Образование** | `education[]` | ✅ (component) | ✅ repeatable |
| **Знаковые дела** | `notableCases[]` | ✅ (component) | ✅ repeatable |
| **Practice Areas** | `practiceAreas[]` | ✅ (component) | ✅ repeatable |
| **Services Offered** | `servicesOffered[]` | ✅ (component) | ✅ repeatable |
| **Consultation Options** | `consultationOptions[]` | ✅ (component) | ✅ repeatable |
| **Связь с аккаунтом** | `linkedUserEmail` | ✅ | ✅ справка оператору |
| **ID в приложении** | `lawyerId` | ✅ | ✅ уникальный ключ |

### 3.2 Расписание лоера (фаза 3 — схема готова)

| Поле | Зачем |
|---|---|
| `slotDurationMin` | длительность слота консультации |
| `weeklyHours[]` | рабочие дни/часы (`schedule.working-day`) |
| `timeOff[]` | отпуск, больничный (`schedule.time-off`) |

**Сейчас не используется** в UI бронирования лоера. Подключать, когда появится календарь.

### 3.3 Связь с аккаунтом

| Поле | Описание |
|---|---|
| `userId` (Prisma) | связь `Lawyer ↔ User` для лоера с логином |
| `linkedUserEmail` (Strapi) | опционально, для справки оператору |

**Не редактировать в CMS:** заявки на консультацию, сохранённые лоеры.

### 3.4 Legal Categories (`legal-category`)

| Поле | Тип | Зачем |
|---|---|---|
| `slug` | uid | стабильный ID |
| `title` | string (i18n) | label в форме и поиске |
| `order` | number | сортировка |
| `active` | boolean | скрыть устаревшие |

### 3.5 Чеклист для контент-менеджера (на одного лоера)

1. Загрузить фото (квадрат, min 400×400)
2. Заполнить имя, должность, фирму, локацию, язык
3. Специализации (теги для фильтра)
4. Саммари (`about`) — 2–4 предложения
5. Образование — список дипломов/сертификатов
6. Practice areas, services, consultation options
7. Телефон, email, WhatsApp, цена консультации
8. `isTopLawyer` — не больше 5 активных
9. `active` — снять с публикации вместо удаления
10. Опубликовать EN + AR

---

## 4. Нотари (Notary)

### 4.1 Услуги (`notary-service`, Collection)

| Поле | Тип | Обязательно |
|---|---|---|
| `slug` | uid | да |
| `title` | string (i18n) | да |
| `description` | text (i18n) | нет |
| `iconKey` | enum | да |
| `priceAed` | number | нет |
| `order` | number | да |
| `active` | boolean | да |

### 4.2 Расписание (`notary-config`, Single Type)

| Поле | Тип |
|---|---|
| `timezone` | string (default `Asia/Dubai`) |
| `slotDurationMin` | number |
| `maxDaysAhead` | number |
| `workingDays[]` | component `schedule.working-day` |
| `blackoutDates[]` | component `schedule.blackout-date` |

### 4.3 Праздники (`holiday`, Collection)

| Поле | Тип |
|---|---|
| `name` | string (i18n) |
| `date` | date |
| `isRecurringYearly` | boolean |

---

## 5–9. Остальные разделы

См. исходную спецификацию в репозитории приложения. Документы (`document-template`) и ops-данные остаются вне скоупа CMS-админки.

---

## 10. Webhook и кэш

При изменении в Strapi webhook шлёт `{ event, model }` → `revalidateTag('strapi:<model>')`.

| Модель Strapi | Tag |
|---|---|
| `lawyer` | `strapi:lawyer` |
| `legal-category` | `strapi:legal-category` |
| `notary-service` | `strapi:notary-service` |
| `notary-config` | `strapi:notary-config` |
| `holiday` | `strapi:holiday` |
| `pricing` | `strapi:pricing` |
| `site-settings` | `strapi:site-settings` |
| `dashboard-promo` | `strapi:dashboard-promo` |
| `document-template` | `strapi:document-template` |

Webhook создаётся автоматически при старте (`src/index.ts`), если заданы `LOCAL_LAW_URL` и `STRAPI_WEBHOOK_SECRET`.

**Проверка:** после Publish в Strapi данные на сайте обновляются без редеплоя.
