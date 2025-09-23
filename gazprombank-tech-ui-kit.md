# Газпромбанк Тех - UI Kit для мобильных приложений

## Цветовая палитра

### Основные цвета (80% использования)
```css
/* Черный основной */
--gpb-black: #000000;
--gpb-black-rgb: 0, 0, 0;

/* Фиалка основной */
--gpb-violet: #1919EF;
--gpb-violet-rgb: 25, 25, 239;
```

**Tailwind классы:**
```css
.bg-gpb-black { background-color: #000000; }
.bg-gpb-violet { background-color: #1919EF; }
.text-gpb-black { color: #000000; }
.text-gpb-violet { color: #1919EF; }
```

### Акцентные цвета (не более 20% использования)
```css
/* Мята акцентный */
--gpb-mint: #58FFFF;
--gpb-mint-rgb: 88, 255, 255;

/* Малина акцентный */
--gpb-raspberry: #DD41DB;
--gpb-raspberry-rgb: 221, 65, 219;
```

**Tailwind классы:**
```css
.bg-gpb-mint { background-color: #58FFFF; }
.bg-gpb-raspberry { background-color: #DD41DB; }
.text-gpb-mint { color: #58FFFF; }
.text-gpb-raspberry { color: #DD41DB; }
```

### Дополнительные цвета для градиентов
```css
/* Мелисса дополнительный */
--gpb-melissa: #3CFFB9;

/* Сакура дополнительный */
--gpb-sakura: #FF82BE;
```

### Дополнительные цвета для фона
```css
/* Тмин фон */
--gpb-cumin: #060698;

/* Ирис фон */
--gpb-iris: #6088E4;

/* Виола фон */
--gpb-viola: #BDCEFA;

/* Белена фон */
--gpb-henbane: #8D98A4;

/* Лилия фон */
--gpb-lily: #DEE1EE;
```

## Градиенты

### Основные градиенты
```css
.gradient-mint-melissa {
  background: linear-gradient(135deg, #58FFFF 0%, #3CFFB9 100%);
}

.gradient-mint-violet {
  background: linear-gradient(135deg, #58FFFF 0%, #1919EF 100%);
}

.gradient-raspberry-sakura {
  background: linear-gradient(135deg, #DD41DB 0%, #FF82BE 100%);
}

.gradient-raspberry-violet {
  background: linear-gradient(135deg, #DD41DB 0%, #1919EF 100%);
}

.gradient-violet-cumin {
  background: linear-gradient(135deg, #1919EF 0%, #060698 100%);
}

.gradient-black-cumin {
  background: linear-gradient(135deg, #000000 0%, #060698 100%);
}
```

## Типографика

### Заголовки (Halvar Breitschrift)
```css
.font-heading {
  font-family: 'Halvar Breitschrift', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Размеры заголовков для мобильных */
.text-h1 { font-size: 32px; line-height: 38px; } /* 2xl */
.text-h2 { font-size: 28px; line-height: 34px; } /* xl */
.text-h3 { font-size: 24px; line-height: 30px; } /* lg */
.text-h4 { font-size: 20px; line-height: 26px; } /* base+ */
.text-h5 { font-size: 18px; line-height: 24px; } /* lg */
.text-h6 { font-size: 16px; line-height: 22px; } /* base */
```

### Основной текст (Gazprombank Sans)
```css
.font-body {
  font-family: 'Gazprombank Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 400;
}

/* Размеры текста для мобильных */
.text-body-lg { font-size: 16px; line-height: 24px; }
.text-body { font-size: 14px; line-height: 20px; }
.text-body-sm { font-size: 12px; line-height: 18px; }
.text-caption { font-size: 11px; line-height: 16px; }
```

## Компоненты интерфейса

### Кнопки

#### Основная кнопка
```html
<button class="btn-primary">
  Основное действие
</button>
```

```css
.btn-primary {
  @apply px-6 py-3 bg-gpb-violet text-white font-body font-medium text-body;
  @apply rounded-xl transition-all duration-200;
  @apply hover:bg-opacity-90 active:scale-95;
  @apply focus:outline-none focus:ring-2 focus:ring-gpb-violet focus:ring-opacity-50;
}
```

#### Вторичная кнопка
```html
<button class="btn-secondary">
  Вторичное действие
</button>
```

```css
.btn-secondary {
  @apply px-6 py-3 bg-transparent border-2 border-gpb-violet text-gpb-violet font-body font-medium text-body;
  @apply rounded-xl transition-all duration-200;
  @apply hover:bg-gpb-violet hover:text-white active:scale-95;
  @apply focus:outline-none focus:ring-2 focus:ring-gpb-violet focus:ring-opacity-50;
}
```

#### Акцентная кнопка
```html
<button class="btn-accent">
  Акцентное действие
</button>
```

```css
.btn-accent {
  @apply px-6 py-3 gradient-mint-melissa text-gpb-black font-body font-medium text-body;
  @apply rounded-xl transition-all duration-200;
  @apply hover:opacity-90 active:scale-95;
  @apply focus:outline-none focus:ring-2 focus:ring-gpb-mint focus:ring-opacity-50;
}
```

#### Размеры кнопок
```css
.btn-sm { @apply px-4 py-2 text-body-sm; }
.btn-md { @apply px-6 py-3 text-body; }
.btn-lg { @apply px-8 py-4 text-body-lg; }
```

### Карточки

#### Основная карточка
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Заголовок</h3>
    <span class="card-category">Категория</span>
  </div>
  <div class="card-content">
    Основной контент карточки
  </div>
</div>
```

```css
.card {
  @apply bg-white rounded-2xl shadow-lg overflow-hidden;
  @apply border border-gray-100;
}

.card-header {
  @apply p-4 pb-2;
}

.card-title {
  @apply font-heading text-h4 text-gpb-black mb-1;
}

.card-category {
  @apply inline-block px-3 py-1 bg-gpb-mint text-gpb-black text-caption font-medium rounded-full;
}

.card-content {
  @apply p-4 pt-2 font-body text-body text-gray-700;
}
```

#### Карточка с градиентом
```css
.card-gradient {
  @apply gradient-violet-cumin text-white;
}

.card-gradient .card-title {
  @apply text-white;
}

.card-gradient .card-content {
  @apply text-white text-opacity-90;
}
```

### Баблы (Speech Bubbles)

#### Обычный бабл
```html
<div class="bubble">
  <span class="bubble-text">Текст в бабле</span>
</div>
```

```css
.bubble {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-full;
  @apply bg-gpb-violet text-white font-body text-body-sm font-medium;
  @apply max-w-xs;
}

.bubble-accent {
  @apply bg-gpb-raspberry;
}

.bubble-mint {
  @apply bg-gpb-mint text-gpb-black;
}

.bubble-outline {
  @apply bg-transparent border-2 border-gpb-violet text-gpb-violet;
}
```

#### Размеры баблов
```css
.bubble-sm { @apply px-3 py-1 text-caption; }
.bubble-md { @apply px-4 py-2 text-body-sm; }
.bubble-lg { @apply px-6 py-3 text-body; }
```

### Инпуты и формы

#### Текстовое поле
```html
<div class="input-group">
  <label class="input-label">Название поля</label>
  <input type="text" class="input-field" placeholder="Введите текст">
</div>
```

```css
.input-group {
  @apply mb-4;
}

.input-label {
  @apply block font-body text-body-sm font-medium text-gray-700 mb-2;
}

.input-field {
  @apply w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl;
  @apply font-body text-body text-gray-900;
  @apply focus:outline-none focus:border-gpb-violet focus:ring-2 focus:ring-gpb-violet focus:ring-opacity-20;
  @apply transition-colors duration-200;
}

.input-field:focus {
  @apply bg-gpb-violet bg-opacity-5;
}
```

#### Состояния полей
```css
.input-field.error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500;
}

.input-field.success {
  @apply border-green-500 focus:border-green-500 focus:ring-green-500;
}
```

### Аватары и портреты

#### Круглый портрет с градиентом
```html
<div class="avatar-gradient">
  <img src="avatar.jpg" alt="Имя пользователя" class="avatar-image">
</div>
```

```css
.avatar-gradient {
  @apply relative rounded-full p-1 gradient-raspberry-violet;
}

.avatar-image {
  @apply w-16 h-16 rounded-full object-cover border-2 border-white;
}

/* Размеры аватаров */
.avatar-sm .avatar-image { @apply w-10 h-10; }
.avatar-md .avatar-image { @apply w-16 h-16; }
.avatar-lg .avatar-image { @apply w-24 h-24; }
.avatar-xl .avatar-image { @apply w-32 h-32; }
```

### Иконки

#### Контурные иконки
```css
.icon {
  @apply w-6 h-6 stroke-current;
  stroke-width: 1.5;
}

.icon-sm { @apply w-4 h-4; }
.icon-md { @apply w-6 h-6; }
.icon-lg { @apply w-8 h-8; }
.icon-xl { @apply w-10 h-10; }

/* Цвета иконок */
.icon-primary { @apply text-gpb-violet; }
.icon-accent { @apply text-gpb-mint; }
.icon-raspberry { @apply text-gpb-raspberry; }
```

### Навигация

#### Нижняя навигация
```html
<nav class="bottom-nav">
  <button class="nav-item nav-item-active">
    <svg class="icon nav-icon"><!-- Home icon --></svg>
    <span class="nav-label">Главная</span>
  </button>
  <button class="nav-item">
    <svg class="icon nav-icon"><!-- Search icon --></svg>
    <span class="nav-label">Поиск</span>
  </button>
</nav>
```

```css
.bottom-nav {
  @apply flex items-center justify-around px-4 py-2 bg-white border-t border-gray-200;
  @apply fixed bottom-0 left-0 right-0 z-50;
}

.nav-item {
  @apply flex flex-col items-center justify-center py-2 px-3;
  @apply text-gray-500 transition-colors duration-200;
  @apply focus:outline-none focus:text-gpb-violet;
}

.nav-item-active {
  @apply text-gpb-violet;
}

.nav-icon {
  @apply w-6 h-6 mb-1;
}

.nav-label {
  @apply text-caption font-body font-medium;
}
```

### Модальные окна и оверлеи

#### Модальное окно
```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">Заголовок</h2>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-content">
      Содержимое модального окна
    </div>
    <div class="modal-footer">
      <button class="btn-secondary">Отмена</button>
      <button class="btn-primary">Подтвердить</button>
    </div>
  </div>
</div>
```

```css
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-end justify-center px-4 pb-4;
  @apply bg-black bg-opacity-50;
}

.modal {
  @apply w-full max-w-sm bg-white rounded-2xl shadow-xl;
  @apply transform transition-transform duration-300;
}

.modal-header {
  @apply flex items-center justify-between p-6 pb-4;
}

.modal-title {
  @apply font-heading text-h4 text-gpb-black;
}

.modal-close {
  @apply w-8 h-8 flex items-center justify-center rounded-full;
  @apply text-gray-500 hover:text-gray-700 hover:bg-gray-100;
  @apply transition-colors duration-200;
}

.modal-content {
  @apply px-6 pb-4 font-body text-body text-gray-700;
}

.modal-footer {
  @apply flex justify-end space-x-3 p-6 pt-4;
}
```

## Игровые элементы

### Игровые кнопки
```css
.game-btn-primary {
  @apply btn-primary relative overflow-hidden;
  @apply shadow-lg hover:shadow-xl;
  @apply transform hover:-translate-y-0.5 active:translate-y-0;
}

.game-btn-primary::before {
  content: '';
  @apply absolute inset-0 bg-white opacity-0 transition-opacity duration-200;
}

.game-btn-primary:hover::before {
  @apply opacity-10;
}
```

### Счетчики и прогресс-бары
```html
<div class="game-counter">
  <span class="game-counter-value">1,250</span>
  <span class="game-counter-label">Очки</span>
</div>
```

```css
.game-counter {
  @apply flex flex-col items-center justify-center p-4 rounded-2xl;
  @apply gradient-mint-melissa text-gpb-black;
  @apply shadow-lg;
}

.game-counter-value {
  @apply font-heading text-h3 font-bold;
}

.game-counter-label {
  @apply font-body text-body-sm opacity-80;
}
```

### Прогресс-бар
```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 65%"></div>
</div>
```

```css
.progress-bar {
  @apply w-full h-3 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full gradient-mint-melissa rounded-full;
  @apply transition-all duration-500 ease-out;
}
```

## Макетная система

### Контейнеры
```css
.container-app {
  @apply max-w-sm mx-auto px-4;
}

.container-full {
  @apply w-full px-4;
}
```

### Сетка
```css
.grid-base {
  @apply grid gap-4;
}

.grid-2 { @apply grid-cols-2; }
.grid-3 { @apply grid-cols-3; }
.grid-4 { @apply grid-cols-4; }
```

### Отступы
```css
.spacing-xs { @apply p-2; }
.spacing-sm { @apply p-3; }
.spacing-md { @apply p-4; }
.spacing-lg { @apply p-6; }
.spacing-xl { @apply p-8; }
```

## Анимации и переходы

### Базовые анимации
```css
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}

.animate-bounce-in {
  animation: bounceIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}
```

## Адаптивность

### Точки разрыва
```css
/* Mobile First подход */
/* Базовые стили для мобильных (до 640px) */

/* Планшеты (640px и выше) */
@screen sm {
  .responsive-text { @apply text-lg; }
}

/* Десктопы (768px и выше) */
@screen md {
  .responsive-text { @apply text-xl; }
}
```

## Правила использования

### Цветовая иерархия
1. **Основные цвета** (черный, фиалка) - 80% интерфейса
2. **Акцентные цвета** (мята, малина) - максимум 20%
3. **Градиенты** - для выделения важных элементов
4. **Фоновые цвета** - для создания глубины

### Типографическая иерархия
1. **H1-H2** - основные заголовки экранов
2. **H3-H4** - заголовки секций и карточек
3. **H5-H6** - подзаголовки
4. **Body** - основной текст
5. **Caption** - вспомогательный текст

### Принципы компоновки
1. Используйте сетку 4px для всех отступов
2. Минимальная область касания для интерактивных элементов - 44px
3. Максимальная ширина контента - 400px
4. Стандартное скругление углов - 12px (rounded-xl)

## Темная тема

### Переменные для темной темы
```css
.dark {
  --gpb-bg-primary: #1a1a1a;
  --gpb-bg-secondary: #2a2a2a;
  --gpb-text-primary: #ffffff;
  --gpb-text-secondary: #a0a0a0;
}

.dark .card {
  @apply bg-gray-800 border-gray-700;
}

.dark .input-field {
  @apply bg-gray-800 border-gray-600 text-white;
}
```

## Примеры использования

### Главный экран приложения
```html
<div class="container-app py-6">
  <header class="mb-6">
    <h1 class="font-heading text-h1 text-gpb-black mb-2">Газпромбанк Тех</h1>
    <p class="font-body text-body text-gray-600">Главное внутри</p>
  </header>
  
  <div class="grid-2 mb-6">
    <div class="card gradient-mint-melissa">
      <div class="card-content text-center">
        <div class="game-counter-value">1,250</div>
        <div class="game-counter-label">Ваши очки</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-content">
        <button class="btn-primary w-full">Начать игру</button>
      </div>
    </div>
  </div>
</div>
```

---

Этот UI Kit обеспечивает единообразный дизайн всех мобильных приложений и игр в соответствии с брендбуком Газпромбанк Тех.