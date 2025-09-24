# Газпромбанк Игровой Центр - Полный Гайдбук по стилизации и верстке

## Оглавление
1. [Основные принципы дизайна](#основные-принципы-дизайна)
2. [Цветовая система](#цветовая-система)
3. [Градиенты и эффекты](#градиенты-и-эффекты)
4. [Типографика](#типографика)
5. [Игровые компоненты](#игровые-компоненты)
6. [Анимации и переходы](#анимации-и-переходы)
7. [Макетная система](#макетная-система)
8. [Интерактивные элементы](#интерактивные-элементы)
9. [Специальные эффекты](#специальные-эффекты)
10. [Адаптивность и accessibility](#адаптивность-и-accessibility)

---

## Основные принципы дизайна

### Философия игрового UI
- **Увлекательность превыше всего**: Каждый элемент должен вызывать желание взаимодействовать
- **Градиентная магия**: Используем насыщенные градиенты для создания глубины и энергии
- **Плавные переходы**: Все изменения состояний происходят с анимацией
- **Геймификация в деталях**: Прогресс-бары, бейджи, счетчики везде где возможно

### Ключевые визуальные характеристики
```css
/* Базовые принципы */
.game-base {
  @apply transition-all duration-300 ease-out;
  @apply hover:scale-105 active:scale-95;
  @apply cursor-pointer select-none;
}

.game-depth {
  @apply shadow-lg hover:shadow-xl;
  filter: drop-shadow(0 8px 32px rgba(0,0,0,0.15));
}

.game-glow {
  @apply before:absolute before:inset-0 before:bg-white/10 before:opacity-0;
  @apply hover:before:opacity-100 before:transition-opacity before:duration-300;
}
```

---

## Цветовая система

### Основные цвета бренда (80% использования)
```css
:root {
  /* Основные цвета Газпромбанка */
  --gpb-black: #000000;
  --gpb-violet: #1919EF;
  --gpb-violet-dark: #0F0FCC;
  --gpb-violet-light: #4444F2;
  
  /* RGB варианты для прозрачности */
  --gpb-black-rgb: 0, 0, 0;
  --gpb-violet-rgb: 25, 25, 239;
}

/* Tailwind классы */
.bg-gpb-black { background-color: #000000; }
.bg-gpb-violet { background-color: #1919EF; }
.bg-gpb-violet-dark { background-color: #0F0FCC; }
.bg-gpb-violet-light { background-color: #4444F2; }

.text-gpb-black { color: #000000; }
.text-gpb-violet { color: #1919EF; }
```

### Акцентные игровые цвета (20% использования)
```css
:root {
  /* Яркие акценты для игр */
  --gpb-mint: #58FFFF;
  --gpb-mint-dark: #2BEDED;
  --gpb-mint-light: #85FFFF;
  
  --gpb-raspberry: #DD41DB;
  --gpb-raspberry-dark: #C428C6;
  --gpb-raspberry-light: #E668E4;
  
  /* Дополнительные игровые цвета */
  --gpb-gold: #FFD700;
  --gpb-emerald: #50C878;
  --gpb-orange: #FF8C42;
  --gpb-purple: #9B59B6;
}

/* Tailwind классы для игровых цветов */
.bg-gpb-mint { background-color: #58FFFF; }
.bg-gpb-raspberry { background-color: #DD41DB; }
.bg-gpb-gold { background-color: #FFD700; }
.bg-gpb-emerald { background-color: #50C878; }
.bg-gpb-orange { background-color: #FF8C42; }
.bg-gpb-purple { background-color: #9B59B6; }

.text-gpb-mint { color: #58FFFF; }
.text-gpb-raspberry { color: #DD41DB; }
.text-gpb-gold { color: #FFD700; }
.text-gpb-emerald { color: #50C878; }
```

### Вспомогательные цвета
```css
:root {
  /* Нейтральные цвета */
  --gpb-gray-50: #F9FAFB;
  --gpb-gray-100: #F3F4F6;
  --gpb-gray-200: #E5E7EB;
  --gpb-gray-300: #D1D5DB;
  --gpb-gray-400: #9CA3AF;
  --gpb-gray-500: #6B7280;
  --gpb-gray-600: #4B5563;
  --gpb-gray-700: #374151;
  --gpb-gray-800: #1F2937;
  --gpb-gray-900: #111827;
  
  /* Состояния */
  --gpb-success: #10B981;
  --gpb-warning: #F59E0B;
  --gpb-error: #EF4444;
  --gpb-info: #3B82F6;
}
```

---

## Градиенты и эффекты

### Основные игровые градиенты
```css
/* Энергетические градиенты */
.gradient-electric {
  background: linear-gradient(135deg, #1919EF 0%, #58FFFF 100%);
}

.gradient-power {
  background: linear-gradient(135deg, #DD41DB 0%, #FF8C42 100%);
}

.gradient-wealth {
  background: linear-gradient(135deg, #FFD700 0%, #50C878 100%);
}

.gradient-mystery {
  background: linear-gradient(135deg, #9B59B6 0%, #1919EF 100%);
}

/* Фоновые градиенты для секций */
.gradient-header {
  background: linear-gradient(135deg, #1919EF 0%, #9B59B6 50%, #DD41DB 100%);
}

.gradient-card-mint {
  background: linear-gradient(135deg, #58FFFF 0%, #2BEDED 100%);
}

.gradient-card-raspberry {
  background: linear-gradient(135deg, #DD41DB 0%, #C428C6 100%);
}

.gradient-card-gold {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

/* Радиальные градиенты для особых эффектов */
.gradient-radial-glow {
  background: radial-gradient(circle at center, rgba(88,255,255,0.3) 0%, transparent 70%);
}

.gradient-conic-rainbow {
  background: conic-gradient(from 0deg, #1919EF, #DD41DB, #58FFFF, #FFD700, #1919EF);
}
```

### Специальные эффекты и overlay
```css
/* Стеклянный эффект */
.glass-effect {
  @apply bg-white/10 backdrop-blur-md border border-white/20;
  backdrop-filter: blur(12px) saturate(180%);
}

.glass-dark {
  @apply bg-black/20 backdrop-blur-md border border-white/10;
}

/* Неоновое свечение */
.neon-glow {
  filter: drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor);
}

.neon-text {
  text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor;
}

/* Металлический эффект */
.metallic {
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow: 
    inset 8px 8px 16px #d9d9d9,
    inset -8px -8px 16px #ffffff;
}

/* Декоративные элементы */
.decoration-orb {
  @apply absolute rounded-full blur-xl opacity-30 animate-pulse;
}

.decoration-shine {
  @apply absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent;
  @apply opacity-0 transition-opacity duration-300;
}

.decoration-shine:hover {
  @apply opacity-100;
}
```

---

## Типографика

### Иерархия заголовков (Игровая адаптация)
```css
.font-game-title {
  @apply font-black text-4xl md:text-5xl tracking-tight;
  @apply bg-gradient-to-r from-gpb-violet to-gpb-raspberry bg-clip-text text-transparent;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.font-section-title {
  @apply font-bold text-2xl md:text-3xl text-gray-800;
  @apply mb-4 tracking-tight;
}

.font-card-title {
  @apply font-bold text-xl text-current;
  @apply mb-1 tracking-tight leading-tight;
}

.font-card-subtitle {
  @apply text-sm opacity-90 font-medium;
}

.font-score {
  @apply font-black text-3xl md:text-4xl;
  @apply tabular-nums tracking-tight;
}

.font-badge {
  @apply text-xs font-bold uppercase tracking-wider;
}
```

### Основной текст и UI элементы
```css
.font-ui-primary {
  @apply text-base font-medium leading-relaxed;
}

.font-ui-secondary {
  @apply text-sm font-normal text-gray-600;
}

.font-ui-caption {
  @apply text-xs font-medium text-gray-500 tracking-wide;
}

.font-button {
  @apply font-semibold text-base tracking-wide;
}

.font-nav {
  @apply text-xs font-medium tracking-wider uppercase;
}
```

---

## Игровые компоненты

### Игровые карточки
```css
/* Базовая игровая карточка */
.game-card {
  @apply relative overflow-hidden rounded-2xl shadow-lg;
  @apply transition-all duration-300 ease-out;
  @apply hover:scale-105 hover:shadow-xl cursor-pointer;
  min-height: 160px;
}

.game-card::before {
  content: '';
  @apply absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full blur-xl;
}

.game-card::after {
  content: '';
  @apply absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full blur-lg;
  transform: translate(1rem, 1rem);
}

/* Контент игровой карточки */
.game-card-content {
  @apply relative p-4 h-full flex flex-col justify-between z-10;
}

.game-card-header {
  @apply flex justify-between items-start mb-4;
}

.game-card-icon {
  @apply p-2 rounded-xl bg-white/20 backdrop-blur-sm;
}

.game-card-footer {
  @apply flex items-center justify-between text-xs opacity-80;
}

/* Состояния карточек */
.game-card-active {
  @apply game-card;
}

.game-card-locked {
  @apply game-card opacity-60 cursor-not-allowed;
  @apply hover:scale-100 hover:shadow-lg;
}

.game-card-coming-soon {
  @apply game-card-locked;
}
```

HTML пример:
```html
<div class="game-card gradient-electric text-white">
  <div class="game-card-content">
    <div class="game-card-header">
      <div class="game-card-icon">
        <ShieldIcon size={32} />
      </div>
      <div class="badge-new">НОВОЕ</div>
    </div>
    
    <div>
      <h3 class="font-card-title">Щит и Рубль</h3>
      <p class="font-card-subtitle mb-3">Защита от мошенников</p>
      
      <div class="progress-bar mb-3">
        <div class="progress-fill" style="width: 85%"></div>
      </div>
      
      <div class="game-card-footer">
        <span>Страхование карт</span>
        <ChevronRightIcon size={16} />
      </div>
    </div>
  </div>
</div>
```

### Счетчики и статистика
```css
/* Главный счетчик очков */
.score-display {
  @apply text-center p-6 rounded-2xl;
  @apply gradient-wealth text-white;
  @apply shadow-xl relative overflow-hidden;
}

.score-value {
  @apply font-score animate-pulse;
  @apply bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent;
}

.score-label {
  @apply font-ui-secondary opacity-90 mt-2;
}

/* Мини-статистика */
.mini-stat {
  @apply bg-white/10 backdrop-blur-sm rounded-xl p-4;
  @apply text-white text-center;
}

.mini-stat-value {
  @apply text-2xl font-bold mb-1 tabular-nums;
}

.mini-stat-label {
  @apply text-sm opacity-80;
}

.mini-stat-icon {
  @apply mb-2 opacity-80;
}
```

### Прогресс-бары и индикаторы
```css
/* Основной прогресс-бар */
.progress-bar {
  @apply w-full h-2 bg-black/20 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-white/80 rounded-full transition-all duration-1000 ease-out;
  @apply relative overflow-hidden;
}

.progress-fill::after {
  content: '';
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent;
  @apply animate-shimmer;
}

/* Круговой прогресс */
.circular-progress {
  @apply relative w-16 h-16 rounded-full;
  background: conic-gradient(from 0deg, #1919EF var(--progress, 0%), #ffffff20 var(--progress, 0%));
}

.circular-progress::before {
  content: '';
  @apply absolute inset-2 rounded-full bg-current;
}

/* Индикатор уровня */
.level-indicator {
  @apply inline-flex items-center gap-2 px-3 py-1 rounded-full;
  @apply bg-gradient-to-r from-gpb-gold to-orange-400 text-white;
  @apply font-badge shadow-lg;
}
```

### Бейджи и лейблы
```css
/* Основные бейджи */
.badge-new {
  @apply bg-gpb-gold text-black text-xs font-bold px-2 py-1 rounded-full;
  @apply animate-pulse shadow-lg;
}

.badge-locked {
  @apply bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full;
  @apply flex items-center gap-1;
}

.badge-hot {
  @apply bg-gradient-to-r from-red-500 to-orange-500 text-white;
  @apply text-xs font-bold px-2 py-1 rounded-full;
  @apply animate-bounce;
}

.badge-pro {
  @apply bg-gradient-to-r from-gpb-violet to-gpb-raspberry text-white;
  @apply text-xs font-bold px-2 py-1 rounded-full;
}

/* Статусные индикаторы */
.status-online {
  @apply w-3 h-3 bg-green-400 rounded-full animate-pulse;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
}

.status-offline {
  @apply w-3 h-3 bg-gray-400 rounded-full;
}

/* Категорийные теги */
.category-tag {
  @apply inline-block px-3 py-1 text-xs font-medium rounded-full;
  @apply bg-gpb-mint/20 text-gpb-mint border border-gpb-mint/30;
}

.category-quiz { @apply bg-blue-100 text-blue-800 border-blue-200; }
.category-puzzle { @apply bg-purple-100 text-purple-800 border-purple-200; }
.category-strategy { @apply bg-green-100 text-green-800 border-green-200; }
```

---

## Анимации и переходы

### Базовые анимации
```css
/* Hover эффекты для интерактивных элементов */
.hover-lift {
  @apply transition-all duration-300 ease-out;
  @apply hover:scale-105 hover:-translate-y-1 hover:shadow-xl;
}

.hover-glow {
  @apply transition-all duration-300;
  @apply hover:shadow-2xl;
}

.hover-glow:hover {
  filter: drop-shadow(0 0 20px rgba(88, 255, 255, 0.4));
}

/* Активные состояния */
.active-press {
  @apply active:scale-95 active:duration-75;
}

.active-bounce {
  @apply active:animate-bounce;
}

/* Кастомные keyframes */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { 
    filter: drop-shadow(0 0 5px currentColor);
  }
  50% { 
    filter: drop-shadow(0 0 20px currentColor) drop-shadow(0 0 40px currentColor);
  }
}

@keyframes count-up {
  from {
    transform: scale(1.2);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Применение анимаций */
.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-count-up {
  animation: count-up 0.5s ease-out;
}
```

### Переходы состояний
```css
/* Переходы загрузки */
.loading-enter {
  @apply opacity-0 translate-y-4 scale-95;
}

.loading-enter-active {
  @apply opacity-100 translate-y-0 scale-100;
  @apply transition-all duration-500 ease-out;
}

/* Переходы между экранами */
.screen-transition-enter {
  @apply opacity-0 translate-x-full;
}

.screen-transition-enter-active {
  @apply opacity-100 translate-x-0;
  @apply transition-all duration-300 ease-out;
}

.screen-transition-exit {
  @apply opacity-100 translate-x-0;
}

.screen-transition-exit-active {
  @apply opacity-0 -translate-x-full;
  @apply transition-all duration-300 ease-in;
}

/* Анимации появления элементов */
.fade-in-up {
  @apply opacity-0 translate-y-8;
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }
.stagger-item:nth-child(4) { animation-delay: 0.4s; }
.stagger-item:nth-child(5) { animation-delay: 0.5s; }
```

---

## Макетная система

### Контейнеры и сетки
```css
/* Основные контейнеры */
.game-container {
  @apply max-w-md mx-auto px-4 py-6;
  @apply min-h-screen bg-gradient-to-br from-gray-50 to-gray-100;
}

.section-container {
  @apply mb-8;
}

.content-padding {
  @apply px-4 py-6;
}

/* Игровые сетки */
.game-grid {
  @apply grid gap-4;
}

.game-grid-1 { @apply grid-cols-1; }
.game-grid-2 { @apply grid-cols-2; }
.game-grid-3 { @apply grid-cols-3; }

/* Адаптивные сетки */
.responsive-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4;
}

.responsive-list {
  @apply space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4;
}
```

### Отступы и позиционирование
```css
/* Стандартные отступы (система 4px) */
.spacing-xs { @apply p-2; }    /* 8px */
.spacing-sm { @apply p-3; }    /* 12px */
.spacing-md { @apply p-4; }    /* 16px */
.spacing-lg { @apply p-6; }    /* 24px */
.spacing-xl { @apply p-8; }    /* 32px */

/* Вертикальные отступы для секций */
.section-spacing { @apply mb-8; }
.section-spacing-sm { @apply mb-6; }
.section-spacing-lg { @apply mb-12; }

/* Фиксированные элементы */
.fixed-bottom-nav {
  @apply fixed bottom-0 left-0 right-0 z-50;
  @apply bg-white border-t border-gray-200 px-4 py-2;
}

.floating-action-button {
  @apply fixed bottom-20 right-4 z-40;
  @apply p-4 rounded-full shadow-lg;
  @apply gradient-electric text-white;
  @apply hover:scale-110 active:scale-95 transition-transform duration-200;
}
```

---

## Интерактивные элементы

### Кнопки
```css
/* Основная игровая кнопка */
.btn-game-primary {
  @apply px-6 py-3 rounded-xl font-button;
  @apply gradient-electric text-white shadow-lg;
  @apply hover:scale-105 hover:shadow-xl active:scale-95;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-4 focus:ring-gpb-violet/30;
}

.btn-game-primary::before {
  content: '';
  @apply absolute inset-0 bg-white/20 opacity-0 rounded-xl;
  @apply transition-opacity duration-200;
}

.btn-game-primary:hover::before {
  @apply opacity-100;
}

/* Вторичная кнопка */
.btn-game-secondary {
  @apply px-6 py-3 rounded-xl font-button;
  @apply bg-transparent border-2 border-gpb-violet text-gpb-violet;
  @apply hover:bg-gpb-violet hover:text-white hover:scale-105;
  @apply active:scale-95 transition-all duration-200;
}

/* Кнопка с иконкой */
.btn-icon {
  @apply flex items-center justify-center gap-2;
  @apply p-3 rounded-full aspect-square;
  @apply bg-white/20 backdrop-blur-sm text-current;
  @apply hover:bg-white/30 hover:scale-110;
  @apply transition-all duration-200;
}

/* Размеры кнопок */
.btn-sm { @apply px-4 py-2 text-sm; }
.btn-md { @apply px-6 py-3 text-base; }
.btn-lg { @apply px-8 py-4 text-lg; }
.btn-xl { @apply px-10 py-5 text-xl; }
```

### Формы и инпуты
```css
/* Игровые поля ввода */
.input-game {
  @apply w-full px-4 py-3 rounded-xl;
  @apply bg-white/90 backdrop-blur-sm border-2 border-transparent;
  @apply text-gray-800 placeholder-gray-500;
  @apply focus:bg-white focus:border-gpb-violet focus:outline-none;
  @apply focus:ring-4 focus:ring-gpb-violet/20;
  @apply transition-all duration-200;
}

.input-game:focus {
  @apply shadow-lg scale-[1.02];
}

/* Чекбоксы и радио */
.checkbox-game {
  @apply w-6 h-6 rounded-lg border-2 border-gpb-violet;
  @apply bg-transparent checked:bg-gpb-violet;
  @apply focus:ring-4 focus:ring-gpb-violet/20;
  @apply transition-all duration-200;
}

.radio-game {
  @apply checkbox-game rounded-full;
}

/* Слайдеры */
.slider-game {
  @apply w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer;
}

.slider-game::-webkit-slider-thumb {
  @apply appearance-none w-6 h-6 bg-gpb-violet rounded-full cursor-pointer;
  @apply shadow-lg hover:scale-110 transition-transform;
}
```

### Навигация
```css
/* Нижняя навигация */
.bottom-nav {
  @apply flex items-center justify-around;
  @apply px-4 py-2 bg-white/95 backdrop-blur-md;
  @apply border-t border-gray-200/50;
}

.nav-item {
  @apply flex flex-col items-center justify-center;
  @apply py-2 px-3 rounded-lg;
  @apply text-gray-500 transition-all duration-200;
  @apply hover:text-gpb-violet hover:bg-gpb-violet/5;
  @apply focus:outline-none focus:text-gpb-violet;
}

.nav-item-active {
  @apply text-gpb-violet bg-gpb-violet/10;
}

.nav-icon {
  @apply w-6 h-6 mb-1 transition-transform duration-200;
}

.nav-item:hover .nav-icon {
  @apply scale-110;
}

.nav-label {
  @apply text-xs font-nav;
}

/* Табы */
.tab-container {
  @apply flex bg-gray-100 rounded-xl p-1;
}

.tab-item {
  @apply flex-1 py-2 px-4 rounded-lg text-center;
  @apply text-sm font-medium text-gray-600;
  @apply transition-all duration-200 cursor-pointer;
}

.tab-item-active {
  @apply bg-white text-gpb-violet shadow-sm;
}

.tab-item:hover:not(.tab-item-active) {
  @apply text-gray-800 bg-gray-50;
}
```

---

## Специальные эффекты

### Particles и декорации
```css
/* Частицы в фоне */
.particles-container {
  @apply absolute inset-0 overflow-hidden pointer-events-none;
}

.particle {
  @apply absolute w-2 h-2 bg-white/30 rounded-full;
  animation: float-particle 4s ease-in-out infinite;
}

@keyframes float-particle {
  0%, 100% { 
    transform: translateY(0px) translateX(0px) scale(0.8);
    opacity: 0.3;
  }
  33% { 
    transform: translateY(-20px) translateX(10px) scale(1);
    opacity: 0.8;
  }
  66% { 
    transform: translateY(-10px) translateX(-5px) scale(0.9);
    opacity: 0.5;
  }
}

.particle:nth-child(odd) {
  animation-delay: 0.5s;
  animation-duration: 6s;
}

.particle:nth-child(even) {
  animation-delay: 1.5s;
  animation-duration: 5s;
}

/* Звездочки и искры */
.sparkle {
  @apply absolute pointer-events-none;
}

.sparkle::before,
.sparkle::after {
  content: '';
  @apply absolute w-1 h-1 bg-white rounded-full;
  animation: sparkle 1.5s ease-in-out infinite;
}

.sparkle::before {
  @apply -top-2 -left-2;
}

.sparkle::after {
  @apply -bottom-2 -right-2;
  animation-delay: 0.7s;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}
```

### Модальные окна и оверлеи
```css
/* Игровые модальные окна */
.modal-overlay-game {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  @apply bg-black/60 backdrop-blur-sm p-4;
  @apply animate-fade-in;
}

.modal-game {
  @apply w-full max-w-sm bg-white rounded-2xl shadow-2xl;
  @apply transform animate-slide-up overflow-hidden;
}

.modal-header-game {
  @apply gradient-header text-white p-6 text-center relative;
}

.modal-header-game::before {
  content: '';
  @apply absolute inset-0 bg-gradient-to-br from-white/10 to-transparent;
}

.modal-title-game {
  @apply font-section-title relative z-10;
}

.modal-content-game {
  @apply p-6 text-center;
}

.modal-footer-game {
  @apply flex gap-3 p-6 pt-0;
}

/* Toast уведомления */
.toast-container {
  @apply fixed top-4 right-4 z-60 space-y-2;
}

.toast {
  @apply px-4 py-3 rounded-xl shadow-lg;
  @apply bg-white border-l-4 border-gpb-violet;
  @apply animate-slide-in-right;
}

.toast-success {
  @apply border-green-500 bg-green-50 text-green-800;
}

.toast-error {
  @apply border-red-500 bg-red-50 text-red-800;
}

.toast-info {
  @apply border-blue-500 bg-blue-50 text-blue-800;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Игровые overlay эффекты
```css
/* Конфетти эффект */
.confetti-container {
  @apply fixed inset-0 pointer-events-none z-40;
}

.confetti {
  @apply absolute w-2 h-2 opacity-90;
  animation: confetti-fall 3s ease-out forwards;
}

.confetti-1 { @apply bg-gpb-gold; }
.confetti-2 { @apply bg-gpb-mint; }
.confetti-3 { @apply bg-gpb-raspberry; }
.confetti-4 { @apply bg-gpb-violet; }

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Ripple эффект при клике */
.ripple {
  @apply absolute pointer-events-none;
  @apply w-0 h-0 rounded-full bg-white/50;
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    width: 100px;
    height: 100px;
    margin: -50px 0 0 -50px;
    opacity: 0;
  }
}

/* Пульсирующий border */
.pulse-border {
  @apply relative;
}

.pulse-border::before {
  content: '';
  @apply absolute -inset-1 rounded-2xl opacity-75 blur-sm;
  @apply bg-gradient-to-r from-gpb-violet via-gpb-raspberry to-gpb-mint;
  animation: pulse-border 2s ease-in-out infinite alternate;
}

@keyframes pulse-border {
  0% { opacity: 0.5; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.02); }
}
```

---

## Адаптивность и Accessibility

### Responsive Design
```css
/* Мобильные устройства (по умолчанию) */
.mobile-stack {
  @apply flex flex-col space-y-4;
}

.mobile-full {
  @apply w-full;
}

.mobile-text {
  @apply text-sm;
}

/* Планшеты (640px+) */
@screen sm {
  .sm\:desktop-grid {
    @apply grid grid-cols-2 gap-4 space-y-0;
  }
  
  .sm\:desktop-text {
    @apply text-base;
  }
  
  .sm\:desktop-padding {
    @apply px-6 py-8;
  }
}

/* Десктопы (768px+) */
@screen md {
  .md\:desktop-layout {
    @apply max-w-2xl;
  }
  
  .md\:desktop-text {
    @apply text-lg;
  }
  
  .md\:hover-effects:hover {
    @apply scale-105 shadow-xl;
  }
}

/* Большие экраны (1024px+) */
@screen lg {
  .lg\:wide-layout {
    @apply max-w-4xl grid-cols-3;
  }
}
```

### Accessibility
```css
/* Фокус для клавиатурной навигации */
.focus-game {
  @apply focus:outline-none focus:ring-4 focus:ring-gpb-violet/30;
  @apply focus:ring-offset-2 focus:ring-offset-white;
}

.focus-high-contrast {
  @apply focus:bg-gpb-violet focus:text-white;
  @apply focus:border-transparent;
}

/* Высокий контраст для текста */
.high-contrast-text {
  @apply text-gray-900;
  text-shadow: 0 0 2px rgba(255,255,255,0.8);
}

.high-contrast-bg {
  @apply bg-white/95 backdrop-blur-sm;
}

/* Анимации с учетом prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .respect-motion-preference {
    @apply transition-none animate-none;
  }
  
  .respect-motion-preference * {
    @apply transition-none animate-none;
  }
}

/* Размеры touch targets (минимум 44px) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  @apply flex items-center justify-center;
}

/* Скрытый текст для скрин-ридеров */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip to content ссылка */
.skip-to-content {
  @apply absolute -top-10 left-4 z-50 bg-gpb-violet text-white px-4 py-2 rounded;
  @apply focus:top-4 transition-all duration-200;
}
```

### Dark Mode Support
```css
/* Темная тема */
.dark {
  --gpb-bg-primary: #0F0F0F;
  --gpb-bg-secondary: #1F1F1F;
  --gpb-text-primary: #FFFFFF;
  --gpb-text-secondary: #B0B0B0;
  --gpb-border-color: #333333;
}

.dark .game-card {
  @apply bg-gray-800/50 border-gray-700/50;
}

.dark .glass-effect {
  @apply bg-white/5 border-white/10;
}

.dark .input-game {
  @apply bg-gray-800/80 border-gray-600 text-white;
  @apply focus:bg-gray-800 focus:border-gpb-violet;
}

.dark .modal-game {
  @apply bg-gray-800 text-white;
}

/* Автоматическое переключение */
@media (prefers-color-scheme: dark) {
  .auto-dark {
    @apply dark;
  }
}
```

---

## Практические примеры применения

### Пример: Карточка игры
```html
<div class="game-card gradient-electric text-white stagger-item fade-in-up">
  <div class="particles-container">
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
  </div>
  
  <div class="game-card-content">
    <div class="game-card-header">
      <div class="game-card-icon neon-glow">
        <ShieldIcon size={32} />
      </div>
      <div class="badge-new">НОВОЕ</div>
    </div>
    
    <div>
      <h3 class="font-card-title">Щит и Рубль</h3>
      <p class="font-card-subtitle mb-3">Защита от мошенников</p>
      
      <div class="progress-bar mb-3">
        <div class="progress-fill animate-shimmer" style="--progress: 85%"></div>
      </div>
      
      <div class="game-card-footer">
        <div class="flex items-center gap-1">
          <StarIcon size={12} className="fill-current" />
          <span>Страхование карт</span>
        </div>
        <ChevronRightIcon size={16} className="opacity-60" />
      </div>
    </div>
  </div>
</div>
```

### Пример: Счетчик очков
```html
<div class="score-display animate-float">
  <div class="decoration-shine"></div>
  <div class="flex items-center gap-2 mb-2">
    <CoinsIcon size={20} className="text-gpb-gold neon-glow" />
    <span class="font-ui-secondary">Ваши очки</span>
  </div>
  <div class="score-value animate-count-up">1,250</div>
  <div class="score-label">Уровень: Pro</div>
</div>
```

### Пример: Модальное окно награды
```html
<div class="modal-overlay-game">
  <div class="modal-game">
    <div class="modal-header-game">
      <div class="confetti-container">
        <div class="confetti confetti-1" style="left: 20%; animation-delay: 0s;"></div>
        <div class="confetti confetti-2" style="left: 40%; animation-delay: 0.2s;"></div>
        <div class="confetti confetti-3" style="left: 60%; animation-delay: 0.4s;"></div>
        <div class="confetti confetti-4" style="left: 80%; animation-delay: 0.6s;"></div>
      </div>
      <TrophyIcon size={48} className="neon-glow mb-4" />
      <h2 class="modal-title-game">Поздравляем!</h2>
      <p class="opacity-90">Вы получили новое достижение</p>
    </div>
    
    <div class="modal-content-game">
      <div class="bg-gpb-violet/10 rounded-xl p-4 mb-4">
        <h3 class="font-bold text-gpb-violet mb-2">Эксперт по безопасности</h3>
        <p class="text-sm text-gray-600">
          Вы успешно прошли все уровни квиза "Щит и Рубль"
        </p>
      </div>
      
      <div class="text-center">
        <div class="text-2xl font-bold text-gpb-gold mb-1">+500</div>
        <div class="text-sm text-gray-500">Бонусных очков</div>
      </div>
    </div>
    
    <div class="modal-footer-game">
      <button class="btn-game-secondary flex-1">Поделиться</button>
      <button class="btn-game-primary flex-1">Продолжить</button>
    </div>
  </div>
</div>
```

---

## Заключение и рекомендации

### Основные принципы использования
1. **Иерархия важности**: Основные элементы используют яркие градиенты, второстепенные — приглушенные цвета
2. **Консистентность**: Все интерактивные элементы должны иметь hover и active состояния
3. **Производительность**: Используйте CSS-анимации вместо JS где возможно
4. **Accessibility**: Всегда тестируйте с клавиатурой и скрин-ридером

### Чек-лист перед релизом
- [ ] Все интерактивные элементы имеют размер минимум 44px
- [ ] Градиенты не используются на мелком тексте
- [ ] Анимации отключаются при `prefers-reduced-motion`
- [ ] Контрастность текста соответствует WCAG 2.1 AA
- [ ] Все состояния кнопок проработаны (hover, active, focus, disabled)
- [ ] Мобильная версия протестирована на устройствах с маленьким экраном
- [ ] Темная тема работает корректно

Этот гайдбук покрывает все аспекты создания современного игрового интерфейса в стиле Газпромбанка с упором на визуальную привлекательность и отличный пользовательский опыт.