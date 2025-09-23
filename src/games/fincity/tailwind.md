ниже — обновлённый и выверенный гайд по отличиям и специфике Tailwind CSS v4 (vs v3). Я подчистил формулировки, добавил недостающие вещи (prefix, @source, новые директивы), поправил спорные моменты про dark-mode и слои, и снабдил всё рабочими примерами.

# Гайд для LLM по специфике Tailwind CSS v4

Этот документ описывает ключевые особенности и отличия Tailwind CSS v4 от v3. Используй его при генерации кода, конфигурации и объяснений, связанных с последней версией.

---

## 1) Конфигурация: **CSS-first**, без `tailwind.config.js`

Главное изменение v4 — переход к подходу *CSS-first*. Старт без конфигов JS: достаточно одного импорта в вашем главном CSS (например, `src/app/globals.css`). Никаких `@tailwind base/components/utilities` — вместо этого обычный CSS-импорт. ([Tailwind CSS][1])

```css
/* v3 — больше не актуально */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 — правильно */
@import "tailwindcss";
```

Внутри импортируемого пакета Tailwind объявляет слои: `theme`, `base` (Preflight), `components`, `utilities`. Это задаёт правильный порядок специфичности. ([Tailwind CSS][2])

---

## 2) Тема и дизайн-токены через `@theme`

Токены (цвета, размеры, шрифты, брейкпоинты и т. п.) задаются в специальной директиве `@theme`. Это **не просто CSS-переменные** — этим вы *создаёте* соответствующие утилиты (например, `bg-…`, `text-…`, `3xl:…`). Все имена переменных начинаются с `--`. ([Tailwind CSS][2])

```css
@import "tailwindcss";

@theme {
  --radius: 0.625rem;          /* 10px */
  --breakpoint-3xl: 120rem;    /* появится вариант 3xl: */
  --color-primary-500: oklch(0.72 0.19 255);
}
```

Теперь можно писать:

```html
<div class="rounded-[var(--radius)] bg-primary-500 3xl:p-8 p-4"></div>
```

> Примечание: для токенов цветов рекомендуется `oklch()` — предсказуемая яркость и широкий охват. ([Tailwind CSS][1])

---

## 3) Слои (`@layer`) в v4

Tailwind импортирует слои в порядке: `theme` → `base` → `components` → `utilities`. Вы можете добавлять свои стили в соответствующие слои для контроля специфичности: токены и их переопределения — в `@layer theme`, базовые HTML-стили — в `@layer base`, компоненты — в `@layer components`, кастом-утилиты — в `@layer utilities`. ([Tailwind CSS][2])

```css
@layer components {
  .btn-primary {
    background: var(--color-primary-500);
    border-radius: var(--radius);
    @apply px-4 py-2 text-white;
  }
}

@layer utilities {
  .text-balance { text-wrap: balance; }
}
```

---

## 4) Новые директивы и функции

Помимо `@theme` в v4 появились/пересобраны важные директивы:

* `@source` — явно укажите дополнительные пути, если авто-поиск классов не находит их (например, внешний UI-пакет). ([Tailwind CSS][3])

  ```css
  @source "../node_modules/@my-company/ui-lib";
  ```

* `@utility` — регистрируйте свои утилиты c поддержкой варианта (`hover`, `lg`, и т. п.). ([Tailwind CSS][3])

  ```css
  @utility tab-4 { tab-size: 4; }
  ```

* `@variant` и `@custom-variant` — используйте встроенные варианты или создавайте свои (в том числе для темизации, см. ниже про dark-mode). ([Tailwind CSS][3])

* `@apply` — работает как прежде для инлайна утилит в ваш CSS. ([Tailwind CSS][3])

---

## 5) PostCSS в v4 (и почему **Autoprefixer не нужен**)

В v4 PostCSS-плагин вынесен в отдельный пакет `@tailwindcss/postcss`, а вендорные префиксы и современные синтаксические трансформации обеспечивает Lightning CSS под капотом. Поэтому `autoprefixer` больше не нужен. ([Tailwind CSS][4])

Минимальная `postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

(Ошибку «похоже, вы пытаетесь использовать `tailwindcss` напрямую как PostCSS-плагин…» лечим установкой `@tailwindcss/postcss` и обновлением конфигурации.) ([GitHub][5])

---

## 6) Тёмная тема и темизация в v4

* По умолчанию `dark:` привязан к медиа-запросу `prefers-color-scheme`. Если вы хотите «класс-режим» как в v3 (`.dark …`), переопределите вариант через `@custom-variant`. ([Tailwind CSS][6])

```css
@import "tailwindcss";

/* Включаем стратегию "класс": */
@custom-variant dark (&:where(.dark, .dark *));
```

* Токены-цвета удобно переопределять в `@layer theme` под селекторами темы: `:root`, `.dark`, `[data-theme=…]` и т. п. Это даёт корректную специфичность и обновляет связанные утилиты. ([Stack Overflow][7])

```css
@theme {
  --color-bg: oklch(0.98 0 0);
  --color-fg: oklch(0.25 0 0);
}

@layer theme {
  .dark {
    --color-bg: oklch(0.22 0 0);
    --color-fg: oklch(0.92 0 0);
  }
}
```

---

## 7) Префикс классов (если нужен)

Префикс теперь задаётся прямо в `@import` и выглядит как вариант в начале класса:

```css
@import "tailwindcss" prefix(tw);
```

```html
<div class="tw:flex tw:bg-red-500 tw:hover:bg-red-600"></div>
```

([Tailwind CSS][8])

---

## 8) Авто-поиск классов и источники

В v4 не нужно прописывать `content` с путями — Tailwind автоматически находит классы. Если что-то не подхватывается (например, сторонняя библиотека), используйте `@source`. ([Tailwind CSS][3])

---

## 9) Кастом-утилиты и компоненты в стиле v4

* Кастом-утилиты: `@utility` + `@layer utilities`. ([Tailwind CSS][3])
* Компонентные стили: `@layer components` и `@apply` по вкусу. ([Tailwind CSS][9])

---

## 10) Preflight (CSS reset)

Preflight продолжает включаться автоматически как часть импорта и живёт в `@layer base`. Выключать обычно не нужно. ([Tailwind CSS][2])

---

## 11) Быстрая шпаргалка миграции: v3 → v4

| Что было в v3                                                | Как в v4                                                                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` ([Tailwind CSS][1])                                                                           |
| `tailwind.config.js` (theme/content/…)                       | Не обязателен. Токены через `@theme`, источники через `@source`; автодетект классов по умолчанию. ([Tailwind CSS][2])  |
| `darkMode: 'class' \| 'media'`                               | По умолчанию — media; «класс» настраивается так: `@custom-variant dark (&:where(.dark, .dark *));` ([Tailwind CSS][6]) |
| PostCSS: `tailwindcss` + `autoprefixer`                      | Только `@tailwindcss/postcss`; префиксы/трансформации — через Lightning CSS. ([Tailwind CSS][4])                       |
| Токены в `theme` объекта JS                                  | `@theme { --color-…; --font-…; --breakpoint-…; … }` (генерирует утилиты) ([Tailwind CSS][2])                           |
| `prefix: 'tw-'` в config                                     | `@import "tailwindcss" prefix(tw);` + классы вида `tw:bg-…` ([Tailwind CSS][8])                                        |

---

## 12) Рекомендуемые практики (v4)

* **Именуйте токены явно**: для цветов используйте префикс `--color-*` (`--color-primary-500`), для брейкпоинтов `--breakpoint-*`, и т. д. Это улучшает читаемость и предсказуемость утилит. ([Tailwind CSS][2])
* **Используйте `@layer theme` для переопределений** (`.dark`, `[data-theme]`, клиентские темы) — корректная специфичность и цепочка. ([Stack Overflow][7])
* **Цвета в `oklch()`** для консистентной яркости и лёгкого тон-маппинга. ([Tailwind CSS][1])
* **Добавляйте свои утилиты через `@utility`**, не миксуйте их в `components` без нужды. ([Tailwind CSS][3])

---

## 13) Полезные мини-сниппеты

### Минимальный `globals.css`

```css
@import "tailwindcss";               /* подключает theme, preflight, utilities */

/* Токены */
@theme {
  --radius: 0.625rem;
  --color-primary-500: oklch(0.72 0.19 255);
  --breakpoint-3xl: 120rem;
}

/* Темы */
@layer theme {
  .dark {
    --color-primary-500: oklch(0.72 0.19 255 / 0.9);
  }
}

/* Компонент */
@layer components {
  .btn-primary { @apply inline-flex items-center gap-2 px-4 py-2 text-white rounded-[var(--radius)]; background: var(--color-primary-500); }
}

/* Кастом-утилита */
@utility text-balance { text-wrap: balance; }
```

### `postcss.config.mjs`

```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

([Tailwind CSS][4])

---

### Короткая сводка критических изменений (breaking changes)

* `@tailwind …` → `@import "tailwindcss"` (одна строка). ([Tailwind CSS][1])
* `tailwind.config.js` не обязателен; тема через `@theme`, источники через `@source`. ([Tailwind CSS][2])
* PostCSS-плагин: теперь `@tailwindcss/postcss`; `autoprefixer` не нужен. ([Tailwind CSS][4])
* Настройка `darkMode` через `@custom-variant` (по умолчанию — media). ([Tailwind CSS][6])
* Префикс классов через `@import "tailwindcss" prefix(…)`. ([Tailwind CSS][8])

---

Если хочешь, могу собрать отдельную «таблицу соответствий» v3→v4 по конкретным пунктам твоего проекта (plugins, типографика, кастомные брейкпоинты и т. п.) — просто скинь кусок старого `tailwind.config.js`.