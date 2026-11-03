'use strict';

/* ================= Справочники ================= */

const FAMILIES = {
  joy: { name: 'Радость', color: 'var(--joy)' },
  calm: { name: 'Спокойствие', color: 'var(--calm)' },
  surprise: { name: 'Удивление', color: 'var(--surprise)' },
  sadness: { name: 'Грусть', color: 'var(--sadness)' },
  anger: { name: 'Злость', color: 'var(--anger)' },
  fear: { name: 'Тревога', color: 'var(--fear)' },
  shame: { name: 'Стыд', color: 'var(--shame)' },
  disgust: { name: 'Неприязнь', color: 'var(--disgust)' },
};
const CATEGORIES = ['внешность', 'дорога', 'работа', 'отношения', 'семья', 'здоровье', 'деньги', 'дом', 'отдых', 'другое'];
const BASE_TAGS = ['работа', 'общение', 'дом', 'отношения', 'семья', 'здоровье', 'спорт', 'дорога', 'деньги', 'отдых', 'внешность'];

// Эмоции для полосы выбора: [название, семейство, приятность -1..1, энергия -1..1]
const EMOTIONS = [
  ['радость', 'joy', 0.7, 0.5], ['воодушевление', 'joy', 0.6, 0.8], ['восторг', 'joy', 0.8, 0.9], ['гордость', 'joy', 0.6, 0.4],
  ['интерес', 'surprise', 0.4, 0.5], ['удивление', 'surprise', 0.1, 0.8], ['благодарность', 'calm', 0.7, 0.15],
  ['удовлетворение', 'joy', 0.6, -0.1], ['нежность', 'calm', 0.6, -0.25], ['спокойствие', 'calm', 0.6, -0.45],
  ['умиротворение', 'calm', 0.7, -0.65], ['расслабленность', 'calm', 0.5, -0.8],
  ['раздражение', 'anger', -0.5, 0.6], ['злость', 'anger', -0.7, 0.8], ['тревога', 'fear', -0.5, 0.7], ['напряжение', 'fear', -0.35, 0.5],
  ['страх', 'fear', -0.7, 0.65], ['неприязнь', 'disgust', -0.6, 0.3], ['обида', 'sadness', -0.6, 0.15],
  ['стыд', 'shame', -0.5, -0.15], ['вина', 'shame', -0.45, -0.1], ['разочарование', 'sadness', -0.6, -0.3],
  ['грусть', 'sadness', -0.6, -0.5], ['одиночество', 'sadness', -0.6, -0.65], ['усталость', 'sadness', -0.3, -0.8], ['апатия', 'sadness', -0.4, -0.9],
];
const EMO_MAP = Object.fromEntries(EMOTIONS.map(([n, f, x, y]) => [n, { family: f, x, y }]));
const FAMILY_POS = {
  joy: [0.65, 0.55], calm: [0.6, -0.55], surprise: [0.2, 0.8], sadness: [-0.55, -0.55],
  anger: [-0.65, 0.7], fear: [-0.5, 0.65], shame: [-0.5, -0.2], disgust: [-0.6, 0.3],
};

const MODELS = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5 (по умолчанию)' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5 (быстрее)' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5 (самый быстрый)' },
];
const MIN_FOR_PATTERNS = 3;
const CRISIS_RE = /(поконч\S* с собой|не хочу жить|не хочется жить|убить себя|убью себя|суицид|самоубий|поре?зать себя|причинить себе вред|навредить себе|хочу умереть|лучше бы меня не было|нет смысла жить|жить незачем|уйти из жизни)/i;

const ICONS = {
  today: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>',
  book: '<rect x="5" y="3.5" width="14" height="17" rx="3"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
  spark: '<path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"/><path d="M18.5 15.5c.25 1.6 1 2.35 2.5 2.5-1.5.25-2.25 1-2.5 2.5-.25-1.5-1-2.25-2.5-2.5 1.5-.15 2.25-.9 2.5-2.5z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  up: '<path d="M12 19V5"/><path d="m5.5 11.5 6.5-6.5 6.5 6.5"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19 13 11"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ================= Хранилище ================= */

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('emo.' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('emo.' + key, JSON.stringify(value));
    } catch (e) {
      toast('Не удалось сохранить на устройстве');
    }
  },
};

let entries = store.get('entries', []);
let profile = store.get('profile', null);
let practices = store.get('practices', {});
let settings = Object.assign({ apiKey: '', model: MODELS[0].id, onboarded: false, customTags: [] }, store.get('settings', {}));

const saveEntries = () => store.set('entries', entries);
const savePractices = () => store.set('practices', practices);
const saveSettings = () => store.set('settings', settings);

/* ================= Утилиты ================= */

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const famColor = (a) => FAMILIES[a?.family]?.color || 'var(--none)';
const analyzed = () => entries.filter((e) => e.analysis);
const isNeg = (a) => a && (a.valence === 'negative' || a.valence === 'mixed');
const isPos = (a) => a && a.valence === 'positive';
const allTags = () => [...BASE_TAGS, ...settings.customTags.filter((t) => !BASE_TAGS.includes(t))];

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
const timeOf = (ts) => new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

function countBy(list, fn) {
  const m = new Map();
  for (const x of list) {
    const k = fn(x);
    if (k == null || k === '') continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
function plural(n, one, few, many) {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
  return many;
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (!el.firstChild) el.innerHTML = icon(el.dataset.icon);
  });
}

/* ================= Палитра состояний ================= */

// Цвет точки: оттенок по углу (приятность × энергия), насыщенность — по удалённости от центра
const RING = [
  [0, [204, 202, 112]], [45, [248, 182, 78]], [90, [242, 138, 86]], [135, [232, 104, 104]],
  [180, [182, 104, 152]], [225, [100, 98, 164]], [270, [84, 138, 170]], [315, [116, 190, 150]], [360, [204, 202, 112]],
];
const NEUTRAL = [240, 230, 236];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function moodRGB(x, y) {
  const ang = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  let i = 0;
  while (ang > RING[i + 1][0]) i++;
  const [a0, c0] = RING[i], [a1, c1] = RING[i + 1];
  const c = mix(c0, c1, (ang - a0) / (a1 - a0));
  const d = Math.min(1, Math.hypot(x, y) / 0.95);
  return mix(NEUTRAL, c, Math.pow(d, 0.7));
}
const moodColor = (m) => `rgb(${moodRGB(m.x, m.y).map(Math.round).join(',')})`;

const HEX_R = 6;
const SQ3 = Math.sqrt(3);
const CELLS = (() => {
  const out = [];
  const maxX = SQ3 * HEX_R, maxY = 1.5 * HEX_R;
  for (let q = -HEX_R; q <= HEX_R; q++) {
    for (let r = -HEX_R; r <= HEX_R; r++) {
      const s = -q - r;
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) > HEX_R) continue;
      const px = SQ3 * (q + r / 2), py = 1.5 * r;
      if (Math.hypot(px, py) > maxY + 0.4) continue;
      out.push({ px, py, x: clamp(px / maxY, -1, 1), y: clamp(-py / maxY, -1, 1) });
    }
  }
  return out;
})();

function hexPoints(cx, cy, r) {
  let p = '';
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 180) * (60 * k - 90);
    p += `${(cx + r * Math.cos(a)).toFixed(3)},${(cy + r * Math.sin(a)).toFixed(3)} `;
  }
  return p.trim();
}
function nearestCell(m) {
  let best = CELLS[0], bd = Infinity;
  for (const c of CELLS) {
    const d = (c.x - m.x) ** 2 + (c.y - m.y) ** 2;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

function paletteSVG({ selected = null, points = [], mini = false } = {}) {
  const span = 1.5 * HEX_R + 1.2;
  let cells = '';
  for (const c of CELLS) {
    const dim = points.length ? ' opacity="0.4"' : '';
    cells += `<polygon class="hx" points="${hexPoints(c.px, c.py, 0.93)}" fill="${moodColor(c)}"${dim}/>`;
  }
  let marks = '';
  for (const p of points) {
    const c = nearestCell(p);
    marks += `<polygon points="${hexPoints(c.px, c.py, points.length > 1 ? 0.95 : 1.2)}" fill="${moodColor(c)}" stroke="var(--card)" stroke-width="${points.length > 1 ? 0.18 : 0.32}"/>`;
  }
  if (selected) {
    const c = nearestCell(selected);
    marks += `<g class="sel"><polygon points="${hexPoints(c.px, c.py, 1.2)}" fill="${moodColor(c)}" stroke="#fff" stroke-width="0.32"/>
      <polygon points="${hexPoints(c.px, c.py, 1.2)}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="0.08" transform="translate(0 0.06)"/></g>`;
  }
  return `<svg viewBox="${-span} ${-span} ${span * 2} ${span * 2}" role="img" aria-label="Палитра состояний">${cells}${marks}</svg>`;
}

function paletteBlock(opts = {}) {
  const { interactive = false, mini = false } = opts;
  return `<div class="palette ${interactive ? 'interactive' : ''} ${mini ? 'mini' : ''}" ${interactive ? 'id="palette"' : ''}>
    <span class="ax top">много энергии<span>↑</span></span>
    <span class="ax bottom"><span>↓</span>мало энергии</span>
    <span class="ax left">← неприятно</span>
    <span class="ax right">приятно →</span>
    ${paletteSVG(opts)}
  </div>`;
}

function moodWords(m) {
  const e = m.y > 0.25 ? 'много энергии' : m.y < -0.25 ? 'мало энергии' : 'средне энергии';
  const p = m.x > 0.2 ? 'приятно' : m.x < -0.2 ? 'неприятно' : 'нейтрально';
  return `${p}, ${e}`;
}

function moodFromAnalysis(a) {
  const base = FAMILY_POS[a.family] || [0, 0];
  const k = 0.35 + 0.65 * (a.intensity / 10);
  let [x, y] = base;
  if (a.valence === 'positive' && x < 0) x = -x;
  if (a.valence === 'negative' && x > 0) x = -x;
  return { x: clamp(x * k, -1, 1), y: clamp(y * k, -1, 1) };
}
const entryMood = (e) => e.mood || (e.analysis ? moodFromAnalysis(e.analysis) : null);
const entryColor = (e) => {
  const m = entryMood(e);
  return m ? moodColor(m) : 'var(--none)';
};

function hexIcon(color, size = 22) {
  return `<svg class="hexi" width="${size}" height="${size}" viewBox="-1.05 -1.05 2.1 2.1" aria-hidden="true"><polygon points="${hexPoints(0, 0, 1)}" fill="${color}"/></svg>`;
}

function emotionsByMood(m) {
  if (!m) return EMOTIONS.map((e) => e[0]);
  return [...EMOTIONS].sort((a, b) => ((a[2] - m.x) ** 2 + (a[3] - m.y) ** 2) - ((b[2] - m.x) ** 2 + (b[3] - m.y) ** 2)).map((e) => e[0]);
}
function emotionColor(name) {
  const e = EMO_MAP[name];
  return e ? moodColor(e) : 'var(--none)';
}

/* ================= Claude API ================= */

class NoKeyError extends Error {}

async function callClaude({ system, messages, maxTokens = 4000 }) {
  if (!settings.apiKey) throw new NoKeyError('Нет ключа API');
  const withFallback = settings.model !== 'claude-haiku-5-5';
  const headers = {
    'content-type': 'application/json',
    'x-api-key': settings.apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };
  const body = {
    model: settings.model,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort: 'low' },
  };
  if (withFallback) {
    headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
    body.fallbacks = 'default';
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (data.stop_reason === 'refusal') throw new Error('Ассистент не смог обработать запрос');
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}

function parseJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Ответ ассистента не распознан');
  return JSON.parse(text.slice(start, end + 1));
}

function describeError(e) {
  if (e instanceof NoKeyError) return 'Ассистент не подключён — добавьте ключ в настройках.';
  if (e.status === 401) return 'Ключ API не подошёл — проверьте его в настройках.';
  if (e.status === 429) return 'Ассистент перегружен, попробуйте чуть позже.';
  if (e instanceof TypeError) return 'Нет связи с ассистентом.';
  return 'Ассистент сейчас недоступен.';
}

const ANALYSIS_SYSTEM = `Ты — тёплый, бережный ассистент в приложении «Дневник эмоций». Человек коротко рассказывает, что с ним случилось, и не хочет ничего анализировать сам. Твоя задача — разобрать рассказ за него.

Правила:
- Никогда не проси человека анализировать себя.
- Без морали, советов и диагнозов.
- Корень формулируй мягко, как гипотезу («возможно…», «похоже…»).
- В текстах для человека обращайся на «ты», тепло и коротко.
- Уточняющий вопрос задавай, только если без него действительно непонятно, что задело. Он должен быть один, короткий и простой (не «почему ты так себя чувствуешь?», а про факты ситуации). Если всё понятно — question пустая строка.
- Если человек сам отметил состояние на палитре или выбрал эмоции — учитывай это как главный ориентир.
- risk = true, если в рассказе есть признаки мыслей о причинении вреда себе или угрозы жизни.

Ответь ТОЛЬКО JSON-объектом без пояснений, со всеми полями:
{
  "emotion": "конкретная эмоция одним-двумя словами, по-русски, со строчной буквы (раздражение, стыд, умиротворение…)",
  "family": "одно из: joy, calm, surprise, sadness, anger, fear, shame, disgust",
  "secondary": ["до двух сопутствующих эмоций"],
  "valence": "positive | negative | mixed",
  "intensity": число от 1 до 10,
  "title": "название ситуации, 3–6 слов, с заглавной буквы",
  "category": "одно из: ${CATEGORIES.join(', ')}",
  "trigger": "что запустило реакцию, коротко",
  "thought": "автоматическая мысль от первого лица, в кавычках не нужно",
  "body": "вероятные телесные ощущения, коротко",
  "need": "задетая (или удовлетворённая, если момент приятный) потребность или ценность, 1–3 слова",
  "root": "мягкая гипотеза о глубинном корне, 1 предложение",
  "reflection": "одна тёплая фраза поддержки (для приятного момента — разделить радость)",
  "question": "один уточняющий вопрос или пустая строка",
  "risk": true | false
}`;

function normalizeAnalysis(a) {
  const out = Object.assign({}, a);
  if (!FAMILIES[out.family]) out.family = isPos(out) ? 'joy' : 'sadness';
  if (!['positive', 'negative', 'mixed'].includes(out.valence)) out.valence = ['joy', 'calm'].includes(out.family) ? 'positive' : 'negative';
  out.intensity = clamp(Math.round(Number(out.intensity) || 5), 1, 10);
  if (!CATEGORIES.includes(out.category)) out.category = 'другое';
  out.secondary = Array.isArray(out.secondary) ? out.secondary.map(String).slice(0, 2) : [];
  out.question = typeof out.question === 'string' ? out.question.trim() : '';
  out.risk = Boolean(out.risk);
  for (const k of ['emotion', 'title', 'trigger', 'thought', 'body', 'need', 'root', 'reflection']) out[k] = String(out[k] || '').trim();
  out.emotion = out.emotion.toLowerCase();
  if (!out.title) out.title = 'Момент';
  return out;
}

async function analyzeEntry(entry, { allowQuestion }) {
  let content = `Рассказ: ${entry.text || '(без текста)'}`;
  if (entry.mood) content += `\nОтметка на палитре: ${moodWords(entry.mood)}.`;
  if (entry.picked?.length) content += `\nСам выбрал эмоции: ${entry.picked.join(', ')}.`;
  if (entry.tags?.length) content += `\nМетки: ${entry.tags.join(', ')}.`;
  if (entry.clarify) content += `\n\nУточняющий вопрос: ${entry.clarify.q}\nОтвет: ${entry.clarify.a}`;
  if (!allowQuestion) content += '\n\nУточняющий вопрос больше не задавай: поле question должно быть пустым.';
  const text = await callClaude({ system: ANALYSIS_SYSTEM, messages: [{ role: 'user', content }] });
  const a = normalizeAnalysis(parseJSON(text));
  if (!allowQuestion) a.question = '';
  if (CRISIS_RE.test(entry.text + ' ' + (entry.clarify?.a || ''))) a.risk = true;
  return a;
}

// Разбор без ассистента — по точке на палитре и выбранным эмоциям
function manualAnalysis({ mood, picked, tags }) {
  const names = picked.length ? picked : [emotionsByMood(mood)[0]];
  const main = names[0];
  const known = EMO_MAP[main];
  return {
    source: 'manual',
    emotion: main,
    family: known?.family || (mood.x >= 0 ? 'calm' : 'sadness'),
    secondary: names.slice(1, 3),
    valence: mood.x > 0.15 ? 'positive' : mood.x < -0.15 ? 'negative' : 'mixed',
    intensity: clamp(Math.round(2 + 8 * Math.min(1, Math.hypot(mood.x, mood.y))), 1, 10),
    title: cap(names.join(', ')),
    category: tags.find((t) => CATEGORIES.includes(t)) || 'другое',
    trigger: '', thought: '', body: '', need: '', root: '', reflection: '', question: '', risk: false,
  };
}

function entriesDigest(list) {
  return list.map((e) => {
    const a = e.analysis;
    const when = new Date(e.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const parts = [`${a.emotion} (${a.valence}, сила ${a.intensity})`, `тема: ${a.category}`];
    if (a.trigger) parts.push(`триггер: ${a.trigger}`);
    if (a.thought) parts.push(`мысль: ${a.thought}`);
    if (a.need) parts.push(`потребность: ${a.need}`);
    if (e.tags?.length) parts.push(`метки: ${e.tags.join(', ')}`);
    return `- [${when}] «${a.title}»: ${parts.join(', ')}.${e.text ? ` Рассказ: ${e.text}` : ''}`;
  }).join('\n');
}

async function buildProfile() {
  const list = analyzed().slice(0, 80);
  const system = `Ты — бережный ассистент «Дневника эмоций». По записям человека составь его эмоциональный портрет. Обращайся на «ты», тепло, без морали и диагнозов, корни — как гипотезы.
Ответь ТОЛЬКО JSON:
{
  "summary": "главное о человеке по записям, 2–3 предложения",
  "triggers": [{"root": "корень/задетая потребность", "explanation": "1 предложение", "examples": ["короткие названия ситуаций"]}],
  "joy": ["что поднимает настроение и какая потребность за этим стоит, по пункту на строку"],
  "suggestion": "с чего начать работу, 1–2 предложения"
}
triggers — до 3 пунктов, joy — до 4.`;
  const text = await callClaude({ system, messages: [{ role: 'user', content: entriesDigest(list) }], maxTokens: 6000 });
  const p = parseJSON(text);
  profile = {
    summary: String(p.summary || ''),
    triggers: Array.isArray(p.triggers) ? p.triggers.slice(0, 3) : [],
    joy: Array.isArray(p.joy) ? p.joy.slice(0, 4) : [],
    suggestion: String(p.suggestion || ''),
    date: Date.now(),
    basedOn: list.length,
  };
  store.set('profile', profile);
}

const PRACTICE_SYSTEM = `Ты — бережный ассистент «Дневника эмоций». Перед тобой повторяющаяся тяжёлая реакция человека в одной теме. Составь разбор паттерна. Обращайся на «ты», тепло, без морали и диагнозов, корень и убеждение — как гипотезы. Практика — простая, выполнимая за пару минут прямо в моменте.
Ответь ТОЛЬКО JSON:
{
  "name": "название паттерна, 2–5 слов",
  "cycle": {"trigger": "…", "thought": "…", "emotion": "…", "action": "что человек обычно делает"},
  "root": "корень, 1 предложение",
  "oldBelief": "старое убеждение от первого лица",
  "newThought": "новая поддерживающая мысль от первого лица",
  "steps": ["шаг 1", "шаг 2", "шаг 3"],
  "question": "вопрос для размышления"
}`;

function recurringGroups() {
  const groups = new Map();
  for (const e of analyzed()) {
    if (!isNeg(e.analysis)) continue;
    const key = `${e.analysis.category}|negative`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  return [...groups.entries()]
    .filter(([, list]) => list.length >= 2)
    .map(([key, list]) => ({ key, category: key.split('|')[0], list }))
    .sort((a, b) => b.list.length - a.list.length);
}

async function buildPractice(group) {
  const text = await callClaude({
    system: PRACTICE_SYSTEM,
    messages: [{ role: 'user', content: `Тема: ${group.category}\nЗаписи:\n${entriesDigest(group.list)}` }],
    maxTokens: 5000,
  });
  const p = parseJSON(text);
  const prev = practices[group.key] || {};
  practices[group.key] = {
    name: String(p.name || 'Повторяющаяся реакция'),
    cycle: p.cycle || {},
    root: String(p.root || ''),
    oldBelief: String(p.oldBelief || ''),
    newThought: String(p.newThought || ''),
    steps: Array.isArray(p.steps) ? p.steps.slice(0, 3) : [],
    question: String(p.question || ''),
    tries: prev.tries || [],
    chat: prev.chat || [],
    date: Date.now(),
  };
  savePractices();
}

async function practiceReply(group, userText) {
  const p = practices[group.key];
  p.chat.push({ role: 'user', content: userText });
  savePractices();
  const system = `Ты — бережный ассистент «Дневника эмоций». Ты помогаешь человеку работать с повторяющейся реакцией «${p.name}» (тема: ${group.category}). Обращайся на «ты», отвечай коротко (2–5 предложений), тепло, без морали и диагнозов. Если звучат признаки угрозы жизни — мягко предложи прямо сейчас связаться с близким человеком или линией психологической помощи.
Разбор паттерна: ${JSON.stringify({ cycle: p.cycle, root: p.root, oldBelief: p.oldBelief, newThought: p.newThought, steps: p.steps })}
Записи по теме:
${entriesDigest(group.list.slice(0, 20))}`;
  const reply = await callClaude({ system, messages: p.chat.slice(-20), maxTokens: 3000 });
  p.chat.push({ role: 'assistant', content: reply });
  savePractices();
}

/* ================= Навигация ================= */

let tab = 'today';
let insightsMode = 'patterns';
let historyDay = dayKey(Date.now());
const pick = { mood: null, emotions: [], tags: [] }; // выбор на экране «Сегодня»

function setTab(next) {
  tab = next;
  document.querySelectorAll('.tab[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  render();
  window.scrollTo(0, 0);
}

function render() {
  const view = $('#view');
  view.innerHTML = { today: viewToday, history: viewHistory, insights: viewInsights }[tab]();
  hydrateIcons(view);
  if (tab === 'today') bindPalette();
  if (tab === 'history') {
    const strip = view.querySelector('.days');
    const on = strip?.querySelector('.day.on');
    if (on) strip.scrollLeft = on.offsetLeft - strip.clientWidth + on.offsetWidth + 24;
  }
}

function topbar() {
  return `<div class="topbar">
    <button class="icon-btn" data-action="settings" aria-label="Настройки"><span class="ti" data-icon="menu"></span></button>
    <button class="icon-btn" data-action="talk" aria-label="Рассказать"><span class="ti" data-icon="spark"></span></button>
  </div>`;
}

function keyBanner() {
  if (settings.apiKey) return '';
  return `<button class="banner" data-action="settings"><span class="ti" data-icon="key"></span><span>Подключите ассистента, чтобы рассказы разбирались автоматически. Отметки на палитре работают и без него.</span></button>`;
}

/* ---------- Сегодня ---------- */

function emotionBar(selected, mood, action) {
  return emotionsByMood(mood).map((n) => `<button class="chip ${selected.includes(n) ? 'on' : ''}" data-action="${action}" data-v="${esc(n)}"><span class="dot" style="--c:${emotionColor(n)}"></span>${esc(n)}</button>`).join('');
}
function tagBar(selected, action) {
  return allTags().map((t) => `<button class="chip ${selected.includes(t) ? 'on ink' : ''}" data-action="${action}" data-v="${esc(t)}">${esc(t)}</button>`).join('')
    + `<button class="chip add" data-action="add-tag" data-target="${action}">+</button>`;
}

function pickHint() {
  if (!pick.mood) return 'Коснись палитры или проведи по ней пальцем';
  const names = pick.emotions.length ? pick.emotions.join(', ') : emotionsByMood(pick.mood).slice(0, 2).join(' или ') + '?';
  return `<b>${esc(cap(names))}</b> · ${esc(moodWords(pick.mood))}`;
}

function viewToday() {
  const todays = entries.filter((e) => dayKey(e.createdAt) === dayKey(Date.now()));
  return `${topbar()}
    <div class="hero-title"><h1>Как ты сейчас?</h1><p>Отметь своё состояние на палитре</p></div>
    ${paletteBlock({ interactive: true, selected: pick.mood })}
    <div class="palette-hint" id="pick-hint">${pickHint()}</div>
    <div class="bar-label"><span>Что чувствуешь?</span><span>листай →</span></div>
    <div class="scroller" id="emo-bar">${emotionBar(pick.emotions, pick.mood, 'pick-emotion')}</div>
    <div class="bar-label"><span>Метки</span></div>
    <div class="scroller" id="tag-bar">${tagBar(pick.tags, 'pick-tag')}</div>
    <div class="pill-row">
      <button class="pill light" data-action="talk"><span class="ti" data-icon="mic"></span><span><b>Рассказать</b><small>наговорить</small></span></button>
      <button class="pill dark" data-action="quick-save"><span><b>Сохранить</b><small>без деталей</small></span></button>
    </div>
    ${keyBanner()}
    <div class="section-label">Сегодня</div>
    <div class="card">${todays.length ? todays.map(entryMini).join('') : '<div class="sub">Пока ничего не отмечено — начни с палитры.</div>'}</div>
    <div class="card"><div class="insight"><span class="ic"><span class="ti" data-icon="spark"></span></span><div><b>${esc(insight())}</b><span>Замечено по твоим записям</span></div></div></div>`;
}

function entryMini(e) {
  const a = e.analysis;
  return `<button class="entry-mini" data-action="open-entry" data-id="${e.id}">${hexIcon(entryColor(e), 26)}
    <span class="t"><b>${esc(a ? cap(a.emotion) : 'Без разбора')}</b><span>${esc(a?.title && a.source !== 'manual' ? a.title : (e.tags || []).join(' · ') || e.text || 'Отметка на палитре')}</span></span>
    <time>${timeOf(e.createdAt)}</time></button>`;
}

function insight() {
  const list = analyzed();
  if (list.length < 2) return 'Наблюдения появятся после нескольких отметок.';
  const neg = list.filter((e) => isNeg(e.analysis));
  const pos = list.filter((e) => isPos(e.analysis));
  const topNeg = countBy(neg, (e) => e.analysis.category === 'другое' ? null : e.analysis.category)[0];
  const topPos = countBy(pos, (e) => e.analysis.category === 'другое' ? null : e.analysis.category)[0];
  if (topNeg && topNeg[1] >= 2) return `Настроение чаще всего портят ситуации из темы «${topNeg[0]}».`;
  if (topPos && topPos[1] >= 2) return `Радость чаще всего приносит тема «${topPos[0]}».`;
  const topNeed = countBy(neg, (e) => e.analysis.need.toLowerCase())[0];
  if (topNeed) return `В тяжёлых моментах чаще всего задета потребность «${topNeed[0]}».`;
  return `Приятных моментов: ${pos.length}, тяжёлых: ${neg.length}.`;
}

function bindPalette() {
  const wrap = $('#palette');
  if (!wrap) return;
  const svg = wrap.querySelector('svg');
  let dragging = false;
  const pickAt = (ev) => {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const maxY = 1.5 * HEX_R;
    const m = { x: clamp(p.x / maxY, -1, 1), y: clamp(-p.y / maxY, -1, 1) };
    if (Math.hypot(p.x, p.y) > maxY + 1.2) return;
    const c = nearestCell(m);
    if (pick.mood && pick.mood.x === c.x && pick.mood.y === c.y) return;
    pick.mood = { x: c.x, y: c.y };
    updatePickUI();
  };
  svg.addEventListener('pointerdown', (ev) => { dragging = true; svg.setPointerCapture(ev.pointerId); pickAt(ev); });
  svg.addEventListener('pointermove', (ev) => { if (dragging) pickAt(ev); });
  const stop = () => {
    if (!dragging) return;
    dragging = false;
    $('#emo-bar').scrollLeft = 0; // ближайшие эмоции — в начале полосы
  };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);
}

function updatePickUI() {
  const wrap = $('#palette');
  if (wrap) wrap.querySelector('svg').outerHTML = paletteSVG({ selected: pick.mood });
  bindPalette();
  $('#pick-hint').innerHTML = pickHint();
  $('#emo-bar').innerHTML = emotionBar(pick.emotions, pick.mood, 'pick-emotion');
}

/* ---------- История ---------- */

function viewHistory() {
  const days = [];
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const first = entries.length ? new Date(entries[entries.length - 1].createdAt) : start;
  first.setHours(0, 0, 0, 0);
  const span = clamp(Math.round((start - first) / 864e5) + 7, 14, 120);
  for (let i = span - 1; i >= 0; i--) {
    const d = new Date(start); d.setDate(start.getDate() - i);
    days.push(d);
  }
  const wd = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const byDay = new Map();
  for (const e of entries) {
    const k = dayKey(e.createdAt);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(e);
  }
  const strip = days.map((d) => {
    const k = dayKey(d);
    const list = (byDay.get(k) || []).slice(0, 4);
    const stack = list.length
      ? list.map((e) => hexIcon(entryColor(e), 24)).join('')
      : hexIcon('var(--card-2)', 24);
    return `<button class="day ${k === historyDay ? 'on' : ''} ${k === dayKey(Date.now()) ? 'today' : ''}" data-action="pick-day" data-day="${k}">
      <span class="wd">${wd[d.getDay()]}</span><span class="num">${d.getDate()}</span><span class="stack">${stack}</span></button>`;
  }).join('');

  const selList = byDay.get(historyDay) || [];
  const selDate = days.find((d) => dayKey(d) === historyDay) || new Date();
  const month = selDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const title = cap(selDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }));

  return `<div class="page-title"><h1>История</h1>
      <button class="icon-btn" data-action="settings" aria-label="Настройки"><span class="ti" data-icon="menu"></span></button></div>
    <div class="month">${esc(month)}</div>
    <div class="scroller days">${strip}</div>
    <div class="day-title">${esc(title)}</div>
    ${selList.length ? selList.map(entryCard).join('') : '<div class="empty">В этот день записей нет.</div>'}`;
}

function entryCard(e) {
  const a = e.analysis;
  const names = a ? [a.emotion, ...a.secondary].filter(Boolean) : [];
  const tags = (e.tags || []).map((t) => `<span class="chip small static">${esc(t)}</span>`).join('');
  return `<button class="entry-card" data-action="open-entry" data-id="${e.id}">
    <div class="top">${hexIcon(entryColor(e), 34)}<time>${timeOf(e.createdAt)}</time>${tags}</div>
    <div class="ttl">${esc(a ? cap(names.join(', ')) : 'Без разбора')}</div>
    ${e.text ? `<div class="txt">${esc(e.text)}</div>` : a?.title && a.source !== 'manual' ? `<div class="txt">${esc(a.title)}</div>` : ''}
    ${a ? `<div class="meter"><span>${esc(cap(a.emotion))}</span><span class="track"><span class="fill" style="width:${a.intensity * 10}%;--c:${entryColor(e)}"></span></span><span class="n">${a.intensity}/10</span></div>` : ''}
  </button>`;
}

function openEntry(id) {
  const e = entries.find((x) => x.id === id);
  if (!e) return;
  const a = e.analysis;
  const when = new Date(e.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  const row = (label, val) => (val ? `<dt>${label}</dt><dd>${esc(val)}</dd>` : '');
  const mood = entryMood(e);
  let body = `<div class="sheet-head"><h2>${esc(a ? cap(a.emotion) : 'Запись')}</h2><button class="link-btn" data-action="close-sheet">Готово</button></div>
    <div class="muted small" style="margin:-8px 0 12px">${esc(when)}${a && a.source !== 'manual' ? ' · ' + esc(a.title) : ''}</div>`;
  if (mood) body += `<div class="card">${paletteBlock({ mini: true, points: [mood] })}</div>`;
  if (a?.reflection) body += `<div class="card"><p class="reflection">${esc(a.reflection)}</p></div>`;
  body += `<div class="card"><dl class="detail">
    ${row('Рассказ', e.text)}
    ${e.clarify ? row('Уточнение', `${e.clarify.q} — ${e.clarify.a}`) : ''}
    ${a ? `${row('Эмоции', [a.emotion, ...a.secondary].join(', ') + ` · сила ${a.intensity}/10`)}${row('Триггер', a.trigger)}${row('Тема', a.category !== 'другое' ? a.category : '')}${row('Мысль', a.thought ? `«${a.thought}»` : '')}${row('В теле', a.body)}${row('Потребность', a.need)}${row('Возможный корень', a.root)}` : ''}
    ${row('Метки', (e.tags || []).join(', '))}
  </dl></div>`;
  if (a?.risk) body += crisisCard();
  if ((!a || a.source === 'manual') && e.text) body += `<button class="btn block" data-action="reanalyze" data-id="${e.id}" style="margin-bottom:10px">Разобрать с ассистентом</button>`;
  body += `<button class="btn danger block" data-action="delete-entry" data-id="${e.id}">Удалить запись</button>`;
  openSheet(body);
}

/* ---------- Инсайты ---------- */

function viewInsights() {
  return `<div class="page-title"><h1>Инсайты</h1>
      <button class="icon-btn" data-action="settings" aria-label="Настройки"><span class="ti" data-icon="menu"></span></button></div>
    <div class="seg wide"><button class="${insightsMode === 'patterns' ? 'on' : ''}" data-action="insights-mode" data-v="patterns">Паттерны</button>
      <button class="${insightsMode === 'work' ? 'on' : ''}" data-action="insights-mode" data-v="work">Практики</button></div>
    ${insightsMode === 'patterns' ? viewPatterns() : viewWork()}`;
}

function insightCards(list, neg, pos) {
  const cards = [];
  const slots = [['утром', 5, 12], ['днём', 12, 17], ['вечером', 17, 23], ['ночью', 23, 5]];
  const inSlot = (h, [, from, to]) => (from < to ? h >= from && h < to : h >= from || h < to);
  const topCat = countBy(neg, (e) => e.analysis.category === 'другое' ? null : e.analysis.category)[0];
  if (topCat) cards.push(['cloud', `Чаще всего настроение портит тема «${topCat[0]}»`, `${topCat[1]} из ${neg.length} тяжёлых моментов`]);
  const topNeed = countBy(neg, (e) => e.analysis.need.toLowerCase())[0];
  if (topNeed && topNeed[1] >= 2) cards.push(['heart', `В тяжёлые моменты задета потребность «${topNeed[0]}»`, `на основе ${topNeed[1]} ${plural(topNeed[1], 'записи', 'записей', 'записей')}`]);
  let worst = null;
  for (const s of slots) {
    const l = list.filter((e) => inSlot(new Date(e.createdAt).getHours(), s));
    if (l.length < 2) continue;
    const share = l.filter((e) => isNeg(e.analysis)).length / l.length;
    if (!worst || share > worst.share) worst = { s, share, n: l.length };
  }
  if (worst && worst.share >= 0.5) cards.push(['clock', `${cap(worst.s[0])} тяжёлые моменты случаются чаще`, `в ${Math.round(worst.share * 100)}% случаев из ${worst.n}`]);
  const topJoy = countBy(pos, (e) => e.analysis.category === 'другое' ? null : e.analysis.category)[0];
  if (topJoy) cards.push(['spark', `Радость чаще приносит тема «${topJoy[0]}»`, `${topJoy[1]} ${plural(topJoy[1], 'приятный момент', 'приятных момента', 'приятных моментов')}`]);
  return cards.map(([ic, b, s]) => `<div class="card"><div class="insight"><span class="ic"><span class="ti" data-icon="${ic}"></span></span><div><b>${esc(b)}</b><span>${esc(s)}</span></div></div></div>`).join('');
}

function viewPatterns() {
  const list = analyzed();
  if (list.length < MIN_FOR_PATTERNS) {
    const left = MIN_FOR_PATTERNS - list.length;
    return `${keyBanner()}<div class="empty"><div class="big">🧭</div>
      Профиль появится после ${MIN_FOR_PATTERNS} записей.<br>Осталось ещё ${left} ${plural(left, 'отметка', 'отметки', 'отметок')}.</div>`;
  }
  const pos = list.filter((e) => isPos(e.analysis));
  const neg = list.filter((e) => isNeg(e.analysis));
  const avg = (list.reduce((s, e) => s + e.analysis.intensity, 0) / list.length).toFixed(1);

  const fams = countBy(list, (e) => e.analysis.family);
  const famMax = fams[0][1];
  const famBars = fams.map(([f, n]) => `<div class="bar-row"><span>${FAMILIES[f].name}</span>
    <span class="bar-track"><span class="bar-fill" style="width:${(n / famMax) * 100}%;--c:${FAMILIES[f].color}"></span></span><span class="n">${n}</span></div>`).join('');
  const posShare = Math.round((pos.length / list.length) * 100);
  const negShare = Math.round((neg.length / list.length) * 100);

  const topCats = countBy(neg, (e) => e.analysis.category).slice(0, 5);
  const catMax = topCats[0]?.[1] || 1;
  const cats = topCats.length
    ? topCats.map(([c, n]) => `<div class="bar-row"><span>${esc(c)}</span><span class="bar-track"><span class="bar-fill" style="width:${(n / catMax) * 100}%;--c:var(--anger)"></span></span><span class="n">${n}</span></div>`).join('')
    : '<div class="sub">Тяжёлых моментов пока не было.</div>';

  const needs = countBy(neg, (e) => e.analysis.need.toLowerCase()).slice(0, 4);
  const roots = needs.length
    ? needs.map(([need, n]) => {
        const ex = neg.filter((e) => e.analysis.need.toLowerCase() === need).slice(0, 3).map((e) => e.analysis.title);
        return `<div class="root-item"><b>${esc(need)} · ${n}</b><span class="sub">${esc(ex.join(' · '))}</span></div>`;
      }).join('')
    : '<div class="sub">Появится, когда ассистент разберёт рассказы.</div>';

  const joys = pos.length ? pos.slice(0, 6).map(entryMini).join('') : '<div class="sub">Отметь приятный момент — здесь будет видно, что тебя поднимает.</div>';

  const slots = [['Утро', 5, 12], ['День', 12, 17], ['Вечер', 17, 23], ['Ночь', 23, 5]];
  const inSlot = (h, [, from, to]) => (from < to ? h >= from && h < to : h >= from || h < to);
  const times = slots.map((s) => {
    const l = list.filter((e) => inSlot(new Date(e.createdAt).getHours(), s));
    const share = l.length ? Math.round((l.filter((e) => isNeg(e.analysis)).length / l.length) * 100) : 0;
    return `<div class="time-cell"><b>${l.length}</b><span>${s[0]}</span>${l.length ? `<i>${share}% тяжёлых</i>` : '<i style="color:var(--text-3)">—</i>'}</div>`;
  }).join('');

  return `${insightCards(list, neg, pos)}
    <div class="card"><h3>Карта состояний</h3>${paletteBlock({ mini: true, points: list.map(entryMood).filter(Boolean) })}</div>
    <div class="card"><h3>Какие эмоции чаще</h3>${famBars}
      <div class="ratio"><span style="width:${posShare}%;background:var(--calm)"></span><span style="width:${negShare}%;background:var(--anger)"></span></div>
      <div class="legend"><span>приятные ${posShare}%</span><span>тяжёлые ${negShare}%</span></div>
      <div class="stats"><div class="stat"><b>${list.length}</b><span>${plural(list.length, 'запись', 'записи', 'записей')}</span></div>
        <div class="stat"><b>${avg}</b><span>средняя сила</span></div>
        <div class="stat"><b>${pos.length}:${neg.length}</b><span>приятные : тяжёлые</span></div></div></div>
    <div class="card"><h3>Что расстраивает</h3>${cats}</div>
    <div class="card"><h3>Корни</h3><div class="sub" style="margin:-6px 0 10px">Какие потребности задеты чаще всего</div>${roots}</div>
    <div class="card"><h3>Что поднимает настроение</h3>${joys}</div>
    <div class="card"><h3>Когда случается</h3><div class="times">${times}</div></div>
    <div class="card ai-card"><h3>Взгляд ассистента</h3>${profileBlock()}</div>`;
}

function profileBlock() {
  if (!profile) {
    return `<p class="sub">Ассистент посмотрит на все записи и опишет главное: корни триггеров, источники радости и с чего начать.</p>
      <button class="btn block" data-action="build-profile">Составить портрет</button>`;
  }
  const date = new Date(profile.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return `<p>${esc(profile.summary)}</p>
    ${profile.triggers.length ? `<b>Корни триггеров</b><ul>${profile.triggers.map((t) => `<li><b>${esc(t.root)}</b> — ${esc(t.explanation)}${t.examples?.length ? `<br><span class="muted small">${esc(t.examples.join(' · '))}</span>` : ''}</li>`).join('')}</ul>` : ''}
    ${profile.joy.length ? `<b>Источники радости</b><ul>${profile.joy.map((j) => `<li>${esc(j)}</li>`).join('')}</ul>` : ''}
    ${profile.suggestion ? `<b>С чего начать</b><p>${esc(profile.suggestion)}</p>` : ''}
    <div class="muted small" style="margin-bottom:10px">Обновлено ${esc(date)} · по ${profile.basedOn} ${plural(profile.basedOn, 'записи', 'записям', 'записям')}</div>
    <button class="btn soft block" data-action="build-profile">Обновить</button>`;
}

function viewWork() {
  const groups = recurringGroups();
  if (!groups.length) {
    return `<div class="empty"><div class="big">🌱</div>
      Здесь появятся повторяющиеся реакции — когда тяжёлый момент в одной теме случится хотя бы дважды.</div>`;
  }
  const rows = groups.map((g) => {
    const p = practices[g.key];
    const top = countBy(g.list, (e) => e.analysis.emotion)[0][0];
    const sub = p ? `${p.name} · применено ${p.tries.length} ${plural(p.tries.length, 'раз', 'раза', 'раз')}` : `${g.list.length} ${plural(g.list.length, 'раз', 'раза', 'раз')} · чаще всего ${top}`;
    return `<button class="practice-row" data-action="open-practice" data-key="${esc(g.key)}">
      ${hexIcon(entryColor(g.list[0]), 34)}
      <span class="t"><b>Тема «${esc(g.category)}»</b><span>${esc(sub)}</span></span>
      <span class="chev">${icon('chev')}</span></button>`;
  }).join('');
  return `<div class="sub" style="margin:0 4px 12px">Повторяющиеся тяжёлые реакции. Выбери одну — ассистент разберёт цикл и предложит практику.</div>
    <div class="card">${rows}</div>`;
}

function openPractice(key, { loading = false } = {}) {
  const group = recurringGroups().find((g) => g.key === key);
  if (!group) return closeSheet();
  const p = practices[key];
  let body = `<div class="sheet-head"><h2>${esc(p ? p.name : `Тема «${group.category}»`)}</h2><button class="link-btn" data-action="close-sheet">Готово</button></div>`;
  if (!p) {
    body += `<div class="card"><div class="sub">${group.list.length} ${plural(group.list.length, 'тяжёлый момент', 'тяжёлых момента', 'тяжёлых моментов')} в этой теме:</div>
      <ul>${group.list.slice(0, 5).map((e) => `<li>${esc(e.analysis.title)} — ${esc(e.analysis.emotion)}</li>`).join('')}</ul></div>
      <button class="btn block" data-action="build-practice" data-key="${esc(key)}" ${loading ? 'disabled' : ''}>${loading ? 'Ассистент разбирает…' : 'Разобрать реакцию'}</button>`;
    return openSheet(body);
  }
  const today = new Date().toDateString();
  const triedToday = p.tries.some((t) => new Date(t).toDateString() === today);
  const c = p.cycle || {};
  body += `<div class="card"><h3>Цикл</h3><div class="cycle">
      <div><span>Триггер</span>${esc(c.trigger)}</div><div class="arrow">↓</div>
      <div><span>Мысль</span>${esc(c.thought)}</div><div class="arrow">↓</div>
      <div><span>Эмоция</span>${esc(c.emotion)}</div><div class="arrow">↓</div>
      <div><span>Действие</span>${esc(c.action)}</div></div></div>
    <div class="card"><dl class="detail">
      <dt>Корень</dt><dd>${esc(p.root)}</dd>
      <dt>Старое убеждение</dt><dd class="quote">«${esc(p.oldBelief)}»</dd>
      <dt>Новая мысль</dt><dd class="quote">«${esc(p.newThought)}»</dd></dl></div>
    <div class="card"><h3>Практика</h3><ol class="steps">${p.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <button class="btn block ${triedToday ? 'soft' : ''}" data-action="tried" data-key="${esc(key)}" style="margin-top:8px">${triedToday ? '✓ Сегодня уже попробовала' : 'Попробовала сегодня'}</button>
      <div class="muted small" style="text-align:center;margin-top:8px">Применено ${p.tries.length} ${plural(p.tries.length, 'раз', 'раза', 'раз')}</div></div>
    <div class="card"><h3>Вопрос для размышления</h3><div>${esc(p.question)}</div></div>
    <div class="card"><h3>Поговорить об этой реакции</h3>
      <div class="mini-chat">${p.chat.map((m) => `<div class="bubble ${m.role === 'user' ? 'me' : 'ai'}">${esc(m.content)}</div>`).join('')}
      ${loading ? '<div class="bubble ai typing"><i></i><i></i><i></i></div>' : ''}</div>
      <form class="mini-composer" data-action="practice-chat" data-key="${esc(key)}">
        <input name="msg" placeholder="Напиши ассистенту…" autocomplete="off" ${loading ? 'disabled' : ''}>
        <button class="send-btn" type="submit" aria-label="Отправить" ${loading ? 'disabled' : ''}>${icon('up')}</button></form></div>
    <button class="btn light block" data-action="build-practice" data-key="${esc(key)}" ${loading ? 'disabled' : ''}>Обновить разбор</button>`;
  openSheet(body, { keepScroll: true });
}

/* ================= Лист ================= */

function openSheet(html, { keepScroll = false } = {}) {
  const wrap = $('#sheet-wrap');
  const body = $('#sheet');
  const scroll = body.scrollTop;
  body.innerHTML = html;
  hydrateIcons(body);
  wrap.hidden = false;
  body.scrollTop = keepScroll ? scroll : 0;
}
function closeSheet() {
  $('#sheet-wrap').hidden = true;
  $('#sheet').innerHTML = '';
}

function openSettings() {
  openSheet(`<div class="sheet-head"><h2>Настройки</h2><button class="link-btn" data-action="close-sheet">Готово</button></div>
    <div class="card"><h3>Ассистент</h3>
      <p class="sub" style="margin-top:0">Разбор рассказов делает Claude. Нужен личный ключ API с <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style="color:var(--accent)">console.anthropic.com</a>. Ключ хранится только на этом устройстве и отправляется напрямую в Anthropic.</p>
      <label class="field"><span>Ключ API</span><input id="set-key" type="password" autocomplete="off" placeholder="sk-ant-…" value="${esc(settings.apiKey)}"></label>
      <label class="field"><span>Модель</span><select id="set-model">${MODELS.map((m) => `<option value="${m.id}" ${m.id === settings.model ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
      <button class="btn block" data-action="save-settings">Сохранить</button></div>
    <div class="card"><h3>Мои данные</h3>
      <p class="sub" style="margin-top:0">Дневник хранится только в этом браузере — у каждого человека и устройства свой отдельный дневник. Записей: ${entries.length}.</p>
      <div class="btn-row"><button class="btn light" data-action="export">Экспорт</button><button class="btn danger" data-action="wipe">Удалить всё</button></div></div>
    <div class="card"><h3>О приложении</h3><p class="sub" style="margin:0">Дневник эмоций не заменяет психолога и не ставит диагнозов. Если тебе тяжело — обратись к специалисту или на линию психологической помощи.</p>
      <button class="btn light block" data-action="onboarding" style="margin-top:12px">Как пользоваться</button></div>`);
}

function openOnboarding() {
  openSheet(`<div class="sheet-head"><h2>Дневник эмоций</h2></div>
    <div class="card"><p style="margin-top:0"><b>Поделилась и забыла.</b> Отметь, как ты сейчас, на цветной палитре: вверх — больше энергии, вправо — приятнее. Пролистай полосу эмоций и выбери нужные.</p>
      <p>Хочется рассказать подробнее — нажми «Рассказать» и наговори как есть. Ассистент сам определит, что задело и какая потребность за этим стоит.</p>
      <p style="margin-bottom:0">Через несколько записей в «Инсайтах» появятся паттерны и практики для повторяющихся реакций.</p></div>
    <div class="card"><p class="sub" style="margin:0"><b>Важно:</b> приложение не заменяет психолога и не ставит диагнозов. Записи хранятся только на твоём устройстве.</p></div>
    <button class="btn block" data-action="onboarded">Понятно, начать</button>`);
}

function crisisCard() {
  return `<div class="crisis"><b>Ты не одна 💛</b>
    Похоже, сейчас очень тяжело. Пожалуйста, прямо сейчас свяжись с близким человеком или позвони на линию психологической помощи — там выслушают бесплатно.
    <ul>
      <li>Экстренная помощь: <a href="tel:112">112</a></li>
      <li>Россия, телефон доверия: <a href="tel:88002000122">8‑800‑2000‑122</a></li>
      <li>Москва, психологическая помощь: <a href="tel:051">051</a> (с мобильного <a href="tel:+74950510000">8‑495‑051</a>)</li>
      <li>Казахстан, телефон доверия: <a href="tel:150">150</a></li>
    </ul></div>`;
}

/* ================= Экран «Рассказать» ================= */

const talk = {
  stage: 'listen', // listen → thinking → review → done
  entry: null,
  first: null,
  chosen: null,
  confirm: null,
  showAll: false,
  error: '',
  seconds: 0,
};

function wave(n) {
  return `<span class="wave">${'<i></i>'.repeat(n)}</span>`;
}

function renderTalk() {
  const el = $('#talk');
  const s = talk.stage;
  const pop = talk.lastStage !== s ? " pop" : "";
  talk.lastStage = s;
  let html = `<div class="talk-inner"><div class="topbar">
    <button class="icon-btn" data-action="close-talk" aria-label="Закрыть"><span class="ti" data-icon="close"></span></button><span></span></div>`;

  if (s === 'listen' || s === 'thinking') {
    const ctx = pick.mood ? `<div class="context-chip"><span class="chip static">${hexIcon(moodColor(pick.mood), 16)}${esc(pick.emotions.length ? pick.emotions.join(', ') : moodWords(pick.mood))}</span></div>` : '';
    const busy = s === 'thinking';
    html += `<div class="hero-title"><h1>Расскажи, что происходит</h1><p>${busy ? 'Разбираю и фиксирую главное' : 'Я слушаю и зафиксирую главное'}</p></div>${ctx}
      <div class="rec ${recog ? 'on' : ''}" id="rec">${wave(9)}
        <button class="ring ${busy ? 'busy' : ''}" data-action="mic" aria-label="${recog ? 'Остановить запись' : 'Начать запись'}" ${busy ? 'disabled' : ''}>${busy ? '<span class="spin"></span>' : '<span class="ti" data-icon="mic"></span>'}</button>
        ${wave(9)}</div>
      <div class="timer" id="timer">${fmtTimer(talk.seconds)}</div>
      <div class="status" id="rec-status">${busy ? 'Думаю…' : recog ? 'Слушаю…' : SR ? 'Нажми на микрофон и говори' : 'Нажми 🎤 на клавиатуре, чтобы надиктовать'}</div>
      <textarea id="talk-text" class="text-area" placeholder="…или напиши текстом" ${busy ? 'disabled' : ''}>${esc(talk.entry?.text || '')}</textarea>
      <div class="talk-grow"></div>
      <button class="btn block" data-action="submit-talk" style="margin-top:16px" ${busy ? 'disabled' : ''}>Готово, разобрать</button>`;
  } else if (s === 'review') {
    const a = talk.first;
    const names = [a.emotion, ...a.secondary].filter(Boolean);
    const strongest = [...new Set([...names, ...(talk.entry.picked || [])])];
    html += `<div class="hero-title"><h1>Расскажи, что происходит</h1><p>Я услышала тебя</p></div>
      <div class="you-said">«${esc(talk.entry.text)}»</div>
      <div class="ai-q${pop}"><div class="q"><span class="av"><span class="ti" data-icon="spark"></span></span><span>Похоже, ты чувствуешь <b>${esc(names.join(', '))}</b>. Это так?</span></div>
        <div class="chips">${['Да', 'Скорее да', 'Не совсем', 'Другое'].map((o) => `<button class="chip ${talk.confirm === o ? 'on' : ''}" data-action="confirm" data-v="${o}">${o}</button>`).join('')}</div></div>
      <div class="ai-q${pop}"><div class="q"><span class="av"><span class="ti" data-icon="spark"></span></span><span>Что сильнее всего прямо сейчас?</span></div>
        ${talk.showAll
          ? `<div class="scroller">${emotionBar([talk.chosen], entryMood(talk.entry) || moodFromAnalysis(a), 'choose')}</div>`
          : `<div class="chips">${strongest.map((n) => `<button class="chip ${talk.chosen === n ? 'on' : ''}" data-action="choose" data-v="${esc(n)}"><span class="dot" style="--c:${emotionColor(n)}"></span>${esc(n)}</button>`).join('')}
             <button class="chip" data-action="show-all">Другое…</button></div>`}</div>
      ${a.question ? `<div class="ai-q${pop}"><div class="q"><span class="av"><span class="ti" data-icon="spark"></span></span><span>${esc(a.question)}</span></div>
        <input id="clarify" placeholder="Можно пропустить" autocomplete="off"></div>` : ''}
      <div class="talk-grow"></div>
      <button class="btn block" data-action="commit" style="margin-top:16px">Зафиксировать</button>`;
  } else if (s === 'done') {
    const e = talk.entry;
    const a = e.analysis;
    const mood = entryMood(e);
    html += `<div class="done-check"><span class="ti" data-icon="check"></span></div>
      <div class="hero-title" style="margin-top:0"><h1 style="font-size:22px">Состояние зафиксировано</h1><p>${timeOf(e.createdAt)}</p></div>
      ${a?.risk || CRISIS_RE.test(e.text) ? crisisCard() : ''}
      ${mood ? `<div class="card"><div class="point-head">${hexIcon(moodColor(mood), 26)}Твоя точка на палитре</div>${paletteBlock({ mini: true, points: [mood] })}</div>` : ''}
      ${a ? `<div class="card">
          ${a.reflection ? `<p class="reflection">${esc(a.reflection)}</p>` : ''}
          <dl class="kv"><dt>Эмоции</dt><dd>${esc([a.emotion, ...a.secondary].join(', '))}</dd><dt>Сила</dt><dd>${a.intensity} из 10</dd>
          ${a.trigger ? `<dt>Что задело</dt><dd>${esc(a.trigger)}</dd>` : ''}${a.need ? `<dt>Потребность</dt><dd>${esc(a.need)}</dd>` : ''}
          ${a.root ? `<dt>Возможно</dt><dd>${esc(a.root)}</dd>` : ''}</dl></div>` : ''}
      ${talk.error ? `<div class="card"><div class="sub">Запись сохранена. ${esc(talk.error)} Разобрать можно позже в «Истории».</div></div>` : ''}
      <div class="card"><h3>Метки</h3><div class="chips">${tagBar(e.tags || [], 'entry-tag').replace(/class="scroller"/g, '')}</div></div>
      <div class="talk-grow"></div>
      <button class="btn block" data-action="close-talk">Готово</button>
      <button class="btn light block" data-action="talk-new" style="margin-top:10px">Ещё момент</button>`;
  }
  html += '</div>';
  el.innerHTML = html;
  hydrateIcons(el);
}

const fmtTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function openTalk() {
  stopVoice();
  Object.assign(talk, { stage: 'listen', entry: null, first: null, chosen: null, confirm: null, showAll: false, error: '', seconds: 0 });
  $('#talk').hidden = false;
  document.body.style.overflow = 'hidden';
  renderTalk();
}
function closeTalk() {
  stopVoice();
  $('#talk').hidden = true;
  document.body.style.overflow = '';
  render();
}

function persistEntry(entry) {
  const i = entries.findIndex((e) => e.id === entry.id);
  if (i >= 0) entries[i] = entry;
  else entries.unshift(entry);
  saveEntries();
}

function resetPick() {
  pick.mood = null;
  pick.emotions = [];
  pick.tags = [];
}

async function submitTalk() {
  const text = ($('#talk-text')?.value || '').trim();
  stopVoice();
  if (!text) return toast('Расскажи хоть одной фразой');
  const entry = {
    id: uid(), createdAt: Date.now(), text, clarify: null, analysis: null,
    mood: pick.mood ? { ...pick.mood } : null, picked: [...pick.emotions], tags: [...pick.tags],
  };
  resetPick();
  talk.entry = entry;
  persistEntry(entry); // сохраняем сразу, чтобы рассказ не потерялся
  talk.stage = 'thinking';
  renderTalk();
  try {
    const a = await analyzeEntry(entry, { allowQuestion: true });
    talk.first = a;
    talk.chosen = entry.picked[0] || a.emotion;
    entry.analysis = Object.assign({}, a, { question: '' });
    persistEntry(entry);
    if (a.risk) return finishTalk(a);
    talk.stage = 'review';
    renderTalk();
  } catch (e) {
    talk.error = describeError(e);
    if (entry.mood) {
      entry.analysis = manualAnalysis({ mood: entry.mood, picked: entry.picked, tags: entry.tags });
      persistEntry(entry);
    }
    talk.stage = 'done';
    renderTalk();
  }
}

async function commitTalk() {
  const entry = talk.entry;
  let a = talk.first;
  const answer = ($('#clarify')?.value || '').trim();
  if (a.question && answer) {
    entry.clarify = { q: a.question, a: answer };
    persistEntry(entry);
    talk.stage = 'thinking';
    renderTalk();
    try {
      a = await analyzeEntry(entry, { allowQuestion: false });
    } catch (e) {
      /* остаётся первичный разбор */
    }
  }
  finishTalk(a);
}

function finishTalk(a) {
  const entry = talk.entry;
  const out = Object.assign({}, a, { question: '' });
  const chosen = talk.chosen;
  if (chosen && chosen !== out.emotion) {
    out.secondary = [out.emotion, ...out.secondary.filter((s) => s !== chosen)].slice(0, 2);
    out.emotion = chosen;
    if (EMO_MAP[chosen]) out.family = EMO_MAP[chosen].family;
  }
  entry.analysis = out;
  if (!entry.mood) entry.mood = moodFromAnalysis(out);
  if (!entry.tags?.length && out.category !== 'другое') entry.tags = [out.category];
  persistEntry(entry);
  talk.stage = 'done';
  renderTalk();
}

function quickSave() {
  if (!pick.mood) {
    toast('Сначала отметь точку на палитре');
    return;
  }
  const entry = {
    id: uid(), createdAt: Date.now(), text: '', clarify: null,
    mood: { ...pick.mood }, picked: [...pick.emotions], tags: [...pick.tags],
  };
  entry.analysis = manualAnalysis(entry);
  persistEntry(entry);
  resetPick();
  Object.assign(talk, { stage: 'done', entry, first: null, error: '' });
  $('#talk').hidden = false;
  document.body.style.overflow = 'hidden';
  renderTalk();
}

/* ---------- Голос ---------- */

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null;
let voiceBase = '';
let timerId = null;

function toggleVoice() {
  if (recog) return stopVoice();
  const ta = $('#talk-text');
  if (!SR) {
    ta?.focus();
    toast('Нажми 🎤 на клавиатуре телефона, чтобы надиктовать');
    return;
  }
  try {
    recog = new SR();
  } catch (e) {
    toast('Голосовой ввод недоступен');
    return;
  }
  recog.lang = 'ru-RU';
  recog.interimResults = true;
  recog.continuous = true;
  voiceBase = ta.value ? ta.value.trim() + ' ' : '';
  recog.onresult = (ev) => {
    let text = '';
    for (let i = 0; i < ev.results.length; i++) text += ev.results[i][0].transcript;
    const t = $('#talk-text');
    if (t) t.value = voiceBase + text;
  };
  recog.onerror = (ev) => {
    if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') toast('Нет доступа к микрофону — можно надиктовать с клавиатуры');
    stopVoice();
  };
  recog.onend = () => stopVoice();
  try {
    recog.start();
  } catch (e) {
    recog = null;
    return;
  }
  talk.seconds = 0;
  timerId = setInterval(() => {
    talk.seconds++;
    const t = $('#timer');
    if (t) t.textContent = fmtTimer(talk.seconds);
  }, 1000);
  setRecUI(true);
}
function stopVoice() {
  if (recog) {
    const r = recog;
    recog = null;
    try { r.stop(); } catch (e) { /* уже остановлен */ }
  }
  clearInterval(timerId);
  timerId = null;
  setRecUI(false);
}
function setRecUI(on) {
  $('#rec')?.classList.toggle('on', on);
  const st = $('#rec-status');
  if (st && talk.stage === 'listen') st.textContent = on ? 'Слушаю…' : SR ? 'Нажми на микрофон и говори' : 'Нажми 🎤 на клавиатуре, чтобы надиктовать';
}

/* ================= Действия ================= */

async function withBusy(btn, label, fn) {
  const old = btn?.textContent;
  if (btn) { btn.disabled = true; btn.textContent = label; }
  try {
    await fn();
  } catch (e) {
    toast(describeError(e));
    if (btn) { btn.disabled = false; btn.textContent = old; }
  }
}

function toggleIn(list, v, max = 99) {
  const i = list.indexOf(v);
  if (i >= 0) list.splice(i, 1);
  else if (list.length < max) list.push(v);
  else toast(`Можно выбрать до ${max}`);
}

const actions = {
  talk: openTalk,
  'talk-new': openTalk,
  'close-talk': closeTalk,
  mic: toggleVoice,
  'submit-talk': submitTalk,
  commit: commitTalk,
  confirm(el) {
    talk.confirm = el.dataset.v;
    if (talk.confirm === 'Не совсем' || talk.confirm === 'Другое') talk.showAll = true;
    renderTalk();
  },
  choose(el) {
    talk.chosen = el.dataset.v;
    const scroll = $('#talk .scroller')?.scrollLeft || 0;
    renderTalk();
    const sc = $('#talk .scroller');
    if (sc) sc.scrollLeft = scroll;
  },
  'show-all'() {
    talk.showAll = true;
    renderTalk();
  },
  'quick-save': quickSave,
  'pick-emotion'(el) {
    toggleIn(pick.emotions, el.dataset.v, 3);
    if (!pick.mood && EMO_MAP[pick.emotions[0]]) {
      const c = nearestCell(EMO_MAP[pick.emotions[0]]);
      pick.mood = { x: c.x, y: c.y };
    }
    const scroll = $('#emo-bar').scrollLeft;
    updatePickUI();
    $('#emo-bar').scrollLeft = scroll;
  },
  'pick-tag'(el) {
    toggleIn(pick.tags, el.dataset.v);
    const bar = $('#tag-bar');
    const scroll = bar.scrollLeft;
    bar.innerHTML = tagBar(pick.tags, 'pick-tag');
    bar.scrollLeft = scroll;
  },
  'entry-tag'(el) {
    const e = talk.entry;
    e.tags = e.tags || [];
    toggleIn(e.tags, el.dataset.v);
    persistEntry(e);
    renderTalk();
  },
  'add-tag'(el) {
    const name = (prompt('Новая метка') || '').trim().toLowerCase().slice(0, 24);
    if (!name) return;
    if (!allTags().includes(name)) {
      settings.customTags.push(name);
      saveSettings();
    }
    if (el.dataset.target === 'entry-tag') {
      const e = talk.entry;
      e.tags = [...new Set([...(e.tags || []), name])];
      persistEntry(e);
      renderTalk();
    } else {
      if (!pick.tags.includes(name)) pick.tags.push(name);
      $('#tag-bar').innerHTML = tagBar(pick.tags, 'pick-tag');
    }
  },
  settings: openSettings,
  'close-sheet': closeSheet,
  onboarding: openOnboarding,
  onboarded() {
    settings.onboarded = true;
    saveSettings();
    closeSheet();
  },
  'pick-day'(el) {
    historyDay = el.dataset.day;
    const strip = $('.days');
    const scroll = strip.scrollLeft;
    render();
    $('.days').scrollLeft = scroll;
  },
  'insights-mode'(el) {
    insightsMode = el.dataset.v;
    render();
  },
  'open-entry': (el) => openEntry(el.dataset.id),
  'delete-entry'(el) {
    if (!confirm('Удалить эту запись? Это действие нельзя отменить.')) return;
    entries = entries.filter((e) => e.id !== el.dataset.id);
    saveEntries();
    closeSheet();
    render();
    toast('Запись удалена');
  },
  reanalyze(el) {
    const entry = entries.find((e) => e.id === el.dataset.id);
    if (!entry) return;
    withBusy(el, 'Ассистент разбирает…', async () => {
      entry.analysis = Object.assign(await analyzeEntry(entry, { allowQuestion: false }), { question: '' });
      saveEntries();
      render();
      openEntry(entry.id);
    });
  },
  'build-profile'(el) {
    withBusy(el, 'Ассистент смотрит записи…', async () => {
      await buildProfile();
      render();
    });
  },
  'open-practice': (el) => openPractice(el.dataset.key),
  'build-practice'(el) {
    const key = el.dataset.key;
    const group = recurringGroups().find((g) => g.key === key);
    if (!group) return;
    openPractice(key, { loading: true });
    buildPractice(group)
      .catch((e) => toast(describeError(e)))
      .finally(() => { if (!$('#sheet-wrap').hidden) openPractice(key); render(); });
  },
  tried(el) {
    const p = practices[el.dataset.key];
    if (!p) return;
    const today = new Date().toDateString();
    if (p.tries.some((t) => new Date(t).toDateString() === today)) return toast('Уже отмечено сегодня');
    p.tries.push(Date.now());
    savePractices();
    openPractice(el.dataset.key);
    render();
    toast('Отлично! Отмечено 🌱');
  },
  'save-settings'() {
    settings.apiKey = $('#set-key').value.trim();
    settings.model = $('#set-model').value;
    saveSettings();
    closeSheet();
    render();
    toast(settings.apiKey ? 'Ассистент подключён' : 'Сохранено');
  },
  export() {
    const data = { exportedAt: new Date().toISOString(), entries, profile, practices };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `дневник-эмоций-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  wipe() {
    if (!confirm('Удалить все записи, профиль и практики с этого устройства? Это нельзя отменить.')) return;
    entries = []; profile = null; practices = {};
    saveEntries(); store.set('profile', null); savePractices();
    closeSheet();
    render();
    toast('Дневник очищен');
  },
};

document.addEventListener('click', (ev) => {
  const tabBtn = ev.target.closest('.tab[data-tab]');
  if (tabBtn) return setTab(tabBtn.dataset.tab);
  const el = ev.target.closest('[data-action]');
  if (!el || el.tagName === 'FORM') return;
  const fn = actions[el.dataset.action];
  if (fn) {
    ev.preventDefault();
    fn(el);
  }
});

document.addEventListener('submit', (ev) => {
  const form = ev.target;
  if (form.dataset.action !== 'practice-chat') return;
  ev.preventDefault();
  const key = form.dataset.key;
  const msg = form.msg.value.trim();
  const group = recurringGroups().find((g) => g.key === key);
  if (!msg || !group || !practices[key]) return;
  practices[key].chat.push({ role: 'user', content: msg });
  openPractice(key, { loading: true });
  practices[key].chat.pop(); // practiceReply добавит сообщение сам
  practiceReply(group, msg)
    .catch((e) => toast(describeError(e)))
    .finally(() => { if (!$('#sheet-wrap').hidden) openPractice(key); });
});

document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if (!$('#sheet-wrap').hidden) closeSheet();
  else if (!$('#talk').hidden) closeTalk();
});

/* ================= Старт ================= */

hydrateIcons();
setTab('today');
if (!settings.onboarded) openOnboarding();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
