const initialForm = {
  clientName: '',
  birthday: '',
  theme: '恋愛・パートナーシップ',
  method: '数秘術',
  templateType: 'premium',
  tone: 'やさしく背中を押す',
  concern: '',
  resultNotes: '',
  actionPeriod: '今後3か月',
  reportBody: '',
  reportDirty: false,
  growthContext: null,
  sessionId: '',
  sessionStatus: '',
  reportId: '',
  reportStatus: '',
  completedAt: '',
};

const themes = ['恋愛・パートナーシップ', '復縁・片思い', '仕事・キャリア', '人間関係', '金運・豊かさ', '総合運'];
const methods = ['数秘術', 'タロット', '西洋占星術', '四柱推命', 'オラクルカード'];
const tones = ['やさしく背中を押す', '具体的で実務的', '神秘的で詩的', '短く要点重視'];
const templateTypes = [
  { value: 'premium', label: '有料納品ロング版' },
  { value: 'love', label: '恋愛・復縁版' },
  { value: 'career', label: '仕事・転職版' },
  { value: 'monthly', label: '月間運勢版' },
  { value: 'short', label: '初回相談ショート版' },
];
const storeKey = 'numeria-report-form';
const historyStoreKey = 'numeria-appraisal-session-history';
const allowedGrowthRefs = ['workspaceId', 'userId', 'reservationId', 'customerId', 'intent', 'traceId', 'correlationId', 'returnUrl'];
const allowedSessionRefs = ['sessionId', 'reportId', 'sessionStatus', 'reportStatus', 'completedAt'];
const blockedGrowthFields = ['name', 'clientName', 'email', 'paymentStatus', 'salesAmount', 'fullMeetingTranscript', 'fullReportBody', 'apiKey', 'secretPrompt'];
const contractStatus = {
  identityMode: 'workspaceId + userId',
  owns: ['Session', 'Report', '鑑定メモ'],
  referencesOnly: ['Growth Engine の customerId / reservationId', 'AI Activity の activityId', 'Communication Planner の conversationId / replyDraftId'],
  notOwned: ['Customer', 'Payment', 'Sales', 'MessageDraft', 'Velvet Visit / Memory / Note', 'Conversation / Message', 'ReplyDraft / SafetyCheck'],
  neverShare: ['支払い状態', '売上金額', 'Report本文', '鑑定本文', '会話本文', '全文メモ', 'APIキー', '機密Prompt'],
  events: ['studio.session.started.v1', 'studio.session.completed.v1', 'studio.report.generated.v1'],
};

let form;


function loadAppraisalSessionHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(historyStoreKey) || '[]');
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

function saveAppraisalSessionHistory(history) {
  localStorage.setItem(historyStoreKey, JSON.stringify(history.slice(0, 8)));
}

function loadForm() {
  try {
    return { ...initialForm, ...JSON.parse(localStorage.getItem(storeKey) || '{}') };
  } catch {
    return { ...initialForm };
  }
}

function saveForm() {
  localStorage.setItem(storeKey, JSON.stringify(form));
}

function buildAppraisalSessionSnapshot() {
  if (!form.sessionId) return null;
  const now = new Date().toISOString();
  return {
    sessionId: form.sessionId,
    sessionStatus: form.sessionStatus || 'started',
    reportId: form.reportId || '',
    reportRef: form.reportId ? `report:${form.reportId}` : '',
    reportStatus: form.reportStatus || 'draft',
    eventName: form.sessionStatus === 'completed' ? 'studio.session.completed.v1' : 'studio.session.started.v1',
    workspaceId: form.growthContext?.workspaceId || '',
    userId: form.growthContext?.userId || '',
    reservationId: form.growthContext?.reservationId || '',
    customerId: form.growthContext?.customerId || '',
    theme: form.theme,
    method: form.method,
    updatedAt: now,
    completedAt: form.completedAt || '',
    dataScope: 'Numeria-owned appraisal session snapshot. No customer master, payment, sales, transcript, or report body.',
  };
}

function upsertAppraisalSessionHistory() {
  const snapshot = buildAppraisalSessionSnapshot();
  if (!snapshot) return;
  const nextHistory = [
    snapshot,
    ...loadAppraisalSessionHistory().filter((item) => item.sessionId !== snapshot.sessionId),
  ];
  saveAppraisalSessionHistory(nextHistory);
}

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function readGrowthContextFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const refs = {};
  allowedGrowthRefs.forEach((key) => {
    const value = params.get(key);
    if (value) refs[key] = value;
  });
  const ignoredFields = blockedGrowthFields.filter((key) => params.has(key));
  if (!Object.keys(refs).length && !ignoredFields.length) return null;
  return {
    ...refs,
    sourceApp: 'growth-engine',
    acceptedRefs: Object.keys(refs).filter((key) => key !== 'returnUrl'),
    ignoredFields,
    receivedAt: new Date().toISOString(),
  };
}

function readSessionContextFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const refs = {};
  allowedSessionRefs.forEach((key) => {
    const value = params.get(key);
    if (value) refs[key] = value;
  });
  const pathSessionId = window.location.pathname.match(/\/app\/sessions\/([^/]+)/)?.[1];
  if (pathSessionId && pathSessionId !== 'sample') refs.sessionId = decodeURIComponent(pathSessionId);
  if (!Object.keys(refs).length) return null;
  return refs;
}

function mergeUrlContext(currentForm) {
  const urlContext = readGrowthContextFromUrl();
  const sessionContext = readSessionContextFromUrl();
  const nextForm = urlContext
    ? { ...currentForm, growthContext: { ...(currentForm.growthContext || {}), ...urlContext } }
    : currentForm;
  return sessionContext ? { ...nextForm, ...sessionContext } : nextForm;
}

function calcLifePath(birthday) {
  const digits = birthday.replace(/\D/g, '').split('').map(Number);
  if (!digits.length) return null;
  let sum = digits.reduce((acc, n) => acc + n, 0);
  while (sum > 9 && ![11, 22, 33].includes(sum)) {
    sum = String(sum).split('').reduce((acc, n) => acc + Number(n), 0);
  }
  return sum;
}

function getContext(currentForm) {
  const number = calcLifePath(currentForm.birthday);
  const name = currentForm.clientName || 'ご相談者さま';
  const concern = currentForm.concern || '今の流れを整理し、次の一歩を見つけたい';
  const notes = currentForm.resultNotes || '直感を信じつつ、日々の小さな選択を丁寧に整えることが鍵です。';
  const numberText = number ? `\n\n【数秘メモ】\nライフパスは「${number}」。持ち味を無理なく発揮できる環境選びが開運の土台になります。` : '';
  return { number, name, concern, notes, numberText };
}

const reportTemplates = {
  premium(currentForm) {
    const { name, concern, notes, numberText } = getContext(currentForm);
    return `${name} 鑑定書\n\n【鑑定テーマ】${currentForm.theme}\n【使用メソッド】${currentForm.method}\n【鑑定トーン】${currentForm.tone}\n【対象期間】${currentForm.actionPeriod}\n\n1. 現在の状況\n${concern}というテーマに対して、今は「焦って結論を出す」よりも、気持ち・事実・相手や環境の反応を分けて見つめる時期です。すでに必要なサインは届き始めています。\n\n2. 鑑定結果の要点\n${notes}${numberText}\n\n3. 深掘りメッセージ\n今回の流れは、過去の延長で判断するよりも「これからどう扱いたいか」を決め直すことが鍵です。状況を変える力は、大きな決断よりも小さな行動の継続に宿ります。\n\n4. 開運アドバイス\n・最初の一歩は、今日中にできる小さな行動まで落とし込むこと。\n・迷いが強い日は、答えを急がず「本当はどうありたいか」を一文で書き出すこと。\n・ご縁やチャンスは、安心感と自然な会話がある場所から広がります。\n\n5. お守りメッセージ\n${name}の未来は、いま選び直す小さな習慣から静かに形になります。完璧なタイミングを待つより、心が少し軽くなる選択を重ねてください。`;
  },
  love(currentForm) {
    const { name, concern, notes, numberText } = getContext(currentForm);
    return `${name} 恋愛鑑定書\n\n【テーマ】${currentForm.theme}\n【占術】${currentForm.method}\n【対象期間】${currentForm.actionPeriod}\n\n1. お相手・ご縁の流れ\n${concern}について、今は気持ちの温度差やタイミングを丁寧に読む時期です。無理に距離を縮めるより、安心して話せる空気を整えるほど運気が動きます。\n\n2. 鑑定メッセージ\n${notes}${numberText}\n\n3. 恋愛運を動かす行動\n・連絡は長文よりも、相手が返しやすい一文を意識すること。\n・不安を確認するための行動ではなく、信頼を育てる行動を選ぶこと。\n・自分の魅力を下げて合わせるより、心地よくいられる接点を増やすこと。\n\n4. 心の処方箋\n${name}が愛されるために必要なのは、完璧に振る舞うことではありません。素直さと境界線を両方大切にしたとき、ご縁は自然に整っていきます。`;
  },
  career(currentForm) {
    const { name, concern, notes, numberText } = getContext(currentForm);
    return `${name} 仕事・キャリア鑑定書\n\n【テーマ】${currentForm.theme}\n【占術】${currentForm.method}\n【対象期間】${currentForm.actionPeriod}\n\n1. 現在の仕事運\n${concern}に関して、今は「何を続け、何を手放すか」を整理するタイミングです。評価や成果は、役割を明確にするほど受け取りやすくなります。\n\n2. 鑑定結果\n${notes}${numberText}\n\n3. キャリアの開運アクション\n・今週中に、やめたい作業と伸ばしたい強みをそれぞれ3つ書き出すこと。\n・相談や交渉は、感情ではなく条件と希望を分けて伝えること。\n・新しい学びは、すぐ実務で試せる小さなテーマから始めること。\n\n4. 未来へのメッセージ\n${name}のキャリアは、誰かの期待に合わせるほど狭くなり、自分の得意を言語化するほど広がります。次の一歩は、すでに手の届く場所にあります。`;
  },
  monthly(currentForm) {
    const { name, concern, notes, numberText } = getContext(currentForm);
    return `${name} 月間運勢レポート\n\n【対象期間】${currentForm.actionPeriod}\n【テーマ】${currentForm.theme}\n【占術】${currentForm.method}\n\n全体運\n${concern}を起点に、今月は流れを整える月です。急展開を狙うより、生活・人間関係・お金の使い方を微調整すると運気の受け皿が広がります。\n\n注目ポイント\n${notes}${numberText}\n\n週ごとの過ごし方\n・1週目：情報整理と予定の見直し。\n・2週目：人との会話からヒントを受け取る。\n・3週目：小さな挑戦をひとつ実行する。\n・4週目：成果を振り返り、次月に残す習慣を選ぶ。\n\nラッキーアクション\n朝の5分間で、今日の優先順位をひとつだけ決めてください。小さな集中が、今月の運を大きく整えます。`;
  },
  short(currentForm) {
    const { name, concern, notes, numberText } = getContext(currentForm);
    return `${name} ミニ鑑定メモ\n\n【テーマ】${currentForm.theme}\n【占術】${currentForm.method}\n\n今の流れ\n${concern}について、焦りを手放して状況を一段引いて見ることが大切です。\n\n鑑定結果\n${notes}${numberText}\n\n今日からの一歩\n心が少し軽くなる選択をひとつだけ実行してください。その小さな行動が次のサインを連れてきます。`;
  },
};

function buildReport(currentForm = form) {
  return (reportTemplates[currentForm.templateType] || reportTemplates.premium)(currentForm);
}

function optionTags(values, selected) {
  return values.map((value) => `<option ${value === selected ? 'selected' : ''}>${value}</option>`).join('');
}

function objectOptionTags(values, selected) {
  return values.map(({ value, label }) => `<option value="${value}" ${value === selected ? 'selected' : ''}>${label}</option>`).join('');
}

function listItems(values) {
  return values.map((value) => `<li>${escapeHtml(value)}</li>`).join('');
}

function renderRefRows(context) {
  if (!context) {
    return '<p class="muted">Growth Engine から開始された場合、workspaceId / userId / reservationId / customerId がここに表示されます。</p>';
  }
  const rows = ['workspaceId', 'userId', 'reservationId', 'customerId', 'intent']
    .filter((key) => context[key])
    .map((key) => `<div><dt>${escapeHtml(key)}</dt><dd><code>${escapeHtml(context[key])}</code></dd></div>`)
    .join('');
  return `<dl class="ref-list">${rows || '<div><dt>refs</dt><dd>参照IDなし</dd></div>'}</dl>`;
}

function buildSessionUrl() {
  if (!form.sessionId) return '#report-editor';
  const url = new URL(`/app/sessions/${form.sessionId}/`, window.location.origin);
  const refs = {
    workspaceId: form.growthContext?.workspaceId,
    userId: form.growthContext?.userId,
    reservationId: form.growthContext?.reservationId,
    customerId: form.growthContext?.customerId,
    sessionId: form.sessionId,
    reportId: form.reportId,
    sourceApp: 'numeria-studio',
  };
  Object.entries(refs).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.pathname + url.search;
}

function buildGrowthReturnUrl() {
  const returnUrl = form.growthContext?.returnUrl;
  if (!returnUrl || !form.sessionId) return '';
  try {
    const url = new URL(returnUrl, window.location.origin);
    const refs = {
      workspaceId: form.growthContext?.workspaceId,
      userId: form.growthContext?.userId,
      reservationId: form.growthContext?.reservationId,
      customerId: form.growthContext?.customerId,
      sessionId: form.sessionId,
      reportId: form.reportId,
      reportRef: form.reportId ? `report:${form.reportId}` : '',
      sourceApp: 'numeria-studio',
      status: 'success',
      sessionStatus: form.sessionStatus || '',
      reportStatus: form.reportStatus || '',
      completedAt: form.completedAt || '',
    };
    Object.entries(refs).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  } catch {
    return '';
  }
}

function renderGrowthStartPanel() {
  const context = form.growthContext;
  const returnUrl = buildGrowthReturnUrl();
  const sessionUrl = buildSessionUrl();
  const sessionEventName = form.sessionStatus === 'completed' ? 'studio.session.completed.v1' : 'studio.session.started.v1';
  const ignored = context?.ignoredFields?.length
    ? `<p class="warning">受け取り対象外の項目を無視しました: ${context.ignoredFields.map(escapeHtml).join(', ')}</p>`
    : '';
  const sessionSummary = form.sessionId
    ? `<div class="result-box">
        <div><span>sessionId</span><code>${escapeHtml(form.sessionId)}</code></div>
        <div><span>sessionStatus</span><code>${escapeHtml(form.sessionStatus || 'started')}</code></div>
        <div><span>reportId</span><code>${escapeHtml(form.reportId)}</code></div>
        <div><span>reportStatus</span><code>${escapeHtml(form.reportStatus || 'draft')}</code></div>
        <div><span>reportRef</span><code>${escapeHtml(form.reportId ? `report:${form.reportId}` : '')}</code></div>
        <div><span>eventName</span><code>${sessionEventName}</code></div>
        ${form.completedAt ? `<div><span>completedAt</span><code>${escapeHtml(form.completedAt)}</code></div>` : ''}
      </div>`
    : '';
  return `
    <section class="panel start-panel" aria-label="Growth Engine から開始">
      <div>
        <p class="eyebrow small">Growth Engine Start</p>
        <h2>予約から鑑定を開始</h2>
        <p class="muted">受け取るのは参照IDのみです。個人名、支払い情報、売上、Report本文、全文カルテは受け取りません。</p>
      </div>
      ${renderRefRows(context)}
      ${ignored}
      <div class="start-actions">
        <button data-action="start-session" type="button">${form.sessionId ? 'Sessionを再確認' : 'Sessionを開始'}</button>
        ${form.sessionId ? `<a class="button-link" href="${escapeHtml(sessionUrl)}">鑑定作成へ進む</a>` : ''}
        ${form.sessionId ? '<a class="button-link secondary" href="#report-editor" data-action="generate-report-link">Report作成へ進む</a>' : ''}
        ${form.sessionId ? '<button data-action="complete-session" type="button">鑑定完了にする</button>' : ''}
        ${form.sessionId ? '<button data-action="export-refs" type="button">参照ID JSON</button>' : ''}
        ${returnUrl ? `<a class="button-link dark" href="${escapeHtml(returnUrl)}">Growth Engineのフォロー画面へ戻る</a>` : ''}
      </div>
      ${sessionSummary}
      ${form.sessionId ? '<p class="excluded-fields">Growth Engineへ返さない項目: reportBody / pdfBody / clientName / paymentStatus / salesAmount / fullMeetingTranscript</p>' : ''}
    </section>`;
}

function buildHistorySessionUrl(item) {
  const url = new URL(`/app/sessions/${item.sessionId}/`, window.location.origin);
  ['workspaceId', 'userId', 'reservationId', 'customerId', 'sessionId', 'reportId', 'sessionStatus', 'reportStatus', 'completedAt'].forEach((key) => {
    if (item[key]) url.searchParams.set(key, item[key]);
  });
  url.searchParams.set('sourceApp', 'numeria-studio');
  return url.pathname + url.search;
}

function renderAppraisalSessionHistory() {
  const history = loadAppraisalSessionHistory();
  const rows = history.map((item) => `
    <article class="history-item">
      <div>
        <strong>${escapeHtml(item.theme || '鑑定Session')}</strong>
        <p>${escapeHtml(item.method || 'method未設定')} / ${escapeHtml(item.updatedAt || '')}</p>
      </div>
      <dl>
        <div><dt>sessionId</dt><dd><code>${escapeHtml(item.sessionId)}</code></dd></div>
        <div><dt>reportId</dt><dd><code>${escapeHtml(item.reportId || '')}</code></dd></div>
        <div><dt>sessionStatus</dt><dd><code>${escapeHtml(item.sessionStatus || '')}</code></dd></div>
        <div><dt>reportStatus</dt><dd><code>${escapeHtml(item.reportStatus || '')}</code></dd></div>
      </dl>
      <a class="button-link secondary" href="${escapeHtml(buildHistorySessionUrl(item))}">開く</a>
    </article>`).join('');
  return `
    <section class="panel history-panel" aria-label="最近の鑑定Session">
      <div>
        <p class="eyebrow small">Appraisal Session History</p>
        <h2>最近のSession</h2>
        <p class="muted">保存するのは鑑定Sessionのsnapshotです。Customer master、支払い、売上、Report本文、全文カルテは保存しません。</p>
      </div>
      ${rows || '<p class="muted">まだ保存されたSessionはありません。Session開始後にここへ表示されます。</p>'}
    </section>`;
}

function render() {
  const isSessionRoute = window.location.pathname.startsWith('/app/sessions/');
  document.querySelector('#root').innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <div>
          <p class="eyebrow">Numeria Studio</p>
          <h1>${isSessionRoute ? '鑑定作成画面' : '鑑定SessionとReportを作成'}</h1>
          <p class="lead">${isSessionRoute ? 'Session単位で鑑定メモとReportを編集します。Growth Engineへ返す場合も参照IDのみを使います。' : 'Growth Engine の予約参照IDから鑑定を開始し、Numeria Studio内でReportを作成します。外部へ返すのは sessionId / reportId などの参照IDだけです。'}</p>
        </div>
        <button class="ghost-button" data-action="reset">リセット</button>
      </section>
      ${renderGrowthStartPanel()}
      ${renderAppraisalSessionHistory()}
      <div class="workspace">
        <form class="panel input-panel">
          <h2>鑑定情報</h2>
          <label>お名前<input data-field="clientName" value="${escapeHtml(form.clientName)}" placeholder="Growth未接続時のローカル下書き" /></label>
          <label>生年月日<input data-field="birthday" type="date" value="${form.birthday}" /></label>
          <label>テンプレート<select data-field="templateType">${objectOptionTags(templateTypes, form.templateType)}</select></label>
          <label>テーマ<select data-field="theme">${optionTags(themes, form.theme)}</select></label>
          <label>占術<select data-field="method">${optionTags(methods, form.method)}</select></label>
          <label>文章トーン<select data-field="tone">${optionTags(tones, form.tone)}</select></label>
          <label>対象期間<input data-field="actionPeriod" value="${escapeHtml(form.actionPeriod)}" /></label>
          <label>相談内容<textarea data-field="concern" placeholder="鑑定時点のsnapshotとして扱うメモ">${escapeHtml(form.concern)}</textarea></label>
          <label>鑑定メモ<textarea data-field="resultNotes" placeholder="カード結果、星回り、数秘の解釈など">${escapeHtml(form.resultNotes)}</textarea></label>
          <section class="contract-note" aria-label="連携メモ">
            <h3>連携メモ</h3>
            <p>Numeria Studio は鑑定とReportを作る場所です。お客様台帳、支払い、売上、会話、返信、安全確認、Velvetの記録は持ちません。</p>
            <dl>
              <div><dt>受け取るID</dt><dd>${escapeHtml(contractStatus.referencesOnly[0])}</dd></div>
              <div><dt>外へ返すID</dt><dd>sessionId / reportId / reportRef</dd></div>
            </dl>
          </section>
        </form>
        <section class="panel report-panel">
          <div class="report-header">
            <div>
              <h2>編集できるReport</h2>
              <p class="status-text">${form.reportDirty ? '手動編集済み。再生成すると本文が上書きされます。' : '入力内容から生成された本文です。'}</p>
            </div>
            <div class="actions">
              <button data-action="regenerate" type="button">再生成</button>
              <button data-action="copy" type="button">コピー</button>
              <button data-action="print" type="button">印刷</button>
            </div>
          </div>
          <textarea id="report-editor" class="report-editor" data-field="reportBody">${escapeHtml(form.reportBody)}</textarea>
          <section class="contract-panel" aria-label="契約ステータス">
            <div>
              <h3>他アプリとの役割</h3>
              <p>Communication Planner が追加されても、Numeria Studio は Session / Report の担当です。会話、返信、SafetyCheck は参照IDだけ扱い、本文は渡しません。</p>
            </div>
            <div class="contract-grid">
              <div>
                <h4>Numeriaが持つもの</h4>
                <ul>${listItems(contractStatus.owns)}</ul>
              </div>
              <div>
                <h4>持たないもの</h4>
                <ul>${listItems(contractStatus.notOwned)}</ul>
              </div>
              <div>
                <h4>外に出さないもの</h4>
                <ul>${listItems(contractStatus.neverShare)}</ul>
              </div>
              <div>
                <h4>イベント</h4>
                <ul>${listItems(contractStatus.events)}</ul>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>`;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-field]').forEach((element) => element.addEventListener('input', (event) => {
    const field = event.target.dataset.field;
    form = { ...form, [field]: event.target.value };
    if (field === 'reportBody') {
      form.reportDirty = true;
    } else if (!form.reportDirty) {
      form.reportBody = buildReport(form);
      document.querySelector('.report-editor').value = form.reportBody;
    }
    saveForm();
    updateStatus();
  }));
  document.querySelector('[data-action="start-session"]').addEventListener('click', startSession);
  document.querySelector('[data-action="complete-session"]')?.addEventListener('click', completeSession);
  document.querySelector('[data-action="export-refs"]')?.addEventListener('click', exportReferenceJson);
  document.querySelector('[data-action="regenerate"]').addEventListener('click', () => {
    regenerateReport();
  });
  document.querySelector('[data-action="generate-report-link"]')?.addEventListener('click', (event) => {
    event.preventDefault();
    regenerateReport();
    requestAnimationFrame(() => document.querySelector('#report-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  });
  document.querySelector('[data-action="reset"]').addEventListener('click', () => {
    form = mergeUrlContext({ ...initialForm, reportBody: buildReport(initialForm), reportDirty: false });
    localStorage.removeItem(storeKey);
    saveForm();
    render();
  });
  document.querySelector('[data-action="print"]').addEventListener('click', () => window.print());
  document.querySelector('[data-action="copy"]').addEventListener('click', async (event) => {
    await navigator.clipboard.writeText(form.reportBody);
    event.target.textContent = 'コピー済み';
    setTimeout(() => { event.target.textContent = 'コピー'; }, 1600);
  });
}

function startSession() {
  form = {
    ...form,
    sessionId: form.sessionId || createId('session'),
    sessionStatus: 'started',
    reportId: form.reportId || createId('report'),
    reportStatus: form.reportStatus || 'draft',
    completedAt: '',
  };
  saveForm();
  upsertAppraisalSessionHistory();
  render();
}

function regenerateReport() {
  form = {
    ...form,
    reportBody: buildReport(form),
    reportDirty: false,
    reportStatus: 'generated',
    reportId: form.reportId || createId('report'),
  };
  saveForm();
  upsertAppraisalSessionHistory();
  render();
}

function completeSession() {
  form = {
    ...form,
    sessionId: form.sessionId || createId('session'),
    sessionStatus: 'completed',
    reportId: form.reportId || createId('report'),
    reportStatus: 'generated',
    reportBody: form.reportBody || buildReport(form),
    reportDirty: false,
    completedAt: new Date().toISOString(),
  };
  saveForm();
  upsertAppraisalSessionHistory();
  render();
}

function buildReferenceExport() {
  return {
    appName: 'numeria-studio',
    status: 'success',
    sourceApp: 'numeria-studio',
    targetApp: 'growth-engine',
    workspaceId: form.growthContext?.workspaceId || '',
    userId: form.growthContext?.userId || '',
    reservationId: form.growthContext?.reservationId || '',
    customerId: form.growthContext?.customerId || '',
    sessionId: form.sessionId || '',
    sessionStatus: form.sessionStatus || '',
    reportId: form.reportId || '',
    reportRef: form.reportId ? `report:${form.reportId}` : '',
    reportStatus: form.reportStatus || '',
    eventName: form.sessionStatus === 'completed' ? 'studio.session.completed.v1' : 'studio.session.started.v1',
    completedAt: form.completedAt || '',
    dataSafety: {
      reportBodyIncluded: false,
      pdfBodyIncluded: false,
      clientNameIncluded: false,
      birthdayIncluded: false,
      paymentStatusIncluded: false,
      salesAmountIncluded: false,
      fullMeetingTranscriptIncluded: false,
    },
  };
}

function exportReferenceJson(event) {
  const payload = JSON.stringify(buildReferenceExport(), null, 2);
  const blob = new Blob([`${payload}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${form.sessionId || 'session'}-refs.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  event.target.textContent = '参照IDを書き出し済み';
  setTimeout(() => { event.target.textContent = '参照ID JSON'; }, 1600);
}

function updateStatus() {
  const status = document.querySelector('.status-text');
  if (status) status.textContent = form.reportDirty ? '手動編集済み。再生成すると本文が上書きされます。' : '入力内容から生成された本文です。';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
}


form = mergeUrlContext(loadForm());
if (!form.reportBody) form.reportBody = buildReport(form);
saveForm();

render();
