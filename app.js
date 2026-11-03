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
const MODELS = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5 (по умолчанию)' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5 (быстрее)' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5 (самый быстрый)' },
];
const MIN_FOR_PATTERNS = 3;
const CRISIS_RE = /(поконч\S* с собой|не хочу жить|не хочется жить|убить себя|убью себя|суицид|самоубий|поре?зать себя|причинить себе вред|навредить себе|хочу умереть|лучше бы меня не было|нет смысла жить|жить незачем|уйти из жизни)/i;

const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
  book: '<path d="M5 4.5h10.5a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z"/><path d="M5 16.5a3 3 0 0 1 3-3h10.5"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>',
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M21 20H3"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19 13 11"/>',
  up: '<path d="M12 19V5"/><path d="m5.5 11.5 6.5-6.5 6.5 6.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
  chev: '<path d="m9 5 7 7-7 7"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/>',
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
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
let settings = Object.assign({ apiKey: '', model: MODELS[0].id, onboarded: false }, store.get('settings', {}));

const saveEntries = () => store.set('entries', entries);
const savePractices = () => store.set('practices', practices);
const saveSettings = () => store.set('settings', settings);

/* ================= Утилиты ================= */

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const fam = (a) => FAMILIES[a?.family] || null;
const famColor = (a) => fam(a)?.color || 'var(--none)';
const analyzed = () => entries.filter((e) => e.analysis);
const isNeg = (a) => a && (a.valence === 'negative' || a.valence === 'mixed');
const isPos = (a) => a && a.valence === 'positive';

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function dayLabel(ts) {
  const now = new Date();
  if (dayKey(ts) === dayKey(now)) return 'Сегодня';
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (dayKey(ts) === dayKey(y)) return 'Вчера';
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' });
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
    const msg = data?.error?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
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
  out.intensity = Math.min(10, Math.max(1, Math.round(Number(out.intensity) || 5)));
  if (!CATEGORIES.includes(out.category)) out.category = 'другое';
  out.secondary = Array.isArray(out.secondary) ? out.secondary.slice(0, 2) : [];
  out.question = typeof out.question === 'string' ? out.question.trim() : '';
  out.risk = Boolean(out.risk);
  for (const k of ['emotion', 'title', 'trigger', 'thought', 'body', 'need', 'root', 'reflection']) out[k] = String(out[k] || '').trim();
  if (!out.title) out.title = 'Момент';
  return out;
}

async function analyzeEntry(entry, { allowQuestion }) {
  let content = `Рассказ: ${entry.text}`;
  if (entry.clarify) content += `\n\nУточняющий вопрос: ${entry.clarify.q}\nОтвет: ${entry.clarify.a}`;
  if (!allowQuestion) content += '\n\nУточняющий вопрос больше не задавай: поле question должно быть пустым.';
  const text = await callClaude({ system: ANALYSIS_SYSTEM, messages: [{ role: 'user', content }] });
  const a = normalizeAnalysis(parseJSON(text));
  if (!allowQuestion) a.question = '';
  if (CRISIS_RE.test(entry.text + ' ' + (entry.clarify?.a || ''))) a.risk = true;
  return a;
}

function entriesDigest(list) {
  return list.map((e) => {
    const a = e.analysis;
    const when = new Date(e.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    return `- [${when}] «${a.title}»: ${a.emotion} (${a.valence}, сила ${a.intensity}), тема: ${a.category}, триггер: ${a.trigger}, мысль: ${a.thought}, потребность: ${a.need}. Рассказ: ${e.text}`;
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

let tab = 'state';
let historyFilter = 'all';

function setTab(next) {
  tab = next;
  document.querySelectorAll('.tab[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  render();
  window.scrollTo(0, 0);
}

function render() {
  const view = $('#view');
  view.innerHTML = { state: viewState, history: viewHistory, patterns: viewPatterns, work: viewWork }[tab]();
  hydrateIcons(view);
}

function pageHead(title, date) {
  return `<header class="page-head">
    <div>${date ? `<div class="date">${esc(date)}</div>` : ''}<h1>${esc(title)}</h1></div>
    <button class="icon-btn" data-action="settings" aria-label="Настройки"><span class="ti" data-icon="gear"></span></button>
  </header>`;
}

function keyBanner() {
  if (settings.apiKey) return '';
  return `<button class="banner" data-action="settings"><span class="ti" data-icon="key"></span><span>Подключите ассистента, чтобы записи разбирались автоматически. Без него записи всё равно сохраняются.</span></button>`;
}

/* ---------- Состояние ---------- */

function viewState() {
  const today = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const todays = entries.filter((e) => dayKey(e.createdAt) === dayKey(Date.now()));
  const last = entries[0];
  const chips = todays.length
    ? `<div class="chips">${todays.map((e) => e.analysis
        ? `<span class="chip tinted" style="--c:${famColor(e.analysis)}"><span class="dot"></span>${esc(e.analysis.emotion)}</span>`
        : '<span class="chip">без разбора</span>').join('')}</div>`
    : '<div class="sub">Сегодня пока ничего не записано.</div>';

  return `${pageHead('Моё состояние', today)}
    ${keyBanner()}
    <button class="hero" data-action="talk">
      <span class="mic-circle"><span class="ti" data-icon="mic"></span></span>
      <span><b>Что сейчас случилось?</b><small>Расскажите голосом или текстом — разберу за вас</small></span>
    </button>
    <div class="card"><h3>Сегодня</h3>${chips}</div>
    <div class="card week"><h3>Настроение за неделю</h3>${weekChart()}
      <div class="legend"><span>↑ приятные моменты</span><span>↓ тяжёлые моменты</span></div></div>
    <div class="card"><h3>Замечено</h3><div class="insight"><span class="ti" data-icon="spark"></span><div>${esc(insight())}</div></div></div>
    ${last ? `<div class="section-title">Последняя запись</div><div class="list">${entryRow(last)}</div>` : ''}`;
}

function weekChart() {
  const W = 320, H = 170, mid = 80, maxBar = 62, colW = W / 7;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    days.push(d);
  }
  const data = days.map((d) => {
    const list = analyzed().filter((e) => dayKey(e.createdAt) === dayKey(d));
    const pos = list.filter((e) => isPos(e.analysis));
    const neg = list.filter((e) => isNeg(e.analysis));
    const sum = (l) => l.reduce((s, e) => s + e.analysis.intensity, 0);
    const dom = (l) => {
      const top = countBy(l, (e) => e.analysis.family)[0];
      return top ? FAMILIES[top[0]].color : 'var(--none)';
    };
    return { d, pos: sum(pos), neg: sum(neg), posC: dom(pos), negC: dom(neg) };
  });
  const max = Math.max(10, ...data.map((x) => Math.max(x.pos, x.neg)));
  const wd = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  let bars = '';
  data.forEach((x, i) => {
    const cx = i * colW + colW / 2, bw = 18;
    const ph = (x.pos / max) * maxBar, nh = (x.neg / max) * maxBar;
    if (ph) bars += `<rect x="${cx - bw / 2}" y="${mid - ph}" width="${bw}" height="${ph}" rx="5" fill="${x.posC}"/>`;
    if (nh) bars += `<rect x="${cx - bw / 2}" y="${mid + 1}" width="${bw}" height="${nh}" rx="5" fill="${x.negC}"/>`;
    if (!ph && !nh) bars += `<circle cx="${cx}" cy="${mid}" r="2.5" fill="var(--text-3)"/>`;
    const isToday = i === 6;
    bars += `<text x="${cx}" y="${H - 6}" text-anchor="middle" font-size="12" fill="${isToday ? 'var(--accent)' : 'var(--text-2)'}" font-weight="${isToday ? 700 : 500}">${wd[x.d.getDay()]}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Настроение за последние 7 дней">
    <line x1="0" y1="${mid}" x2="${W}" y2="${mid}" stroke="var(--sep)" stroke-width="1"/>${bars}</svg>`;
}

function insight() {
  const list = analyzed();
  if (list.length < 2) return 'Пока мало записей — наблюдения появятся после нескольких моментов.';
  const neg = list.filter((e) => isNeg(e.analysis));
  const pos = list.filter((e) => isPos(e.analysis));
  const topNeg = countBy(neg, (e) => e.analysis.category)[0];
  const topPos = countBy(pos, (e) => e.analysis.category)[0];
  if (topNeg && topNeg[1] >= 2) return `Настроение чаще всего портят ситуации из темы «${topNeg[0]}».`;
  if (topPos && topPos[1] >= 2) return `Радость чаще всего приносит тема «${topPos[0]}».`;
  const topNeed = countBy(neg, (e) => e.analysis.need.toLowerCase())[0];
  if (topNeed) return `В тяжёлых моментах чаще всего задета потребность «${topNeed[0]}».`;
  return `Приятных моментов: ${pos.length}, тяжёлых: ${neg.length}.`;
}

/* ---------- История ---------- */

function entryRow(e) {
  const a = e.analysis;
  const title = a ? a.title : e.text.slice(0, 60);
  const sub = a ? `${a.emotion} · ${a.trigger}` : 'Без разбора';
  return `<button class="row" data-action="open-entry" data-id="${e.id}">
    <span class="intensity" style="--c:${famColor(a)}">${a ? a.intensity : '?'}</span>
    <span class="row-main"><span class="row-title">${esc(title)}</span><span class="row-sub">${esc(sub)}</span></span>
    <span class="row-time">${timeOf(e.createdAt)}</span>
  </button>`;
}

function viewHistory() {
  if (!entries.length) {
    return `${pageHead('Моя история')}<div class="empty"><div class="big">📖</div>Здесь появятся ваши моменты.<br><br><button class="btn" data-action="talk">Рассказать первый</button></div>`;
  }
  const present = new Set(analyzed().map((e) => e.analysis.family));
  const filters = ['all', ...Object.keys(FAMILIES).filter((f) => present.has(f))];
  if (entries.some((e) => !e.analysis)) filters.push('none');
  const label = (f) => (f === 'all' ? 'Все' : f === 'none' ? 'Без разбора' : FAMILIES[f].name);
  const filtered = entries.filter((e) => historyFilter === 'all' || (historyFilter === 'none' ? !e.analysis : e.analysis?.family === historyFilter));

  let html = '';
  let currentDay = null;
  for (const e of filtered) {
    const k = dayKey(e.createdAt);
    if (k !== currentDay) {
      if (currentDay) html += '</div>';
      html += `<div class="section-title">${esc(dayLabel(e.createdAt))}</div><div class="list">`;
      currentDay = k;
    }
    html += entryRow(e);
  }
  if (currentDay) html += '</div>';
  if (!filtered.length) html = '<div class="empty">Нет записей с этим фильтром.</div>';

  return `${pageHead('Моя история')}
    <div class="filters">${filters.map((f) => `<button class="filter ${historyFilter === f ? 'active' : ''}" data-action="filter" data-f="${f}">${esc(label(f))}</button>`).join('')}</div>
    ${html}`;
}

function openEntry(id) {
  const e = entries.find((x) => x.id === id);
  if (!e) return;
  const a = e.analysis;
  const when = new Date(e.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  const row = (label, val) => (val ? `<dt>${label}</dt><dd>${esc(val)}</dd>` : '');
  let body = `<div class="sheet-head"><h2>${esc(a ? a.title : 'Запись')}</h2><button class="link-btn" data-action="close-sheet">Готово</button></div>
    <div class="muted small" style="margin:-8px 0 12px">${esc(when)}</div>`;
  if (a) {
    body += `<div class="card" style="border-left:5px solid ${famColor(a)}">
      <div class="chips" style="margin-bottom:6px"><span class="chip tinted" style="--c:${famColor(a)}"><span class="dot"></span>${esc(a.emotion)} · ${a.intensity}/10</span>
      ${a.secondary.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
      ${a.reflection ? `<div class="sub">${esc(a.reflection)}</div>` : ''}</div>`;
  }
  body += `<div class="card"><dl class="detail">
    ${row('Рассказ', e.text)}
    ${e.clarify ? row('Уточнение', `${e.clarify.q} — ${e.clarify.a}`) : ''}
    ${a ? `${row('Триггер', a.trigger)}${row('Тема', a.category)}${row('Мысль', a.thought ? `«${a.thought}»` : '')}${row('В теле', a.body)}${row('Потребность', a.need)}${row('Возможный корень', a.root)}` : ''}
  </dl></div>`;
  if (a?.risk) body += crisisCard();
  if (!a) body += `<button class="btn block" data-action="reanalyze" data-id="${e.id}" style="margin-bottom:10px">Разобрать сейчас</button>`;
  body += `<button class="btn danger block" data-action="delete-entry" data-id="${e.id}">Удалить запись</button>`;
  openSheet(body);
}

/* ---------- Паттерны ---------- */

function viewPatterns() {
  const list = analyzed();
  if (list.length < MIN_FOR_PATTERNS) {
    const left = MIN_FOR_PATTERNS - list.length;
    return `${pageHead('Мои паттерны')}${keyBanner()}<div class="empty"><div class="big">🧭</div>
      Профиль появится после ${MIN_FOR_PATTERNS} разобранных записей.<br>Осталось ещё ${left} ${plural(left, 'момент', 'момента', 'моментов')}.</div>`;
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
    : '<div class="sub">Пока нет данных.</div>';

  const joys = pos.length
    ? `<div class="list" style="box-shadow:none;margin:0">${pos.slice(0, 6).map((e) => `<button class="row" data-action="open-entry" data-id="${e.id}" style="padding-left:0;padding-right:0">
        <span class="intensity" style="--c:${famColor(e.analysis)}">${e.analysis.intensity}</span>
        <span class="row-main"><span class="row-title">${esc(e.analysis.title)}</span><span class="row-sub">${esc(e.analysis.need)}</span></span></button>`).join('')}</div>`
    : '<div class="sub">Запишите приятный момент — здесь будет видно, что вас поднимает.</div>';

  const slots = [['Утро', 5, 12], ['День', 12, 17], ['Вечер', 17, 23], ['Ночь', 23, 5]];
  const inSlot = (h, [, from, to]) => (from < to ? h >= from && h < to : h >= from || h < to);
  const times = slots.map((s) => {
    const l = list.filter((e) => inSlot(new Date(e.createdAt).getHours(), s));
    const share = l.length ? Math.round((l.filter((e) => isNeg(e.analysis)).length / l.length) * 100) : 0;
    return `<div class="time-cell"><b>${l.length}</b><span>${s[0]}</span>${l.length ? `<i>${share}% тяжёлых</i>` : '<i style="color:var(--text-3)">—</i>'}</div>`;
  }).join('');

  return `${pageHead('Мои паттерны')}
    <div class="card"><h3>Какие эмоции чаще</h3>${famBars}
      <div class="ratio"><span style="width:${posShare}%;background:var(--calm)"></span><span style="width:${negShare}%;background:var(--anger)"></span></div>
      <div class="legend"><span>приятные ${posShare}%</span><span>тяжёлые ${negShare}%</span></div>
      <div class="stats"><div class="stat"><b>${list.length}</b><span>${plural(list.length, 'запись', 'записи', 'записей')}</span></div>
        <div class="stat"><b>${avg}</b><span>средняя сила</span></div>
        <div class="stat"><b>${pos.length}:${neg.length}</b><span>приятные : тяжёлые</span></div></div></div>
    <div class="card"><h3>Что расстраивает</h3>${cats}</div>
    <div class="card"><h3>Корни</h3><div class="sub" style="margin:-4px 0 10px">Какие потребности задеты чаще всего</div>${roots}</div>
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
    <button class="btn secondary block" data-action="build-profile">Обновить</button>`;
}

/* ---------- Работа ---------- */

function viewWork() {
  const groups = recurringGroups();
  if (!groups.length) {
    return `${pageHead('Моя трансформация')}${keyBanner()}<div class="empty"><div class="big">🌱</div>
      Здесь появятся повторяющиеся реакции — когда тяжёлый момент в одной теме случится хотя бы дважды.</div>`;
  }
  const rows = groups.map((g) => {
    const p = practices[g.key];
    const top = countBy(g.list, (e) => e.analysis.emotion)[0][0];
    const topFam = countBy(g.list, (e) => e.analysis.family)[0][0];
    const sub = p ? `${p.name} · применено ${p.tries.length} ${plural(p.tries.length, 'раз', 'раза', 'раз')}` : `чаще всего: ${top}`;
    return `<button class="row" data-action="open-practice" data-key="${esc(g.key)}">
      <span class="intensity" style="--c:${FAMILIES[topFam].color}">${g.list.length}</span>
      <span class="row-main"><span class="row-title">Тема «${esc(g.category)}»</span><span class="row-sub">${esc(sub)}</span></span>
      <span class="chev">${icon('chev')}</span></button>`;
  }).join('');
  return `${pageHead('Моя трансформация')}
    <div class="sub" style="margin:0 4px 12px">Повторяющиеся тяжёлые реакции. Выберите одну — ассистент разберёт цикл и предложит практику.</div>
    <div class="list">${rows}</div>`;
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
      <button class="btn block ${triedToday ? 'secondary' : ''}" data-action="tried" data-key="${esc(key)}">${triedToday ? '✓ Сегодня уже попробовала' : 'Попробовала сегодня'}</button>
      <div class="muted small" style="text-align:center;margin-top:8px">Применено ${p.tries.length} ${plural(p.tries.length, 'раз', 'раза', 'раз')}</div></div>
    <div class="card"><h3>Вопрос для размышления</h3><div>${esc(p.question)}</div></div>
    <div class="card"><h3>Поговорить об этой реакции</h3>
      <div class="mini-chat">${p.chat.map((m) => `<div class="bubble ${m.role === 'user' ? 'me' : 'ai'}">${esc(m.content)}</div>`).join('')}
      ${loading ? '<div class="bubble ai typing"><i></i><i></i><i></i></div>' : ''}</div>
      <form class="mini-composer" data-action="practice-chat" data-key="${esc(key)}">
        <input name="msg" placeholder="Напишите ассистенту…" autocomplete="off" ${loading ? 'disabled' : ''}>
        <button class="send-btn" type="submit" aria-label="Отправить" ${loading ? 'disabled' : ''}>${icon('up')}</button></form></div>
    <button class="btn ghost block" data-action="build-practice" data-key="${esc(key)}" ${loading ? 'disabled' : ''}>Обновить разбор</button>`;
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
      <p class="sub" style="margin-top:0">Разбор записей делает Claude. Нужен личный ключ API с <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style="color:var(--accent)">console.anthropic.com</a>. Ключ хранится только на этом устройстве и отправляется напрямую в Anthropic.</p>
      <label class="field"><span>Ключ API</span><input id="set-key" type="password" autocomplete="off" placeholder="sk-ant-…" value="${esc(settings.apiKey)}"></label>
      <label class="field"><span>Модель</span><select id="set-model">${MODELS.map((m) => `<option value="${m.id}" ${m.id === settings.model ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
      <button class="btn block" data-action="save-settings">Сохранить</button></div>
    <div class="card"><h3>Мои данные</h3>
      <p class="sub" style="margin-top:0">Дневник хранится только в этом браузере — у каждого человека и устройства свой отдельный дневник. Записей: ${entries.length}.</p>
      <div class="btn-row"><button class="btn ghost" data-action="export">Экспорт</button><button class="btn danger" data-action="wipe">Удалить всё</button></div></div>
    <div class="card"><h3>О приложении</h3><p class="sub" style="margin:0">Дневник эмоций не заменяет психолога и не ставит диагнозов. Если вам тяжело — обратитесь к специалисту или на линию психологической помощи.</p>
      <button class="btn ghost block" data-action="onboarding" style="margin-top:12px">Как пользоваться</button></div>`);
}

function openOnboarding() {
  openSheet(`<div class="sheet-head"><h2>Дневник эмоций</h2></div>
    <div class="card"><p style="margin-top:0"><b>Поделилась и забыла.</b> Когда что-то задело или порадовало — нажмите центральную кнопку и расскажите как есть, хоть одной фразой. Голосом или текстом.</p>
      <p>Ассистент сам определит эмоцию, что её запустило и какая потребность задета. Иногда задаст один вопрос — его можно пропустить.</p>
      <p style="margin-bottom:0">Через несколько записей в «Паттернах» появится ваш эмоциональный профиль, а в «Работе» — практики для повторяющихся реакций.</p></div>
    <div class="card"><p class="sub" style="margin:0"><b>Важно:</b> приложение не заменяет психолога и не ставит диагнозов. Записи хранятся только на вашем устройстве.</p></div>
    <button class="btn block" data-action="onboarded">Понятно, начать</button>`);
}

function crisisCard() {
  return `<div class="crisis"><b>Вы не одни 💛</b>
    Похоже, сейчас очень тяжело. Пожалуйста, прямо сейчас свяжитесь с близким человеком или позвоните на линию психологической помощи — там выслушают бесплатно.
    <ul>
      <li>Экстренная помощь: <a href="tel:112">112</a></li>
      <li>Россия, телефон доверия: <a href="tel:88002000122">8‑800‑2000‑122</a></li>
      <li>Москва, психологическая помощь: <a href="tel:051">051</a> (с мобильного <a href="tel:+74950510000">8‑495‑051</a>)</li>
      <li>Казахстан, телефон доверия: <a href="tel:150">150</a></li>
    </ul></div>`;
}

/* ================= Ассистент (запись момента) ================= */

const talk = { stage: 'input', entry: null, first: null };
const chat = () => $('#chat');

function bubble(text, who = 'ai') {
  const b = document.createElement('div');
  b.className = `bubble ${who}`;
  b.textContent = text;
  chat().appendChild(b);
  scrollChat();
  return b;
}
function appendHTML(html) {
  chat().insertAdjacentHTML('beforeend', html);
  scrollChat();
}
function typing(on) {
  chat().querySelector('.typing')?.remove();
  if (on) appendHTML('<div class="bubble ai typing"><i></i><i></i><i></i></div>');
}
function scrollChat() {
  requestAnimationFrame(() => (chat().scrollTop = chat().scrollHeight));
}
function setActions(html) {
  $('#talk-actions').innerHTML = html;
}
function showComposer(show, placeholder) {
  $('#composer').hidden = !show;
  if (placeholder) $('#input').placeholder = placeholder;
  if (show) setTimeout(() => $('#input').focus(), 50);
}

function openTalk() {
  stopVoice();
  talk.stage = 'input';
  talk.entry = null;
  talk.first = null;
  chat().innerHTML = '';
  setActions('');
  $('#talk').hidden = false;
  document.body.style.overflow = 'hidden';
  bubble('Что произошло? Расскажите как есть, хоть одной фразой.');
  showComposer(true, 'Расскажите, что случилось…');
}
function closeTalk() {
  stopVoice();
  $('#talk').hidden = true;
  document.body.style.overflow = '';
  render();
}

function resultCard(a) {
  return `<div class="result" style="--c:${famColor(a)}">
    <div class="head"><span class="intensity" style="--c:${famColor(a)}">${a.intensity}</span><div><b>${esc(a.emotion)}</b><div class="muted small">${esc(a.title)}</div></div></div>
    <dl class="kv"><dt>Сила</dt><dd>${a.intensity} из 10</dd><dt>Что задело</dt><dd>${esc(a.trigger)}</dd><dt>Потребность</dt><dd>${esc(a.need)}</dd></dl></div>`;
}

function persistEntry(entry) {
  const i = entries.findIndex((e) => e.id === entry.id);
  if (i >= 0) entries[i] = entry;
  else entries.unshift(entry);
  saveEntries();
}

async function submitTalk(text) {
  text = text.trim();
  if (!text) return;
  stopVoice();
  $('#input').value = '';
  autoGrow();
  bubble(text, 'me');

  if (talk.stage === 'input') {
    const entry = { id: uid(), createdAt: Date.now(), text, clarify: null, analysis: null };
    talk.entry = entry;
    persistEntry(entry); // сохраняем сразу, чтобы рассказ не потерялся
    showComposer(false);
    typing(true);
    try {
      const a = await analyzeEntry(entry, { allowQuestion: true });
      typing(false);
      if (a.question && !a.risk) {
        talk.first = a;
        entry.analysis = Object.assign({}, a, { question: '' });
        persistEntry(entry);
        talk.stage = 'clarify';
        bubble(a.question);
        setActions('<button class="btn ghost" data-action="skip-clarify">Пропустить, сохранить так</button>');
        showComposer(true, 'Ответьте, если хочется…');
      } else {
        finishTalk(a);
      }
    } catch (e) {
      typing(false);
      failTalk(e);
    }
  } else if (talk.stage === 'clarify') {
    const entry = talk.entry;
    entry.clarify = { q: talk.first.question, a: text };
    persistEntry(entry);
    setActions('');
    showComposer(false);
    typing(true);
    try {
      const a = await analyzeEntry(entry, { allowQuestion: false });
      typing(false);
      finishTalk(a);
    } catch (e) {
      typing(false);
      finishTalk(Object.assign({}, talk.first, { question: '' })); // остаётся первичный разбор
    }
  }
}

function finishTalk(a) {
  const entry = talk.entry;
  entry.analysis = Object.assign({}, a, { question: '' });
  persistEntry(entry);
  talk.stage = 'done';
  showComposer(false);
  setActions('');
  if (a.reflection) bubble(a.reflection);
  appendHTML(resultCard(entry.analysis));
  if (a.risk || CRISIS_RE.test(entry.text)) appendHTML(crisisCard());
  doneActions();
}

function failTalk(e) {
  const entry = talk.entry;
  talk.stage = 'done';
  showComposer(false);
  bubble(`Запись сохранена. ${describeError(e)} Разбор можно запустить позже в «Истории».`);
  if (CRISIS_RE.test(entry.text)) appendHTML(crisisCard());
  doneActions();
}

function doneActions() {
  setActions('<button class="btn secondary" data-action="talk">Ещё момент</button><button class="btn" data-action="close-talk">Готово</button>');
}

function skipClarify() {
  if (talk.stage !== 'clarify') return;
  bubble('Пропустить', 'me');
  finishTalk(Object.assign({}, talk.first, { question: '' }));
}

/* ---------- Голос ---------- */

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null;
let voiceBase = '';

function toggleVoice() {
  if (recog) return stopVoice();
  if (!SR) {
    $('#input').focus();
    toast('Нажмите 🎤 на клавиатуре телефона, чтобы надиктовать');
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
  voiceBase = $('#input').value ? $('#input').value.trim() + ' ' : '';
  recog.onresult = (ev) => {
    let finalText = '', interim = '';
    for (let i = 0; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    $('#input').value = voiceBase + finalText + interim;
    autoGrow();
  };
  recog.onerror = (ev) => {
    if (ev.error === 'not-allowed') toast('Нет доступа к микрофону — используйте диктовку клавиатуры');
    stopVoice();
  };
  recog.onend = () => stopVoice();
  recog.start();
  $('#mic').classList.add('on');
}
function stopVoice() {
  if (recog) {
    const r = recog;
    recog = null;
    try { r.stop(); } catch (e) { /* уже остановлен */ }
  }
  $('#mic')?.classList.remove('on');
}

function autoGrow() {
  const t = $('#input');
  t.style.height = 'auto';
  t.style.height = Math.min(t.scrollHeight, 140) + 'px';
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

const actions = {
  talk: openTalk,
  'close-talk': closeTalk,
  'skip-clarify': skipClarify,
  settings: openSettings,
  'close-sheet': closeSheet,
  onboarding: openOnboarding,
  onboarded() {
    settings.onboarded = true;
    saveSettings();
    closeSheet();
  },
  filter(el) {
    historyFilter = el.dataset.f;
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
  if (form.id === 'composer') {
    ev.preventDefault();
    submitTalk($('#input').value);
    return;
  }
  if (form.dataset.action === 'practice-chat') {
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
  }
});

$('#input').addEventListener('input', autoGrow);
$('#input').addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing && window.matchMedia('(pointer: fine)').matches) {
    ev.preventDefault();
    submitTalk($('#input').value);
  }
});
$('#mic').addEventListener('click', toggleVoice);
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if (!$('#sheet-wrap').hidden) closeSheet();
  else if (!$('#talk').hidden) closeTalk();
});

/* ================= Старт ================= */

hydrateIcons();
setTab('state');
if (!settings.onboarded) openOnboarding();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
