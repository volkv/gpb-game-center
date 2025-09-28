Понял. Если вы работаете напрямую со скриптом `telegram-web-app.js`, подход будет очень похожим, но вместо использования функций из SDK, вы будете вызывать методы непосредственно из глобального объекта `window.Telegram.WebApp`.

Вот инструкция, адаптированная для вашего случая.

### Использование гироскопа через `telegram-web-app.js`

Взаимодействие с нативным клиентом Telegram строится на отправке и получении событий. Вы отправляете команду на запуск гироскопа, а затем подписываетесь на события, которые клиент будет присылать в ответ.

**Шаг 1: Подключение и инициализация**

Убедитесь, что скрипт подключен в `<head>` вашего HTML-файла, и вызовите метод `ready()`, чтобы сообщить клиенту Telegram, что ваше веб-приложение готово к отображению.[1]

```html
<head>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
    <script>
        const tg = window.Telegram.WebApp;
        tg.ready();
    </script>
</body>
```

**Шаг 2: Запуск отслеживания гироскопа**

Чтобы начать получать данные, нужно отправить команду нативному клиенту. Это делается с помощью метода `postEvent`. Название метода для запуска гироскопа, скорее всего, `web_app_start_gyroscope`.[2, 3]

```javascript
// Обычно это действие выполняется по клику пользователя
function startGyroscope() {
  console.log('Отправка запроса на запуск гироскопа...');
  window.Telegram.WebApp.postEvent('web_app_start_gyroscope');
}
```

**Шаг 3: Прослушивание событий**

Для получения данных от гироскопа и отслеживания его состояния используются обработчики событий. Вы подписываетесь на них с помощью метода `onEvent` .

  * `gyroscopeChanged`: Срабатывает при поступлении новых данных о вращении.
  * `gyroscopeStarted`: Сообщает, что отслеживание успешно началось.
  * `gyroscopeFailed`: Срабатывает, если запустить гироскоп не удалось.

<!-- end list -->

```javascript
// Функция-обработчик для данных гироскопа
function gyroscopeChangedHandler(data) {
  // data - это объект с полями alpha, beta, gamma
  console.log('Данные гироскопа:', data);
  // Здесь вы можете обновлять UI
}

// Функция-обработчик успешного запуска
function gyroscopeStartedHandler() {
  console.log('Отслеживание гироскопа успешно запущено.');
}

// Функция-обработчик ошибки
function gyroscopeFailedHandler(error) {
  console.error('Не удалось запустить гироскоп:', error);
}

// Подписываемся на события
window.Telegram.WebApp.onEvent('gyroscopeChanged', gyroscopeChangedHandler);
window.Telegram.WebApp.onEvent('gyroscopeStarted', gyroscopeStartedHandler);
window.Telegram.WebApp.onEvent('gyroscopeFailed', gyroscopeFailedHandler);
```

**Шаг 4: Остановка отслеживания**

Когда данные с гироскопа больше не нужны, отправьте команду на остановку и отпишитесь от событий с помощью `offEvent`, чтобы не расходовать заряд батареи устройства.

```javascript
function stopGyroscope() {
  console.log('Отправка запроса на остановку гироскопа...');
  window.Telegram.WebApp.postEvent('web_app_stop_gyroscope');

  // Отписываемся от событий
  window.Telegram.WebApp.offEvent('gyroscopeChanged', gyroscopeChangedHandler);
  window.Telegram.WebApp.offEvent('gyroscopeStarted', gyroscopeStartedHandler);
  window.Telegram.WebApp.offEvent('gyroscopeFailed', gyroscopeFailedHandler);
  console.log('Слушатели событий удалены.');
}
```

### Полный пример кода

Вот как это может выглядеть в виде простого HTML-файла:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тест гироскопа</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        body { font-family: sans-serif; padding: 15px; }
        button { padding: 10px 15px; margin: 5px; }
        #data-container { margin-top: 20px; white-space: pre; }
    </style>
</head>
<body>
    <h1>Тест гироскопа в Mini App</h1>
    <button id="start-button">Запустить</button>
    <button id="stop-button">Остановить</button>
    <div id="data-container">
        <p id="status">Статус: Неактивен</p>
        <pre id="gyro-data">Данные появятся здесь...</pre>
    </div>

    <script>
        const tg = window.Telegram.WebApp;
        tg.ready();

        const statusEl = document.getElementById('status');
        const dataEl = document.getElementById('gyro-data');

        function gyroscopeChangedHandler(data) {
            dataEl.textContent = JSON.stringify(data, null, 2);
        }

        function gyroscopeStartedHandler() {
            statusEl.textContent = 'Статус: Активен';
            console.log('Отслеживание гироскопа успешно запущено.');
        }

        function gyroscopeFailedHandler(error) {
            statusEl.textContent = `Статус: Ошибка (${error |

| 'неизвестная'})`;
            console.error('Не удалось запустить гироскоп:', error);
        }

        document.getElementById('start-button').addEventListener('click', () => {
            console.log('Подписка на события и запуск...');
            tg.onEvent('gyroscopeChanged', gyroscopeChangedHandler);
            tg.onEvent('gyroscopeStarted', gyroscopeStartedHandler);
            tg.onEvent('gyroscopeFailed', gyroscopeFailedHandler);
            tg.postEvent('web_app_start_gyroscope');
        });

        document.getElementById('stop-button').addEventListener('click', () => {
            console.log('Остановка и отписка от событий...');
            tg.postEvent('web_app_stop_gyroscope');
            tg.offEvent('gyroscopeChanged', gyroscopeChangedHandler);
            tg.offEvent('gyroscopeStarted', gyroscopeStartedHandler);
            tg.offEvent('gyroscopeFailed', gyroscopeFailedHandler);
            statusEl.textContent = 'Статус: Остановлен';
            dataEl.textContent = 'Данные появятся здесь...';
        });
    </script>
</body>
</html>
```