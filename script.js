let htmlEditor, cssEditor, jsEditor; // Глобальные переменные для экземпляров Monaco Editor

// Функция для определения темы Monaco на основе нашей темы
function getMonacoTheme(fandTheme) {
    switch (fandTheme) {
        case 'dark':
        case 'modern': // 'modern' theme uses 'vs-dark'
            return 'vs-dark';
        case 'light':
        case 'red':
        case 'blue':
        case 'green':
        default:
            return 'vs-light'; // Для цветных тем используем светлую тему Monaco
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Получение элементов DOM (ДЕКСТОПНЫЕ ВЕРСИИ) ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const editorContainers = document.querySelectorAll('.monaco-editor-container');

    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const learnProgrammingBtn = document.getElementById('learnProgrammingBtn');
    const showOutputBtn = document.getElementById('showOutputBtn');
    const toggleHeaderBtn = document.getElementById('toggleHeaderBtn');

    // --- НОВЫЕ ЭЛЕМЕНТЫ: Мобильный Сайдбар ---
    const menuToggleBtn = document.getElementById('menuToggleBtn'); // Гамбургер
    const mobileSidebar = document.getElementById('mobileSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');

    // --- НОВЫЕ ЭЛЕМЕНТЫ: Мобильные кнопки внутри сайдбара (дубликаты) ---
    const addBtnMobile = document.getElementById('addBtnMobile');
    const clearBtnMobile = document.getElementById('clearBtnMobile');
    const settingsBtnMobile = document.getElementById('settingsBtnMobile');
    const learnProgrammingBtnMobile = document.getElementById('learnProgrammingBtnMobile');
    const showOutputBtnMobile = document.getElementById('showOutputBtnMobile');
    const toggleHeaderBtnMobile = document.getElementById('toggleHeaderBtnMobile');


    // --- Модальные окна и Плавающие кнопки ---
    const addModal = document.getElementById('addModal');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn'); 

    const addBoilerplateBtn = document.getElementById('addBoilerplateBtn');
    const addMinimalBtn = document.getElementById('addMinimalBtn');
    const addEmptyBtn = document.getElementById('addEmptyBtn');

    const themeSelect = document.getElementById('themeSelect');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const buttonDesignSelect = document.getElementById('buttonDesignSelect');

    const fullScreenOutputModal = document.getElementById('fullScreenOutputModal');
    const fullScreenOutputFrame = document.getElementById('fullScreenOutputFrame');
    const closeFullScreenOutputBtn = document.getElementById('closeFullScreenOutputBtn');

    const floatingOutputBtn = document.getElementById('floatingOutputBtn');
    const floatingToggleHeaderBtn = document.getElementById('floatingToggleHeaderBtn');

    const learningPanel = document.getElementById('learningPanel'); 
    const closeLearningPanelBtn = document.getElementById('closeLearningPanelBtn'); 

    // --- Функции для управления блюром фона ---
    function updateBlurEffect() {
        const anyModalActive = document.querySelectorAll('.modal-overlay.active').length > 0;
        const learningPanelActive = learningPanel.classList.contains('active');
        const sidebarActive = mobileSidebar.classList.contains('active'); 

        if (anyModalActive || learningPanelActive || sidebarActive) { 
            document.body.classList.add('blurred');
        } else {
            document.body.classList.remove('blurred');
        }
    }

    // --- Функции для модальных окон, панели обучения И САЙДБАРА ---
    function openSidebar() {
        mobileSidebar.classList.add('active');
        updateBlurEffect();
    }

    function closeSidebar() {
        mobileSidebar.classList.remove('active');
        updateBlurEffect();
    }

    function openModal(modal) {
        modal.classList.add('active');
        closeSidebar(); 
        updateBlurEffect();
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        updateBlurEffect();
    }

    function openLearningPanel() {
        learningPanel.classList.add('active');
        closeSidebar(); 
        updateBlurEffect();
    }

    function closeLearningPanel() {
        learningPanel.classList.remove('active');
        updateBlurEffect();
    }

    // --- Обновление iframe ---
    function updateOutput() {
        // Проверяем, инициализированы ли редакторы
        if (!htmlEditor || !cssEditor || !jsEditor) return; 
        
        const html = htmlEditor.getValue();
        const css = cssEditor.getValue();
        const js = jsEditor.getValue();

        const output = `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Результат кода</title>
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}<\/script>
            </body>
            </html>
        `;
        fullScreenOutputFrame.srcdoc = output;
    }

    // --- Логика настроек ---
    function applyTheme(theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
        
        // Обновляем цвет нижней границы активной вкладки (если существует)
        const activeTabButton = document.querySelector('.tab-button.active');
        if (activeTabButton) {
            if (theme === 'dark') {
                activeTabButton.style.borderBottomColor = `var(--lighter-dark)`;
            } else if (theme === 'light') {
                activeTabButton.style.borderBottomColor = `var(--active-tab-border-light)`;
            } else if (theme === 'modern') {
                activeTabButton.style.borderBottomColor = `var(--active-tab-border-modern)`;
            } else {
                activeTabButton.style.borderBottomColor = `var(--primary-${theme})`;
            }
        }
        localStorage.setItem('editorTheme', theme);

        // Применяем тему Monaco
        if (typeof monaco !== 'undefined' && htmlEditor) {
            monaco.editor.setTheme(getMonacoTheme(theme));
        }
    }

    function applyButtonDesign(design) {
        if (design === 'flat') {
            document.body.classList.add('button-style-flat');
        } else {
            document.body.classList.remove('button-style-flat');
        }
        localStorage.setItem('editorButtonDesign', design);
    }

    // --- Инициализация Monaco Editors ---
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' }});
    require(['vs/editor/editor.main'], () => {
        const initialTheme = localStorage.getItem('editorTheme') || 'red';
        const initialFontSize = localStorage.getItem('editorFontSize') || '16px';
        const monacoTheme = getMonacoTheme(initialTheme);
        
        monaco.editor.setTheme(monacoTheme);

        // Загружаем сохраненный код или пустые строки
        const savedHtml = localStorage.getItem('htmlCode') || '';
        const savedCss = localStorage.getItem('cssCode') || '';
        const savedJs = localStorage.getItem('jsCode') || '';

        htmlEditor = monaco.editor.create(document.getElementById('htmlCodeContainer'), {
            value: savedHtml,
            language: 'html',
            theme: monacoTheme,
            fontSize: parseFloat(initialFontSize),
            automaticLayout: true
        });

        cssEditor = monaco.editor.create(document.getElementById('cssCodeContainer'), {
            value: savedCss,
            language: 'css',
            theme: monacoTheme,
            fontSize: parseFloat(initialFontSize),
            automaticLayout: true
        });
        document.getElementById('cssCodeContainer').style.display = 'none';

        jsEditor = monaco.editor.create(document.getElementById('jsCodeContainer'), {
            value: savedJs,
            language: 'javascript',
            theme: monacoTheme,
            fontSize: parseFloat(initialFontSize),
            automaticLayout: true
        });
        document.getElementById('jsCodeContainer').style.display = 'none';

        // --- События изменения кода для Monaco Editors ---
        htmlEditor.onDidChangeModelContent(() => {
            updateOutput();
            localStorage.setItem('htmlCode', htmlEditor.getValue());
        });
        cssEditor.onDidChangeModelContent(() => {
            updateOutput();
            localStorage.setItem('cssCode', cssEditor.getValue());
        });
        jsEditor.onDidChangeModelContent(() => {
            updateOutput();
            localStorage.setItem('jsCode', jsEditor.getValue());
        });

        // --- Инициализация при загрузке после Monaco ---
        updateOutput(); // Первоначальная загрузка iframe

        // Обновляем select-ы после инициализации Monaco
        themeSelect.value = initialTheme;
        fontSizeSelect.value = initialFontSize;
        buttonDesignSelect.value = localStorage.getItem('editorButtonDesign') || 'metal';
        applyButtonDesign(buttonDesignSelect.value); // Применяем дизайн кнопок

        // Убедимся, что активная вкладка отображается и фокусируется
        const activeTabButton = document.querySelector('.tab-button.active');
        if (activeTabButton) {
            activeTabButton.click();
        } else {
             htmlEditor.focus();
        }
    });

    // --- Логика переключения вкладок редактора ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            editorContainers.forEach(container => container.style.display = 'none');

            button.classList.add('active');
            const targetTab = button.dataset.tab;
            const activeEditorContainer = document.getElementById(`${targetTab}CodeContainer`);
            
            activeEditorContainer.style.display = 'block';

            let activeMonacoEditor;
            if (targetTab === 'html') activeMonacoEditor = htmlEditor;
            else if (targetTab === 'css') activeMonacoEditor = cssEditor;
            else if (targetTab === 'js') activeMonacoEditor = jsEditor;

            if (activeMonacoEditor) {
                setTimeout(() => activeMonacoEditor.layout(), 0);
                activeMonacoEditor.focus();
            }
        });
    });

    // --- Функция для переключения видимости заголовка и обновления редактора ---
    function toggleHeaderVisibility() {
        document.body.classList.toggle('hide-header');
        const isHidden = document.body.classList.contains('hide-header');
        
        // Обновляем текст кнопки в заголовке и мобильной версии
        const newText = isHidden ? 'Показать панель' : 'Скрыть панель';
        toggleHeaderBtn.textContent = newText;
        if (toggleHeaderBtnMobile) {
             toggleHeaderBtnMobile.textContent = newText;
        }

        // Необходимо обновить layout активного редактора после изменения размеров
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;
        let activeMonacoEditor;
        if (activeTab === 'html') activeMonacoEditor = htmlEditor;
        else if (activeTab === 'css') activeMonacoEditor = cssEditor;
        else if (activeTab === 'js') activeMonacoEditor = jsEditor;

        if (activeMonacoEditor) {
            setTimeout(() => activeMonacoEditor.layout(), 0); 
        }
    }


    // --- Обработчики событий кнопок управления (ДЕКСТОП И МОБИЛЬНЫЕ) ---

    // 1. Десктопные обработчики (используют существующие ID)
    addBtn.addEventListener('click', () => openModal(addModal));
    clearBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите очистить все поля? Это действие необратимо.')) {
            htmlEditor.setValue('');
            cssEditor.setValue('');
            jsEditor.setValue('');
        }
    });
    settingsBtn.addEventListener('click', () => openModal(settingsModal));
    learnProgrammingBtn.addEventListener('click', openLearningPanel);
    showOutputBtn.addEventListener('click', () => {
        updateOutput();
        openModal(fullScreenOutputModal);
    });
    toggleHeaderBtn.addEventListener('click', toggleHeaderVisibility);
    
    // 2. Мобильные обработчики (дублируют логику и закрывают сайдбар)
    if (addBtnMobile) {
        addBtnMobile.addEventListener('click', () => {
            openModal(addModal);
        });
        clearBtnMobile.addEventListener('click', () => { 
            if (confirm('Вы уверены, что хотите очистить все поля? Это действие необратимо.')) {
                htmlEditor.setValue('');
                cssEditor.setValue('');
                jsEditor.setValue('');
            }
            closeSidebar();
        });
        settingsBtnMobile.addEventListener('click', () => {
            openModal(settingsModal);
        });
        learnProgrammingBtnMobile.addEventListener('click', () => {
            openLearningPanel();
        });
        showOutputBtnMobile.addEventListener('click', () => {
            updateOutput();
            openModal(fullScreenOutputModal);
        });
        toggleHeaderBtnMobile.addEventListener('click', () => {
            toggleHeaderVisibility();
            closeSidebar();
        });
    }

    // 3. Обработчики для Сайдбара
    menuToggleBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);

    // --- Логика для плавающих кнопок ---
    floatingOutputBtn.addEventListener('click', () => {
        updateOutput();
        openModal(fullScreenOutputModal);
    });
    floatingToggleHeaderBtn.addEventListener('click', toggleHeaderVisibility);

    // --- Обработчики для кнопок закрытия модальных окон и панели обучения ---
    closeModalBtns.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal-overlay');
            if (modal) closeModal(modal);
        });
    });

    closeFullScreenOutputBtn.addEventListener('click', () => closeModal(fullScreenOutputModal));
    closeLearningPanelBtn.addEventListener('click', closeLearningPanel); 

    // --- Закрытие модальных окон, панели обучения И САЙДБАРА при клике вне содержимого ---
    const allOverlays = document.querySelectorAll('.modal-overlay, .learning-panel, .sidebar-overlay'); 
    allOverlays.forEach(overlay => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                if (overlay.classList.contains('modal-overlay')) {
                    closeModal(overlay);
                } else if (overlay.classList.contains('learning-panel')) {
                    closeLearningPanel();
                } else if (overlay.classList.contains('sidebar-overlay')) { 
                    closeSidebar();
                }
            }
        });
    });

    // --- Обработчики для кнопок "Добавить код" ---
    addBoilerplateBtn.addEventListener('click', () => {
        htmlEditor.setValue(`<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Моя Современная Страница</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="page-header">
        <nav class="main-nav">
            <a href="#" class="logo">RASINGSTAR Studio</a>
            <ul class="nav-links">
                <li><a href="#features">Особенности</a></li>
                <li><a href="#demo">Демо</a></li>
                <li><a href="#contact">Контакты</a></li>
            </ul>
        </nav>
    </header>

    <main class="main-content">
        <section class="hero-section">
            <div class="hero-content">
                <h1>Создавайте будущее Веба вместе с RASINGSTAR!</h1>
                <p>Ваши идеи, наши инструменты — идеальное сочетание для успеха.</p>
                <button id="ctaButton" class="main-cta-btn">Начать сейчас!</button>
            </div>
        </section>

        <section id="features" class="features-section">
            <h2>Наши преимущества</h2>
            <div class="feature-grid">
                <div class="feature-item">
                    <h3>Креативный дизайн</h3>
                    <p>Разрабатываем уникальные и привлекательные интерфейсы.</p>
                </div>
                <div class="feature-item">
                    <h3>Адаптивность</h3>
                    <p>Сайты, которые выглядят отлично на любых устройствах.</p>
                </div>
                <div class="feature-item">
                    <h3>Оптимизация</h3>
                    <p>Эффективность для повышения конверсии и заработка.</p>
                </div>
            </div>
        </section>

        <section id="demo" class="demo-section">
            <h2>Интерактивная Демонстрация</h2>
            <div class="demo-container">
                <p>Нажмите кнопку ниже, чтобы увидеть магию JavaScript!</p>
                <button id="interactiveButton" class="secondary-btn">Кликни меня!</button>
                <p>Вы кликнули: <span id="clickCount">0</span> раз.</p>
            </div>
        </section>
    </main>

    <footer id="contact" class="page-footer">
        <p>&copy; 2024 RASINGSTAR Web Editor. Все права защищены.</p>
        <p>Свяжитесь со мной: <a href="mailto:info@rasingstar.studio">info@rasingstar.studio</a></p>
    </footer>
</body>
</html>`);
        cssEditor.setValue(`/* Переменные для легкой кастомизации */
:root {
    --primary-color: #007bff; /* Синий */
    --secondary-color: #28a745; /* Зеленый */
    --text-dark: #333;
    --text-light: #f8f9fa;
    --bg-light: #ffffff;
    --bg-dark-section: #e9ecef;
    --shadow-light: 0 4px 8px rgba(0, 0, 0, 0.1);
    --border-radius: 8px;
}

body {
    font-family: 'Montserrat', sans-serif;
    margin: 0;
    line-height: 1.6;
    color: var(--text-dark);
    background-color: var(--bg-light);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* --- Хедер и Навигация --- */
.page-header {
    background-color: var(--primary-color);
    color: var(--text-light);
    padding: 1rem 2rem;
    box-shadow: var(--shadow-light);
}

.main-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-light);
    text-decoration: none;
    transition: color 0.3s ease;
}

.logo:hover {
    color: rgba(255, 255, 255, 0.8);
}

.nav-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: 1.5rem;
}

.nav-links a {
    color: var(--text-light);
    text-decoration: none;
    font-weight: 400;
    transition: color 0.3s ease;
}

.nav-links a:hover {
    color: rgba(255, 255, 255, 0.8);
}

/* --- Главный контент --- */
.main-content {
    flex: 1;
}

/* --- Героический блок --- */
.hero-section {
    background: linear-gradient(135deg, var(--primary-color) 0%, #66b3ff 100%);
    color: var(--text-light);
    text-align: center;
    padding: 6rem 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.hero-content {
    max-width: 800px;
}

.hero-content h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
    animation: fadeInDown 1s ease-out;
}

.hero-content p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    animation: fadeInUp 1s ease-out 0.3s;
}

.main-cta-btn {
    background-color: var(--secondary-color);
    color: var(--text-light);
    padding: 1rem 2.5rem;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.main-cta-btn:hover {
    background-color: #218838; /* Darker green */
    transform: translateY(-3px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.3);
}

/* --- Секция особенностей --- */
.features-section {
    background-color: var(--bg-dark-section);
    padding: 4rem 2rem;
    text-align: center;
}

.features-section h2 {
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-item {
    background-color: var(--bg-light);
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.feature-item h3 {
    color: var(--primary-color);
    font-size: 1.8rem;
    margin-bottom: 1rem;
}

.feature-item p {
    font-size: 1rem;
    color: var(--text-dark);
}

/* --- Секция Демо --- */
.demo-section {
    padding: 4rem 2rem;
    text-align: center;
}

.demo-section h2 {
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.demo-container {
    background-color: var(--bg-light);
    padding: 3rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    max-width: 600px;
    margin: 0 auto;
    animation: slideInUp 0.8s ease-out;
}

.secondary-btn {
    background-color: #6c757d; /* Grey */
    color: var(--text-light);
    padding: 0.8rem 2rem;
    border: none;
    border-radius: var(--border-radius);
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.secondary-btn:hover {
    background-color: #5a6268; /* Darker grey */
    transform: scale(1.02);
}

#clickCount {
    font-weight: 700;
    color: var(--secondary-color);
    font-size: 1.2rem;
    margin-top: 1rem;
    display: inline-block;
    transition: transform 0.2s ease-out;
}

#clickCount.animated {
    transform: scale(1.1);
    animation: pulse 0.3s ease-in-out;
}

/* --- Футер --- */
.page-footer {
    background-color: var(--primary-dark);
    color: var(--text-light);
    text-align: center;
    padding: 2rem;
    font-size: 0.9rem;
    margin-top: auto; /* Push footer to the bottom */
}

.page-footer a {
    color: var(--light-blue);
    text-decoration: none;
}

.page-footer a:hover {
    text-decoration: underline;
}

/* --- Анимации --- */
@keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInUp {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

/* --- Адаптивность --- */
@media (max-width: 768px) {
    .main-nav {
        flex-direction: column;
        gap: 1rem;
    }
    .nav-links {
        flex-wrap: wrap;
        justify-content: center;
    }
    .hero-content h1 {
        font-size: 2.5rem;
    }
    .hero-content p {
        font-size: 1.2rem;
    }
    .features-section h2, .demo-section h2 {
        font-size: 2rem;
    }
    .feature-grid {
        grid-template-columns: 1fr;
    }
}
`);
        jsEditor.setValue(`document.addEventListener('DOMContentLoaded', () => {
    const interactiveButton = document.getElementById('interactiveButton');
    const ctaButton = document.getElementById('ctaButton');
    const clickCountSpan = document.getElementById('clickCount');
    let count = 0;

    // Интерактивная кнопка в демо-секции
    if (interactiveButton) {
        interactiveButton.addEventListener('click', () => {
            count++;
            clickCountSpan.textContent = count;
            
            // Добавляем и убираем класс для анимации
            clickCountSpan.classList.add('animated');
            setTimeout(() => {
                clickCountSpan.classList.remove('animated');
            }, 300); // Длительность анимации
        });
    }

    // Кнопка "Начать сейчас!" в героическом блоке
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            alert('Поздравляем! Вы сделали первый шаг к созданию чего-то удивительного.');
            ctaButton.textContent = 'Начали!';
            ctaButton.style.backgroundColor = '#17a2b8'; // Изменим цвет
        });
    }

    console.log('Современная страница загружена и готова к работе!');
});`);
        closeModal(addModal);
    });

    addMinimalBtn.addEventListener('click', () => {
        htmlEditor.setValue(`<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Новая Страница</title>
</head>
<body>
    <!-- Ваш HTML код здесь -->
</body>
</html>`);
        cssEditor.setValue(``);
        jsEditor.setValue(``);
        closeModal(addModal);
    });

    addEmptyBtn.addEventListener('click', () => {
        htmlEditor.setValue('');
        cssEditor.setValue('');
        jsEditor.setValue('');
        closeModal(addModal);
    });

    // --- Обработчики событий настроек ---
    themeSelect.addEventListener('change', (event) => {
        applyTheme(event.target.value);
    });

    fontSizeSelect.addEventListener('change', (event) => {
        const selectedSize = parseFloat(event.target.value);
        if (htmlEditor) {
            htmlEditor.updateOptions({ fontSize: selectedSize });
            cssEditor.updateOptions({ fontSize: selectedSize });
            jsEditor.updateOptions({ fontSize: selectedSize });
        }
        localStorage.setItem('editorFontSize', event.target.value);
    });

    buttonDesignSelect.addEventListener('change', (event) => {
        applyButtonDesign(event.target.value);
    });

    // --- Инициализация настроек при загрузке (после инициализации Monaco) ---
    const initialTheme = localStorage.getItem('editorTheme') || 'red';
    const initialFontSize = localStorage.getItem('editorFontSize') || '16px';
    const initialButtonDesign = localStorage.getItem('editorButtonDesign') || 'metal';

    applyTheme(initialTheme);
    applyButtonDesign(initialButtonDesign);

    // Инициализация кнопки скрытия панели
    toggleHeaderBtn.textContent = 'Скрыть панель';
    if (toggleHeaderBtnMobile) {
        toggleHeaderBtnMobile.textContent = 'Скрыть панель';
    }
});
