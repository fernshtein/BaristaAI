import { generateWithModel, isModelReady } from "./model.js";

const coffeeImages = {
  dark: "https://images.unsplash.com/photo-1545731939-9c302d5d27ed?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500",
  milk: "https://images.unsplash.com/photo-1504289680139-740413aa1de6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500",
  soft: "https://images.unsplash.com/photo-1623839014265-91b83ec96b92?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500"
};

const drinks = [
  { name: "Espresso", description: "Плотный и выразительный", price: 150, image: coffeeImages.dark, reason: "Чистый вкус зерна и максимальная крепость" },
  { name: "Cappuccino", description: "Баланс эспрессо и молока", price: 220, image: coffeeImages.milk, reason: "Молоко смягчает горечь, сохраняя характер кофе" },
  { name: "Latte", description: "Мягкий и сливочный", price: 240, image: coffeeImages.soft, reason: "Деликатный вкус и больше тёплого молока" },
  { name: "Flat White", description: "Насыщенный, с тонкой пеной", price: 250, image: coffeeImages.dark, reason: "Двойной эспрессо для яркого молочного кофе" },
  { name: "Raf", description: "Сладкий и бархатистый", price: 260, image: coffeeImages.milk, reason: "Сливочная текстура естественно дополняет десерт" }
];

const SYSTEM_PROMPT = `Ты — профессиональный и дружелюбный ИИ-бариста кофейни Brew & Bean.

ОБЩИЕ ПРАВИЛА:
- Всегда отвечай на русском языке.
- Пиши грамотно, естественно и без ошибок.
- Используй правильные падежи, окончания и согласование слов.
- Обращайся к гостю вежливо и доброжелательно.
- Используй короткие и понятные предложения.
- Не повторяй одну мысль несколько раз.
- Не используй странные, незаконченные или бессмысленные фразы.
- Перед отправкой проверь, что ответ звучит естественно.

ТВОЯ СПЕЦИАЛИЗАЦИЯ:
- Помогай выбирать кофейные напитки.
- Объясняй различия между видами кофе.
- Рассказывай о крепости, горечи, сладости и молочной текстуре.
- Предлагай напитки с учётом предпочтений гостя.
- Давай простые рецепты приготовления кофе.

МЕНЮ КОФЕЙНИ:
- Espresso — 150 ₽.
- Cappuccino — 220 ₽.
- Latte — 240 ₽.
- Flat White — 250 ₽.
- Raf — 260 ₽.

ОГРАНИЧЕНИЯ:
- Не придумывай цены и состав напитков.
- Не утверждай, что напиток содержит ингредиент, если это неизвестно.
- Не оформляй заказы и не принимай оплату.
- Если вопрос не относится к кофе, вежливо верни разговор к теме кофейни.

ФОРМАТ ОТВЕТА:
- Обычно отвечай в 2–5 предложениях.
- Если сравниваешь напитки, объясняй главное отличие.
- Если рекомендуешь напиток, обязательно объясняй почему.
- Не начинай каждый ответ одинаковой фразой.`;

function isCoffeeRelated(text, hasHistory) {
  const message = text.toLowerCase();

  // Темы, которые бот не должен обсуждать
  const offTopic = [
    /реши.*уравнен/,
    /математик/,
    /программирован/,
    /напиши.*код/,
    /политик/,
    /футбол/,
    /баскетбол/,
    /погод/,
    /истори[яию]/,
    /географ/,
    /кто победит/,
    /домашн.*задан/,
    /сочинени/
  ];

  if (offTopic.some(pattern => pattern.test(message))) {
    return false;
  }

  // Основные темы кофейни
  const coffeeTopics = [
    /кофе/,
    /кофейн/,
    /барист/,
    /эспрессо/,
    /капучино/,
    /латте/,
    /раф/,
    /флэт/,
    /американо/,
    /мокко/,
    /ристретто/,
    /макиато/,
    /кофемашин/,
    /кофемолк/,
    /зерн/,
    /обжарк/,
    /молок/,
    /сливк/,
    /пенк/,
    /сироп/,
    /десерт/,
    /торт/,
    /выпечк/,
    /напит/,
    /крепост/,
    /гореч/,
    /сладк/,
    /кислотност/,
    /аромат/,
    /вкус/,
    /приготов/,
    /завар/,
    /рецепт/,
    /температур/,
    /помол/,
    /фильтр/,
    /турк/,
    /воронк/,
    /френч-пресс/,
    /кофеин/,
    /без кофеин/,
    /айс-кофе/
  ];

  // Приветствия и короткие уточнения
  const greetings = /^(привет|здравствуй|добрый день|доброе утро|добрый вечер|спасибо|благодарю|пока)[!. ]*$/i;

  const followUps = /^(а какой|а какая|а какие|а почему|а если|а можно|а сколько|что лучше|какой лучше|какой из них|расскажи подробнее|почему именно|и что тогда)/i;

  if (greetings.test(message)) return true;

  if (coffeeTopics.some(pattern => pattern.test(message))) {
    return true;
  }

  // Разрешаем короткие уточнения в контексте предыдущего разговора
  if (hasHistory && followUps.test(message)) {
    return true;
  }

  return false;
}

export class Chatbot {
  constructor() {
    this.drinks = drinks;
    this.history = [];
  }

async reply(text, tastes = []) {
  if (!isCoffeeRelated(text, this.history.length > 0)) {
    return {
      text: "Я специализируюсь на кофе и напитках Brew & Bean ☕ Могу помочь выбрать напиток, рассказать о способах приготовления кофе или подобрать десерт к любимому напитку. Что вас интересует?"
    };
  }

  const tasteContext = tastes.length
      ? `Предпочтения гостя: ${tastes.join(", ")}. `
      : "";

    // Сначала пробуем ответить локальной GGUF-моделью.
    try {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...this.history.slice(-8),
        { role: "user", content: `${tasteContext}${text}` }
      ];
      const answer = await generateWithModel(messages);
      if (answer) {
        this.history.push(
          { role: "user", content: `${tasteContext}${text}` },
          { role: "assistant", content: answer }
        );
        return { text: answer };
      }
    } catch (error) {
      console.warn("Локальная модель недоступна, используется демонстрационный ответ:", error);
    }

    // Запасной режим нужен, чтобы интерфейс оставался работоспособным,
    // если модель ещё не загружена или браузер не смог выделить память.
    const lower = text.toLowerCase();
    if (lower.includes("десерт")) {
      return {
        text: "К десерту лучше взять кофе, который не спорит со сладостью. Вот два варианта:",
        recommendations: [drinks[0], drinks[4]]
      };
    }
    if (lower.includes("гореч")) {
      return {
        text: "Тогда советую мягкий молочный кофе. Latte — самый деликатный, а Raf подойдёт, если хочется чуть слаще.",
        recommendations: [drinks[2], drinks[4]]
      };
    }
    if (lower.includes("креп") || lower.includes("бодр")) {
      return {
        text: "Если хочется более выраженного кофейного вкуса, попробуйте Espresso или Flat White.",
        recommendations: [drinks[0], drinks[3]]
      };
    }
    return {
      text: tastes.length
        ? `Учла ваши предпочтения: ${tastes.join(", ").toLowerCase()}. Вот два варианта, с которых можно начать:`
        : "С удовольствием помогу. Сравнила два популярных варианта:",
      recommendations: [drinks[1], drinks[3]]
    };
  }
}
