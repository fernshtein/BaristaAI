import { Chatbot } from "./chatbot.js";

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

const state = {
  open: false,
  name: localStorage.getItem("brew-name") || "",
  draftName: "",
  input: "",
  loading: false,
  menuOpen: false,
  tastes: readJSON("brew-tastes", []),
  messages: readJSON("brew-chat", [])
};

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}
function persist() {
  localStorage.setItem("brew-chat", JSON.stringify(state.messages));
  localStorage.setItem("brew-tastes", JSON.stringify(state.tastes));
}
function openChat() {
  state.open = true;
  render();
  document.querySelector("#name")?.focus();
}
function closeChat() {
  state.open = false;
  state.menuOpen = false;
  render();
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
  const text = value.trim();
  if (!text || state.loading) return;
  state.messages.push({ id: Date.now(), role: "user", text });
  state.input = "";
  state.loading = true;
  persist();
  render();
  try {
    const response = await chatbot.reply(text, state.tastes);
    state.messages.push({ id: Date.now() + 1, role: "assistant", ...response });
  } catch (error) {
    console.error("Chatbot error:", error);
    state.messages.push({
      id: Date.now() + 1, role: "assistant",
      text: "Не удалось подготовить ответ. Попробуйте ещё раз.",
      error: true
    });
  } finally {
    state.loading = false;
    persist();
    render();
  }
}
function clearChat() {
  state.messages = [];
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
function renderDrink(drink) {
  return `<button class="drink-card" data-action="choose-drink" data-drink="${escapeHTML(drink.name)}">
    <div class="drink-photo"><img src="${escapeHTML(drink.image)}" alt="${escapeHTML(drink.name)} в чашке" loading="lazy"></div>
    <div class="drink-copy"><div><strong>${escapeHTML(drink.name)}</strong><b>${drink.price} ₽</b></div>
    <span>${escapeHTML(drink.reason || drink.description)}</span><em>Выбрать ${icon("arrow",12)}</em></div>
  </button>`;
}
function renderMessage(message) {
  const assistant = message.role === "assistant";
  return `<div class="message ${message.role}">
    ${assistant ? `<div class="tiny-avatar">${icon("sparkle",12)}</div>` : ""}
    <div>
      <div class="bubble ${message.error ? "error-bubble" : ""}">
        ${message.error ? '<span class="error-icon">!</span>' : ""}
        ${escapeHTML(message.text)}
      </div>
      ${message.error ? `<button class="retry-button" data-action="retry">${icon("retry",14)} Повторить</button>` : ""}
      ${message.recommendations?.length ? `<div class="recommendations">
        <div class="comparison-heading"><span>Сравнение</span><small>${message.recommendations.length} варианта</small></div>
        ${message.recommendations.map(renderDrink).join("")}
      </div>` : ""}
      ${assistant && !message.error ? `<div class="context-chips">
        ${["Посоветуй похожее","Хочу покрепче","Что к десерту?"].map(item => `<button data-action="prompt" data-value="${escapeHTML(item)}">${escapeHTML(item)}</button>`).join("")}
      </div>` : ""}
    </div>
  </div>`;
}
function render() {
  const drinks = chatbot.drinks;
  app.innerHTML = `
  <main class="site-shell">
    <header class="site-header">
      <a class="brand" href="#" aria-label="Brew & Bean — главная">
        <span class="brand-mark">${icon("coffee",17)}</span><span>Brew <i>&</i> Bean</span>
      </a>
      <nav aria-label="Основная навигация">
        <a href="#menu">Меню</a><a href="#story">О нас</a><a href="#locations">Кофейни</a><a href="#journal">Журнал</a>
      </nav><span class="header-balance" aria-hidden="true"></span>
    </header>
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Кофе с характером</p>
        <h1>Каждая чашка —<br>новая история</h1>
        <p class="hero-description">Отборное зерно, точная обжарка и немного тишины. Найдите свой вкус вместе с нами.</p>
        <a class="primary-link" href="#menu">Смотреть меню ${icon("arrow",18)}</a>
        <div class="hero-meta"><div><strong>12</strong><span>сортов зерна</span></div><div><strong>7</strong><span>кофеен в городе</span></div></div>
      </div>
      <div class="hero-image">
        <img src="https://images.unsplash.com/photo-1615505235161-68a92b203b52?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1600" alt="Чашка чёрного кофе на столе">
        <div class="image-tag"><span>Выбор недели</span><strong>Эфиопия Иргачефф</strong></div>
      </div>
    </section>
    ${!state.open ? `<button class="edge-activation" data-action="open" aria-label="Открыть ИИ-бариста"></button><div class="edge-hint" aria-hidden="true"><span></span>ИИ-БАРИСТА</div><button class="mobile-chat-trigger" data-action="open-click" aria-label="Открыть ИИ-бариста">${icon("sparkle",16)} Спросить бариста</button>` : ""}
    <section class="menu-preview" id="menu">
      <p class="eyebrow">Классика Brew & Bean</p><h2>Ваш ежедневный ритуал</h2>
      <div class="menu-grid">${drinks.slice(0,3).map((drink,index)=>`<article><span>0${index+1}</span><h3>${escapeHTML(drink.name)}</h3><p>${escapeHTML(drink.description)}</p><strong>${drink.price} ₽</strong></article>`).join("")}</div>
    </section>
    <button class="overlay ${state.open ? "visible" : ""}" data-action="close" aria-label="Закрыть чат"></button>
    <aside class="chat-drawer ${state.open ? "open" : ""}" aria-hidden="${!state.open}">
      <header class="chat-header">
        <div class="assistant-avatar">${icon("sparkle",17)}</div>
        <div class="assistant-title"><div><strong>Brew & Bean</strong><span>ИИ-бариста</span></div>
          <p><i class="${state.loading ? "loading" : ""}"></i>${state.loading ? "Готовит ответ…" : "Готов помочь"}</p>
        </div>
        <div class="chat-actions"><div class="menu-wrap">
          <button class="icon-button" data-action="menu" aria-label="Меню чата">${icon("menu",19)}</button>
          ${state.menuOpen ? `<div class="chat-menu"><button data-action="edit-name">Изменить имя</button><button data-action="clear">Очистить чат</button></div>` : ""}
        </div><button class="icon-button" data-action="close" aria-label="Закрыть чат">${icon("close",20)}</button></div>
      </header>
      ${!state.name ? `<section class="welcome">
        <div class="welcome-icon">${icon("sparkle",28)}</div><p class="eyebrow">Ваш личный кофейный гид</p>
        <h2>Давайте<br>познакомимся</h2>
        <p class="welcome-text">Подскажите, как к вам обращаться. Это поможет сделать беседу немного теплее.</p>
        <form id="name-form"><label for="name">Ваше имя</label>
          <input id="name" value="${escapeHTML(state.draftName)}" placeholder="Например, Анна" autocomplete="given-name">
          <button class="start-button" ${state.draftName.trim() ? "" : "disabled"}>Начать общение ${icon("arrow",18)}</button>
        </form>
        <button class="skip-button" data-action="skip">Пропустить</button>
        <p class="privacy-note">Без регистрации. Имя хранится только на этом устройстве.</p>
      </section>` : `
      <section class="chat-body">
        ${state.messages.length === 0 ? `<div class="empty-chat">
          <div class="empty-art">${icon("coffee",30)}</div>
          <h2>${state.name === "Гость" ? "Здравствуйте!" : `Здравствуйте, ${escapeHTML(state.name)}!`}</h2>
          <p>Я помогу выбрать кофе под ваше настроение, вкус или десерт.</p>
          <div class="taste-panel"><div class="taste-heading"><span>Ваш вкус</span><small>${state.tastes.length ? `Выбрано: ${state.tastes.length}` : "Можно выбрать несколько"}</small></div>
            <div class="taste-options">${["Мягкий","Крепкий","Сладкий","Горький","С молоком","Без молока"].map(taste=>`<button class="${state.tastes.includes(taste)?"selected":""}" data-action="taste" data-value="${taste}">${taste}</button>`).join("")}</div>
          </div>
          <div class="quick-prompts">${["Помоги выбрать кофе","Не люблю горечь","Что взять к десерту?"].map(prompt=>`<button data-action="prompt" data-value="${prompt}">${prompt}${icon("arrow",16)}</button>`).join("")}</div>
        </div>` : `<div class="messages"><div class="day-label">Сегодня</div>
          <div class="message assistant greeting"><div class="tiny-avatar">${icon("sparkle",12)}</div><div class="bubble">Рада видеть вас снова, ${escapeHTML(state.name)}! Что хочется сегодня?</div></div>
          ${state.messages.map(renderMessage).join("")}
          ${state.loading ? `<div class="message assistant"><div class="tiny-avatar">${icon("sparkle",12)}</div><div class="bubble typing"><i></i><i></i><i></i></div></div>` : ""}
          <div id="bottom-anchor"></div></div>`}
      </section>
      <footer class="chat-input-area"><form id="chat-form"><input id="chat-input" value="${escapeHTML(state.input)}" placeholder="Спросите бариста..." ${state.loading?"disabled":""}>
        <button aria-label="Отправить" ${!state.input.trim()||state.loading?"disabled":""}>${icon("send",18)}</button></form>
        <p>${icon("check",12)} Локальная генерация</p></footer>`}
    </aside>
  </main>`;
  bindEvents();
  if (state.open && state.name && state.messages.length) {
    document.querySelector("#bottom-anchor")?.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}
function bindEvents() {
  app.querySelectorAll("[data-action]").forEach(element => {
    const action = element.dataset.action;
    element.addEventListener(action === "open" ? "mouseenter" : "click", event => {
      if (action === "open" || action === "open-click") return openChat();
      if (action === "close") return closeChat();
      if (action === "menu") { state.menuOpen = !state.menuOpen; return render(); }
      if (action === "clear") return clearChat();
      if (action === "edit-name") return editName();
      if (action === "skip") return skipName();
      if (action === "taste") return toggleTaste(element.dataset.value);
      if (action === "prompt") return sendMessage(element.dataset.value);
      if (action === "retry") return sendMessage("Помоги выбрать кофе");
      if (action === "choose-drink") return sendMessage(`Выбираю ${element.dataset.drink}`);
    });
  });
  const nameInput = document.querySelector("#name");
  nameInput?.addEventListener("input", event => {
    state.draftName = event.target.value;
    const button = document.querySelector("#name-form button");
    if (button) button.disabled = !state.draftName.trim();
  });
  document.querySelector("#name-form")?.addEventListener("submit", event => {
    event.preventDefault(); startChat(state.draftName);
  });
  const chatInput = document.querySelector("#chat-input");
  chatInput?.addEventListener("input", event => {
    state.input = event.target.value;
    const button = document.querySelector("#chat-form button");
    if (button) button.disabled = !state.input.trim() || state.loading;
  });
  document.querySelector("#chat-form")?.addEventListener("submit", event => {
    event.preventDefault(); sendMessage();
  });
}
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && state.open) closeChat();
});
render();
