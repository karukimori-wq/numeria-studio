const FORM_STORAGE_KEY = 'numeria-report-form';
const DEFAULT_FORM = {
  clientName: '',
  birthday: '',
  concern: '',
  theme: 'life_path',
  method: 'pythagorean',
  tone: 'warm',
  actionPeriod: '30日',
  resultNotes: '',
  reportBody: '',
};

const THEME_LABELS = {
  life_path: 'ライフパス',
  yearly: '年運',
  compatibility: '相性',
  career: '仕事',
};

const METHOD_LABELS = {
  pythagorean: 'ピタゴラス式',
  chaldean: 'カルデアン式',
  hybrid: 'ハイブリッド',
};

const TONE_LABELS = {
  warm: 'やさしく前向き',
  direct: '端的で実務的',
  mystical: '神秘的',
};

function parseStoredForm() {
  try {
    const stored = JSON.parse(localStorage.getItem(FORM_STORAGE_KEY) || '{}');
    return { ...DEFAULT_FORM, ...stored };
  } catch {
    return { ...DEFAULT_FORM };
  }
}

function saveStoredForm(nextForm) {
  localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(nextForm));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function reduceNumber(value) {
  let total = String(value || '')
    .replace(/\D/g, '')
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0);

  while (total > 9 && ![11, 22, 33].includes(total)) {
    total = String(total)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  }

  return total || null;
}

function calcLifePath(birthday) {
  return reduceNumber(birthday);
}

function calcPersonalYear(birthday) {
  const digits = String(birthday || '').replace(/\D/g, '');
  if (digits.length < 8) return null;
  const monthDay = digits.slice(4);
  return reduceNumber(`${new Date().getFullYear()}${monthDay}`);
}

function valueOrPending(value) {
  return value || '未入力';
}

function buildAppraisalMaterials(form = parseStoredForm()) {
  const lifePath = calcLifePath(form.birthday);
  const personalYear = calcPersonalYear(form.birthday);
  const theme = THEME_LABELS[form.theme] || form.theme || '未入力';
  const method = METHOD_LABELS[form.method] || form.method || '未入力';
  const tone = TONE_LABELS[form.tone] || form.tone || '未入力';

  return {
    lifePath: lifePath ? String(lifePath) : '未計算',
    personalYear: personalYear ? String(personalYear) : '未計算',
    birthdayDigitsReady: String(form.birthday || '').replace(/\D/g, '').length >= 8,
    theme,
    method,
    tone,
    actionPeriod: valueOrPending(form.actionPeriod),
    concern: valueOrPending(form.concern),
    notes: valueOrPending(form.resultNotes),
  };
}

function buildMaterialSnippets(form = parseStoredForm()) {
  const materials = buildAppraisalMaterials(form);
  return {
    lifePath: `【計算結果】ライフパスは ${materials.lifePath} です。Report本文では、この数字を中心テーマとして解釈してください。`,
    personalYear: `【計算結果】今年のパーソナルイヤーは ${materials.personalYear} です。${materials.actionPeriod} の行動提案に反映してください。`,
    diagram: `【鑑定構成】${materials.method} / ${materials.theme} / ${materials.tone} / ライフパス ${materials.lifePath} / 年運 ${materials.personalYear} をつなげて本文を構成してください。`,
    notes: `【鑑定メモ】${materials.notes}`,
  };
}

function renderReportComposerMaterials() {
  const workspace = document.querySelector('.workspace');
  const inputPanel = workspace?.querySelector(':scope > .input-panel, :scope > .composer-left > .input-panel');
  if (!workspace || !inputPanel) return;

  let leftColumn = workspace.querySelector(':scope > .composer-left');
  if (!leftColumn) {
    leftColumn = document.createElement('div');
    leftColumn.className = 'composer-left';
    workspace.insertBefore(leftColumn, inputPanel);
    leftColumn.appendChild(inputPanel);
  } else if (inputPanel.parentElement !== leftColumn) {
    leftColumn.appendChild(inputPanel);
  }

  const form = parseStoredForm();
  const materials = buildAppraisalMaterials(form);
  const panelHtml = `
    <p class="eyebrow small">Report Composer</p>
    <div class="material-header">
      <div>
        <h2>鑑定素材</h2>
        <p class="muted">Report本文を作るためのローカル表示です。Growth Engineへ返すpayloadには含めません。</p>
      </div>
    </div>
    <div class="material-grid" aria-label="計算結果">
      <div class="material-card">
        <span>ライフパス</span>
        <strong>${escapeHtml(materials.lifePath)}</strong>
        <small>${materials.birthdayDigitsReady ? '生年月日から算出' : '生年月日8桁で算出'}</small>
      </div>
      <div class="material-card">
        <span>パーソナルイヤー</span>
        <strong>${escapeHtml(materials.personalYear)}</strong>
        <small>今年の流れ</small>
      </div>
      <div class="material-card">
        <span>テーマ</span>
        <strong>${escapeHtml(materials.theme)}</strong>
        <small>${escapeHtml(materials.method)}</small>
      </div>
      <div class="material-card">
        <span>文体</span>
        <strong>${escapeHtml(materials.tone)}</strong>
        <small>${escapeHtml(materials.actionPeriod)}</small>
      </div>
    </div>
    <div class="appraisal-diagram" aria-label="計算結果とReport構成の関係図">
      <div class="diagram-node primary">Life Path<br><strong>${escapeHtml(materials.lifePath)}</strong></div>
      <div class="diagram-line" aria-hidden="true"></div>
      <div class="diagram-node">Theme<br><strong>${escapeHtml(materials.theme)}</strong></div>
      <div class="diagram-line" aria-hidden="true"></div>
      <div class="diagram-node">Year<br><strong>${escapeHtml(materials.personalYear)}</strong></div>
      <div class="diagram-line" aria-hidden="true"></div>
      <div class="diagram-node">Report<br><strong>正本</strong></div>
    </div>
    <div class="insert-chips" aria-label="鑑定素材をReport本文に差し込む">
      <button type="button" class="insert-chip" data-insert-material="lifePath">ライフパスを挿入</button>
      <button type="button" class="insert-chip" data-insert-material="personalYear">年運を挿入</button>
      <button type="button" class="insert-chip" data-insert-material="diagram">構成メモを挿入</button>
      <button type="button" class="insert-chip" data-insert-material="notes">鑑定メモを挿入</button>
    </div>
    <p class="material-safety">個人名・誕生日・Report本文・支払い情報・paymentStatus・salesAmount・fullMeetingTranscript・機密Promptは外部連携payloadに含めません。</p>
  `;

  let panel = leftColumn.querySelector(':scope > .report-composer-materials');
  if (!panel) {
    panel = document.createElement('section');
    panel.className = 'panel report-composer-materials';
    leftColumn.insertBefore(panel, inputPanel);
  }

  if (panel.innerHTML !== panelHtml) {
    panel.innerHTML = panelHtml;
  }
}

function insertReportMaterial(materialKey) {
  const form = parseStoredForm();
  const snippets = buildMaterialSnippets(form);
  const snippet = snippets[materialKey];
  if (!snippet) return;

  const editor = document.querySelector('.report-editor');
  const currentBody = editor?.value ?? form.reportBody ?? '';
  const separator = currentBody.trim() ? '\n\n' : '';
  const nextBody = `${currentBody}${separator}${snippet}`;
  const nextForm = { ...form, reportBody: nextBody, reportDirty: true };

  saveStoredForm(nextForm);
  if (editor) {
    editor.value = nextBody;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.focus();
  }
}

let renderQueued = false;
function scheduleMaterialRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    renderReportComposerMaterials();
  });
}

function bootReportComposerMaterials() {
  renderReportComposerMaterials();

  document.addEventListener('input', (event) => {
    if (event.target?.matches?.('[data-field]')) {
      scheduleMaterialRender();
    }
  });

  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('[data-insert-material]');
    if (!button) return;
    insertReportMaterial(button.dataset.insertMaterial);
  });

  const root = document.getElementById('root');
  if (root) {
    const observer = new MutationObserver(() => scheduleMaterialRender());
    observer.observe(root, { childList: true, subtree: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootReportComposerMaterials, { once: true });
} else {
  bootReportComposerMaterials();
}
