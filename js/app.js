
import { Chatbot } from "./chatbot.js";
import { menu, menuCategories, categoryLabels } from "./menu.js";

const icon = (name, size = 20) => {
  const paths = {
    arrow: '<path d="M5 12h14"/><path d="m14 7 5 5-5 5"/>',
    close: '<path d="m6 6 12 12"/><path d="M18 6 6 18"/>',
    menu: '<path d="M5 7h14"/><path d="M5 12h14"/><path d="M5 17h14"/>',
    send: '<path d="m4 4 16 8-16 8 3-8-3-8Z"/><path d="M7 12h13"/>',
    sparkle: '<path d="M12 3c.7 4.5 3.5 7.3 8 8-4.5.7-7.3 3.5-8 8-.7-4.5-3.5-7.3-8-8 4.5-.7 7.3-3.5 8-8Z"/>',
    coffee: '<path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8Z"/><path d="M17 10h1a3 3 0 0 1 0 6h-2"/><path d="M8 4v1M12 4v1"/>',
    check: '<path d="m6 12 4 4 8-9"/>',
    retry: '<path d="M20 7v5h-5"/><path d="M18.5 16a8 8 0 1 1 .7-8.1L20 12"/>'
  };

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ""}</svg>`;
};

const app = document.querySelector("#app");
const chatbot = new Chatbot();

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

const state = {
  open: false,
  animateChatOpen: false,
  showBotNotice: true,
  name: localStorage.getItem("brew-name") || "",
  draftName: "",
  input: "",
  loading: false,
  menuOpen: false,
  activeCategory: "all",
  tastes: readJSON("brew-tastes", []),
  messages: readJSON("brew-chat", [])
};

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatAssistantText(value = "") {
  return escapeHTML(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function persist() {
  localStorage.setItem("brew-chat", JSON.stringify(state.messages));
  localStorage.setItem("brew-tastes", JSON.stringify(state.tastes));
}

function openChat() {
  if (state.open) return;

  state.open = true;
  state.animateChatOpen = true;
  state.showBotNotice = false;

  render();

  if (!state.name) {
    document.querySelector("#name")?.focus();
  } else {
    document.querySelector("#chat-input")?.focus();
  }
}

function closeChat() {
  const drawer = app.querySelector(".chat-drawer");
  const overlay = app.querySelector(".overlay");

  if (!drawer || !state.open) return;

  state.open = false;
  state.menuOpen = false;

  drawer.classList.remove("open");
  drawer.classList.add("closing");

  overlay?.classList.remove("visible");
  overlay?.classList.add("closing");

  setTimeout(() => {
    render();
  }, 420);
}

function toggleTaste(taste) {
  state.tastes = state.tastes.includes(taste)
    ? state.tastes.filter(item => item !== taste)
    : [...state.tastes, taste];

  localStorage.setItem("brew-tastes", JSON.stringify(state.tastes));
  render();
}

function startChat(name) {
  const cleanName = name.trim();
  if (!cleanName) return;

  state.name = cleanName;
  localStorage.setItem("brew-name", cleanName);
  render();
}

function skipName() {
  startChat("Гость");
}

async function sendMessage(value = state.input) {
  const text = String(value || "").trim();

  if (!text || state.loading) return;

  // Запоминаем положение прокрутки до перерисовки.
  const chatBody = app.querySelector(".chat-body");
  const wasNearBottom = chatBody
    ? chatBody.scrollHeight - chatBody.clientHeight - chatBody.scrollTop < 60
    : true;

  state.messages.push({
    id: Date.now(),
    role: "user",
    text
  });

  state.input = "";
  state.loading = true;
  persist();

  render({ preserveScroll: true, wasNearBottom });

  try {
    chatbot.setHistory(state.messages.slice(0, -1));

    const response = await chatbot.reply(text, state.tastes);

    state.messages.push({
      id: Date.now() + 1,
      role: "assistant",
      text: response?.text || "Не удалось подготовить ответ.",
      recommendations: Array.isArray(response?.recommendations)
        ? response.recommendations
        : []
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    state.messages.push({
      id: Date.now() + 1,
      role: "assistant",
      text: "Не удалось подготовить ответ. Попробуйте ещё раз.",
      error: true
    });
  } finally {
    state.loading = false;
    persist();

    render({ preserveScroll: true, wasNearBottom });
  }
}

function clearChat() {
  state.messages = [];
  chatbot.clearHistory();
  state.menuOpen = false;
  persist();
  render();
}

function editName() {
  state.draftName = state.name === "Гость" ? "" : state.name;
  state.name = "";

  localStorage.removeItem("brew-name");
  state.menuOpen = false;
  render();
}

function renderDrink(item) {
  return `<article class="menu-card">
    <div class="menu-card-image">
      <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy">
      <span class="menu-card-category">${escapeHTML(categoryLabels[item.category])}</span>
    </div>
    <div class="menu-card-content">
      <div class="menu-card-heading">
        <h3>${escapeHTML(item.name)}</h3>
        <strong>${item.price} ₽</strong>
      </div>
      <p>${escapeHTML(item.description)}</p>
      <small>${escapeHTML(item.taste)}</small>
    </div>
  </article>`;
}

function renderRecommendation(item) {
  return `<button class="drink-card" data-action="choose-drink" data-drink="${escapeHTML(item.name)}">
    <div class="drink-photo">
      <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" loading="lazy">
    </div>
    <div class="drink-copy">
      <div>
        <strong>${escapeHTML(item.name)}</strong>
        <b>${item.price} ₽</b>
      </div>
      <span>${escapeHTML(item.description)}</span>
      <em>Выбрать ${icon("arrow", 12)}</em>
    </div>
  </button>`;
}

function renderMessage(message, index) {
    const assistant = message.role === "assistant";

    return `<div class="message ${message.role} ${index === state.messages.length - 1 ? "message-latest" : ""}">
    ${assistant ? `<div class="tiny-avatar">${icon("sparkle", 12)}</div>` : ""}
    <div class="message-content">
      <div class="bubble ${message.error ? "error-bubble" : ""}">
        ${message.error ? '<span class="error-icon">!</span>' : ""}
        ${assistant
            ? formatAssistantText(message.text)
            : escapeHTML(message.text)}
      </div>

      ${message.error
        ? `<button class="retry-button" data-action="retry">${icon("retry", 14)} Повторить</button>`
        : ""}

      ${message.recommendations?.length
        ? `<div class="recommendations">
            <div class="comparison-heading">
              <span>Подходящие варианты</span>
              <small>${message.recommendations.length} позиции</small>
            </div>
            ${message.recommendations.map(renderRecommendation).join("")}
          </div>`
        : ""}
    </div>
  </div>`;
}

function renderMenu() {
  const visible = state.activeCategory === "all"
    ? menu
    : menu.filter(item => item.category === state.activeCategory);

  return `
    <div class="menu-filters">
      ${menuCategories.map(category => `
        <button class="menu-filter ${state.activeCategory === category.id ? "active" : ""}"
          data-action="filter"
          data-filter="${category.id}">
          ${category.label}
        </button>
      `).join("")}
    </div>

    <div class="menu-grid">
      ${visible.map(renderDrink).join("")}
    </div>`;
}

function initScrollAnimations() {
  const elements = app.querySelectorAll(
    ".menu-preview, .about-section, .menu-card"
  );

  if (!("IntersectionObserver" in window)) {
    elements.forEach(element => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -35px 0px"
  });

  elements.forEach(element => {
    element.classList.add("scroll-reveal");
    observer.observe(element);
  });
}

function render(options = {}) {
  const previousChatBody = app.querySelector(".chat-body");

  const previousScrollTop = previousChatBody?.scrollTop ?? 0;

  const wasNearBottom = options.wasNearBottom ??
    (previousChatBody
      ? previousChatBody.scrollHeight -
        previousChatBody.clientHeight -
        previousScrollTop < 60
      : true);

  app.innerHTML = `
  <main class="site-shell">

    <header class="site-header">
      <a class="brand" href="#home" aria-label="Brew & Bean — главная">
        <span class="brand-mark">${icon("coffee", 17)}</span>
        <span>Brew <i>&</i> Bean</span>
      </a>

      <nav aria-label="Основная навигация">
        <a href="#home">Главная</a>
        <a href="#menu">Меню</a>
        <a href="#about">О проекте</a>
        <button class="nav-chat-button" data-action="open-click">ИИ-бариста</button>
      </nav>

      <button class="header-chat-mobile" data-action="open-click" aria-label="Открыть ИИ-бариста">
        ${icon("sparkle", 16)}
      </button>
    </header>

    <section class="hero" id="home">
      <div class="hero-copy">
        <p class="eyebrow">Кофе с характером</p>
        <h1>Каждая чашка —<br>новая история</h1>

        <p class="hero-description">
          Откройте любимые вкусы, познакомьтесь с разными напитками и найдите свой идеальный вариант вместе с ИИ-бариста.
        </p>

        <a class="primary-link" href="#menu">
          Смотреть меню ${icon("arrow", 18)}
        </a>

        <div class="hero-meta">
          <div><strong>27</strong><span>позиций меню</span></div>
          <div><strong>4</strong><span>категории</span></div>
        </div>
      </div>

      <div class="hero-image">
        <img
          src="https://images.unsplash.com/photo-1615505235161-68a92b203b52?auto=format&fit=crop&w=1600&q=85"
          alt="Чашка кофе на столе">
        <div class="image-tag">
          <span>Ваш личный гид</span>
          <strong>ИИ-бариста Brew & Bean</strong>
        </div>
      </div>
    </section>

    <section class="menu-preview" id="menu">
      <p class="eyebrow">Каталог Brew & Bean</p>
      <h2>Выберите свой вкус</h2>
      <p class="section-description">
        Кофейная классика, ароматный чай, десерты и другие напитки — всё меню в одном месте.
      </p>

      ${renderMenu()}
    </section>

    <section class="about-section" id="about">
      <div class="about-content">
        <p class="eyebrow">Brew & Bean</p>
        <h2>Кофейная культура и технологии</h2>

        <p>
          Brew & Bean — концепция современной кофейни, в которой культура приготовления напитков сочетается с возможностями искусственного интеллекта.
        </p>

        <p>
          ИИ-бариста помогает разобраться в меню, узнать особенности вкуса и состава напитков, а также подобрать вариант под индивидуальные предпочтения.
        </p>
      </div>
    </section>

    ${!state.open ? `
      <button class="edge-activation" data-action="open" aria-label="Открыть ИИ-бариста"></button>
      <div class="edge-hint" aria-hidden="true"><span></span>ИИ-БАРИСТА</div>
      <button class="mobile-chat-trigger" data-action="open-click">
        ${icon("sparkle", 16)} Спросить бариста
      </button>
    ` : ""}

        ${state.showBotNotice && !state.open ? `
      <div class="bot-notice">
        <div class="bot-notice-icon">
          ${icon("sparkle", 20)}
        </div>

        <div class="bot-notice-content">
          <strong>Знакомьтесь — ИИ-бариста</strong>

          <p>
            На сайте есть виртуальный бариста. Попробуйте его — он поможет выбрать кофе, чай или десерт по вашему вкусу.
          </p>

          <button data-action="try-bot">
            Попробовать ${icon("arrow", 15)}
          </button>
        </div>

        <button
          class="bot-notice-close"
          data-action="dismiss-notice"
          aria-label="Закрыть уведомление">
          ${icon("close", 16)}
        </button>
      </div>
    ` : ""}

    <button class="overlay ${state.open ? "visible" : ""} ${state.animateChatOpen ? "opening" : ""}"
      data-action="close"
      aria-label="Закрыть чат"></button>

    <aside class="chat-drawer ${state.open ? "open" : ""} ${state.animateChatOpen ? "opening" : ""}" aria-hidden="${!state.open}">

      <header class="chat-header">
        <div class="assistant-avatar">${icon("sparkle", 17)}</div>

        <div class="assistant-title">
          <div><strong>Brew & Bean</strong><span>ИИ-бариста</span></div>
          <p>
            <i class="${state.loading ? "loading" : ""}"></i>
            ${state.loading ? "Готовит ответ…" : "Готов помочь"}
          </p>
        </div>

        <div class="chat-actions">
          <div class="menu-wrap">
            <button class="icon-button" data-action="menu" aria-label="Меню чата">
              ${icon("menu", 19)}
            </button>

            ${state.menuOpen ? `
              <div class="chat-menu">
                <button data-action="edit-name">Изменить имя</button>
                <button data-action="clear">Очистить чат</button>
              </div>
            ` : ""}
          </div>

          <button class="icon-button" data-action="close" aria-label="Закрыть чат">
            ${icon("close", 20)}
          </button>
        </div>
      </header>

      ${!state.name ? `
        <section class="welcome">
          <div class="welcome-icon">${icon("sparkle", 28)}</div>
          <p class="eyebrow">Ваш личный гид по меню</p>
          <h2>Давайте<br>познакомимся</h2>

          <p class="welcome-text">
            Подскажите, как к вам обращаться. Это поможет сделать беседу немного теплее.
          </p>

          <form id="name-form">
            <label for="name">Ваше имя</label>
            <input
              id="name"
              autocomplete="off"
              autocorrect="off"
              value="${escapeHTML(state.draftName)}"
              placeholder="Например, Анна"
              autocomplete="given-name">

            <button class="start-button" ${state.draftName.trim() ? "" : "disabled"}>
              Начать общение ${icon("arrow", 18)}
            </button>
          </form>

          <button class="skip-button" data-action="skip">Пропустить</button>
          <p class="privacy-note">Без регистрации. Имя хранится только на этом устройстве.</p>
        </section>
      ` : `
        <section class="chat-body">
          ${state.messages.length === 0 ? `
            <div class="empty-chat">
              <div class="empty-art">${icon("coffee", 30)}</div>

              <h2>
                ${state.name === "Гость"
                  ? "Здравствуйте!"
                  : `Здравствуйте, ${escapeHTML(state.name)}!`}
              </h2>

              <p>Помогу выбрать кофе, чай или десерт под ваше настроение.</p>

              <div class="taste-panel">
                <div class="taste-heading">
                  <span>Ваш вкус</span>
                  <small>
                    ${state.tastes.length
                      ? `Выбрано: ${state.tastes.length}`
                      : "Можно выбрать несколько"}
                  </small>
                </div>

                <div class="taste-options">
                  ${["Мягкий", "Крепкий", "Сладкий", "Горький", "С молоком", "Без молока"]
                    .map(taste => `
                      <button
                        class="${state.tastes.includes(taste) ? "selected" : ""}"
                        data-action="taste"
                        data-value="${taste}">
                        ${taste}
                      </button>
                    `).join("")}
                </div>
              </div>
            </div>
          ` : `
            <div class="messages">
              <div class="day-label">История диалога</div>

                ${state.messages.map((message, index) => renderMessage(message, index)).join("")}

              ${state.loading ? `
                <div class="message assistant">
                  <div class="tiny-avatar">${icon("sparkle", 12)}</div>
                  <div class="bubble typing"><i></i><i></i><i></i></div>
                </div>
              ` : ""}

              <div id="bottom-anchor"></div>
            </div>
          `}
        </section>

        <footer class="chat-input-area">
          <form id="chat-form" autocomplete="off">
<input
  id="chat-input"
  name="brew-chat-message"
  type="text"
  autocomplete="off"
  autocorrect="off"
  spellcheck="false"
  value="${escapeHTML(state.input)}"
  placeholder="Спросите бариста…"
  ${state.loading ? "disabled" : ""}>

            <button
              aria-label="Отправить"
              ${!state.input.trim() || state.loading ? "disabled" : ""}>
              ${icon("send", 18)}
            </button>
          </form>

          <p>${icon("check", 12)} Локальная генерация</p>
        </footer>
      `}
    </aside>
  </main>`;
    // Анимация открытия используется только при первом появлении чата.
  state.animateChatOpen = false;

  bindEvents();
  initScrollAnimations();

  // Восстанавливаем прокрутку после обновления интерфейса.
  const nextChatBody = app.querySelector(".chat-body");

  if (nextChatBody && state.open && state.name && state.messages.length) {
    if (!options.preserveScroll || wasNearBottom) {
      nextChatBody.scrollTop = nextChatBody.scrollHeight;
    } else {
      nextChatBody.scrollTop = previousScrollTop;
    }
  }
}

function bindEvents() {
  app.querySelectorAll("[data-action]").forEach(element => {
    const action = element.dataset.action;

    element.addEventListener(action === "open" ? "mouseenter" : "click", () => {
      if (action === "open" || action === "open-click") {
        return openChat();
      }
      if (action === "try-bot") {
        return openChat();
      }

      if (action === "dismiss-notice") {
        state.showBotNotice = false;
        return render();
      }

      if (action === "close") return closeChat();

      if (action === "menu") {
        state.menuOpen = !state.menuOpen;
        return render();
      }

      if (action === "clear") return clearChat();
      if (action === "edit-name") return editName();
      if (action === "skip") return skipName();
      if (action === "taste") return toggleTaste(element.dataset.value);

      if (action === "retry") {
        return sendMessage("Помоги подобрать напиток из меню");
      }

      if (action === "choose-drink") {
        return sendMessage(`Расскажи подробнее о напитке ${element.dataset.drink}`);
      }

      if (action === "filter") {
        state.activeCategory = element.dataset.filter;

        const menuSection = document.querySelector("#menu");

        if (menuSection) {
          const filters = menuSection.querySelector(".menu-filters");
          const grid = menuSection.querySelector(".menu-grid");

          filters?.querySelectorAll(".menu-filter").forEach(button => {
            button.classList.toggle(
              "active",
              button.dataset.filter === state.activeCategory
            );
          });

          const visible = state.activeCategory === "all"
            ? menu
            : menu.filter(item => item.category === state.activeCategory);

          if (grid) {
            grid.innerHTML = visible.map(renderDrink).join("");
          }
        }
      }
    });
  });

  document.querySelector("#name")?.addEventListener("input", event => {
    state.draftName = event.target.value;

    const button = document.querySelector("#name-form button");

    if (button) {
      button.disabled = !state.draftName.trim();
    }
  });

  document.querySelector("#name-form")?.addEventListener("submit", event => {
    event.preventDefault();
    startChat(state.draftName);
  });

  document.querySelector("#chat-input")?.addEventListener("input", event => {
    state.input = event.target.value;

    const button = document.querySelector("#chat-form button");

    if (button) {
      button.disabled = !state.input.trim() || state.loading;
    }
  });

  document.querySelector("#chat-form")?.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage();
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && state.open) {
    closeChat();
  }
});

render();
