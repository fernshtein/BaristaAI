
import { Wllama } from '@wllama/wllama';
import WasmFromCDN from '@wllama/wllama/esm/wasm-from-cdn.js';

const status = document.getElementById('status');
const answer = document.getElementById('answer');
const loadButton = document.getElementById('load');
const askButton = document.getElementById('ask');

let wllama;

loadButton.addEventListener('click', async () => {
  try {
    loadButton.disabled = true;
    status.textContent = 'Инициализация Wllama...';

    wllama = new Wllama(WasmFromCDN);

    status.textContent = 'Загрузка модели...';

    await wllama.loadModelFromUrl(
      '/models/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf',
      {
        progressCallback: ({ loaded, total }) => {
          const percent = Math.round(loaded / total * 100);
          status.textContent = `Загрузка модели: ${percent}%`;
        }
      }
    );

    status.textContent = 'Модель успешно загружена!';
    askButton.disabled = false;

  } catch (error) {
    status.textContent = 'Ошибка загрузки: ' + error.message;
    console.error(error);
    loadButton.disabled = false;
  }
});

askButton.addEventListener('click', async () => {
  try {
    askButton.disabled = true;
    status.textContent = 'Генерирую ответ...';

    const question = document.getElementById('question').value;

    const result = await wllama.createChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Ты — профессиональный бариста. Отвечай на русском языке. Помогай выбирать кофе, объясняй вкус напитков, горечь, кислотность и способы приготовления.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    answer.textContent = result.choices[0].message.content;
    status.textContent = 'Ответ успешно получен!';

  } catch (error) {
    status.textContent = 'Ошибка генерации: ' + error.message;
    console.error(error);
  } finally {
    askButton.disabled = false;
  }
});
