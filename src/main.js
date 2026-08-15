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
const contractStatus = {
  identityMode: 'workspaceId + userId',
  owns: ['Session', 'Report', '鑑定メモ'],
  referencesOnly: ['Growth Engine の customerId / reservationId', 'AI Activity の activityId', 'Communication Planner の conversationId / replyDraftId'],
  notOwned: ['Customer', 'Payment', 'Sales', 'MessageDraft', 'Velvet Visit / Memory / Note', 'Conversation / Message', 'ReplyDraft / SafetyCheck'],
  neverShare: ['支払い状態', '売上金額', 'Report本文', '鑑定本文', '会話本文', '全文メモ', 'APIキー', '機密Prompt'],
  events: ['studio.session.started.v1', 'studio.report.generated.v1'],
};

let form;


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

function render() {
  document.querySelector('#root').innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <div>
          <p class="eyebrow">✦ Numeria Studio</p>
          <h1>占い師向け鑑定書ツール</h1>
          <p class="lead">相談内容と鑑定メモを入力し、用途別テンプレートで下書きを生成。本文はそのまま編集して納品できます。</p>
        </div>
        <button class="ghost-button" data-action="reset">↻ リセット</button>
      </section>
      <div class="workspace">
        <form class="panel input-panel">
          <h2>鑑定情報</h2>
          <label>お名前<input data-field="clientName" value="${escapeHtml(form.clientName)}" placeholder="例：山田 花子" /></label>
          <label>生年月日<input data-field="birthday" type="date" value="${form.birthday}" /></label>
          <label>テンプレート<select data-field="templateType">${objectOptionTags(templateTypes, form.templateType)}</select></label>
          <label>テーマ<select data-field="theme">${optionTags(themes, form.theme)}</select></label>
          <label>占術<select data-field="method">${optionTags(methods, form.method)}</select></label>
          <label>文章トーン<select data-field="tone">${optionTags(tones, form.tone)}</select></label>
          <label>対象期間<input data-field="actionPeriod" value="${escapeHtml(form.actionPeriod)}" /></label>
          <label>相談内容<textarea data-field="concern" placeholder="相談者の悩みや背景を入力">${escapeHtml(form.concern)}</textarea></label>
          <label>鑑定メモ<textarea data-field="resultNotes" placeholder="カード結果、星回り、数秘の解釈など">${escapeHtml(form.resultNotes)}</textarea></label>
          <section class="contract-note" aria-label="連携メモ">
            <h3>連携メモ</h3>
            <p>Numeria Studio は鑑定とReportを作る場所です。お客様台帳、支払い、売上、会話、返信、安全確認、Velvetの記録は持ちません。</p>
            <dl>
              <div><dt>受け取るID</dt><dd>${escapeHtml(contractStatus.referencesOnly[0])}</dd></div>
              <div><dt>外へ返すID</dt><dd>sessionId / reportId / customerId</dd></div>
            </dl>
          </section>
        </form>
        <section class="panel report-panel">
          <div class="report-header">
            <div>
              <h2>📄 編集できる鑑定書</h2>
              <p class="status-text">${form.reportDirty ? '手動編集済み。再生成すると本文が上書きされます。' : '入力内容から生成された本文です。'}</p>
            </div>
            <div class="actions">
              <button data-action="regenerate" type="button">✨ 再生成</button>
              <button data-action="copy" type="button">📋 コピー</button>
              <button data-action="print" type="button">🖨 印刷</button>
            </div>
          </div>
          <textarea class="report-editor" data-field="reportBody">${escapeHtml(form.reportBody)}</textarea>
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
  document.querySelector('[data-action="regenerate"]').addEventListener('click', () => {
    form = { ...form, reportBody: buildReport(form), reportDirty: false };
    saveForm();
    render();
  });
  document.querySelector('[data-action="reset"]').addEventListener('click', () => {
    form = { ...initialForm, reportBody: buildReport(initialForm), reportDirty: false };
    localStorage.removeItem(storeKey);
    render();
  });
  document.querySelector('[data-action="print"]').addEventListener('click', () => window.print());
  document.querySelector('[data-action="copy"]').addEventListener('click', async (event) => {
    await navigator.clipboard.writeText(form.reportBody);
    event.target.textContent = '✓ コピー済み';
    setTimeout(() => { event.target.textContent = '📋 コピー'; }, 1600);
  });
}

function updateStatus() {
  const status = document.querySelector('.status-text');
  if (status) status.textContent = form.reportDirty ? '手動編集済み。再生成すると本文が上書きされます。' : '入力内容から生成された本文です。';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
}


form = loadForm();
if (!form.reportBody) form.reportBody = buildReport(form);

render();
