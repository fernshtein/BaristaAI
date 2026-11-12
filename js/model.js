import { Wllama } from "@wllama/wllama";
import wasmUrl from "@wllama/wllama/esm/wasm/wllama.wasm?url";

// Wllama v3: WASM берётся из установленного npm-пакета,
// а GGUF — из public/models. Vite отдаёт public по корню сайта.
const WASM_PATHS = {
  default: wasmUrl
};
const MODEL_URL = "/models/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf";

let instance = null;
let loadPromise = null;
let ready = false;

export async function loadModel(onProgress = () => {}) {
  if (ready) return instance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    instance = new Wllama(WASM_PATHS);
    await instance.loadModelFromUrl(MODEL_URL, {
      n_ctx: 4096,
      n_threads: Math.max(1, Math.min(6, navigator.hardwareConcurrency || 4)),
      progressCallback: onProgress
    });
    ready = true;
    return instance;
  })();

  try {
    return await loadPromise;
  } catch (error) {
    instance = null;
    loadPromise = null;
    throw error;
  }
}

export function isModelReady() {
  return ready;
}

export async function generateWithModel(messages, onProgress) {
  const model = await loadModel(onProgress);
  const response = await model.createChatCompletion({
    messages,
    temperature: 0.45,
    top_p: 0.85,
    top_k: 40,
    max_tokens: 512
  });

  if (typeof response === "string") return response.trim();
  return response?.choices?.[0]?.message?.content?.trim() || "";
}
