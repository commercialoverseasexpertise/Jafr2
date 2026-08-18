const ABJAD = {
  ا: 1, آ: 1, أ: 1, إ: 1, ء: 1,
  ب: 2, پ: 2,
  ج: 3, چ: 3,
  د: 4,
  ه: 5, ة: 5,
  و: 6, ؤ: 6,
  ز: 7, ژ: 7,
  ح: 8,
  ط: 9,
  ی: 10, ي: 10, ئ: 10,
  ک: 20, ك: 20, گ: 20,
  ل: 30,
  م: 40,
  ن: 50,
  س: 60,
  ع: 70,
  ف: 80,
  ص: 90,
  ق: 100,
  ر: 200,
  ش: 300,
  ت: 400,
  ث: 500,
  خ: 600,
  ذ: 700,
  ض: 800,
  ظ: 900,
  غ: 1000
};

const el = (id) => document.getElementById(id);
const input = el('textInput');
const normalizedText = el('normalizedText');
const totalValue = el('totalValue');
const detailLine = el('detailLine');
const taksirResults = el('taksirResults');
const message = el('message');

function normalizeText(text) {
  return (text || '')
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ی')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[^اآأإءبپتثجچحخدذرزژسشصضطظعغفقکگلمنهویو]/g, '');
}

function charValue(ch) {
  return ABJAD[ch] || 0;
}

function computeAbjad(text) {
  const norm = normalizeText(text);
  const items = [...norm].map(ch => ({ ch, value: charValue(ch) }));
  const total = items.reduce((sum, it) => sum + it.value, 0);
  return { norm, items, total };
}

function formatDetail(items) {
  if (!items.length) return '—';
  return items.map(it => `${it.ch}(${it.value})`).join(' + ');
}

function groupBySize(arr, size) {
  const groups = [];
  for (let i = 0; i < arr.length; i += size) groups.push(arr.slice(i, i + size));
  return groups;
}

function groupInfo(groups) {
  return groups.map(g => ({
    text: g.join(''),
    value: [...g].reduce((sum, ch) => sum + charValue(ch), 0)
  }));
}

function taksirData(norm) {
  const chars = [...norm];
  const schemes = [
    { key: 'صدر-مؤخر', value: chars },
    { key: 'مؤخر-صدر', value: [...chars].reverse() },
    { key: 'زوجی', value: groupBySize(chars, 2).map(g => g.join('')) },
    { key: 'ثلاثی', value: groupBySize(chars, 3).map(g => g.join('')) },
    { key: 'رباعی', value: groupBySize(chars, 4).map(g => g.join('')) }
  ];
  return schemes.map(s => {
    const groups = Array.isArray(s.value[0]) ? s.value : s.value;
    const info = groupInfo(groups.map(g => [...g]));
    const total = info.reduce((sum, g) => sum + g.value, 0);
    return { key: s.key, groups: info, total };
  });
}

function render() {
  const text = input.value.trim();
  if (!text) {
    message.textContent = 'لطفاً یک عبارت وارد کنید.';
    normalizedText.textContent = '—';
    totalValue.textContent = '—';
    detailLine.textContent = '—';
    taksirResults.innerHTML = '';
    return;
  }

  const { norm, items, total } = computeAbjad(text);
  normalizedText.textContent = norm || '—';
  totalValue.textContent = total;
  detailLine.textContent = formatDetail(items);
  message.textContent = `محاسبه انجام شد. تعداد حروف نرمال‌شده: ${items.length}`;

  const taksir = taksirData(norm);
  taksirResults.innerHTML = taksir.map(t => {
    const groupLine = t.groups.map(g => `${g.text}(${g.value})`).join(' | ');
    return `<div class="taksir-item"><div class="title">${t.key}</div><div>${groupLine || '—'}</div><div>جمع کل: ${t.total}</div></div>`;
  }).join('');
}

async function copyResults() {
  const text = input.value.trim();
  if (!text) return;
  const { norm, items, total } = computeAbjad(text);
  const taksir = taksirData(norm);
  const lines = [
    `عبارت: ${text}`,
    `نرمال‌شده: ${norm}`,
    `ابجد کبیر: ${total}`,
    `ریز محاسبه: ${formatDetail(items)}`,
    '',
    ...taksir.map(t => `${t.key}: ${t.groups.map(g => `${g.text}(${g.value})`).join(' | ')} => ${t.total}`)
  ];
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    message.textContent = 'نتایج کپی شد.';
  } catch {
    message.textContent = 'کپی خودکار ممکن نشد.';
  }
}

document.querySelectorAll('.sample').forEach(btn => btn.addEventListener('click', () => {
  input.value = btn.dataset.sample;
  render();
}));

el('calcBtn').addEventListener('click', render);
el('sampleBtn').addEventListener('click', () => {
  input.value = 'یا لطیف';
  render();
});
el('clearBtn').addEventListener('click', () => {
  input.value = '';
  render();
});
el('copyBtn').addEventListener('click', copyResults);
input.addEventListener('input', render);
render();
