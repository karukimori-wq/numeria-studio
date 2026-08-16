const safetyChecklistMarkup = `
  <div class="safety-checklist" aria-label="Growth Engineへ戻る前の安全確認">
    <div>
      <p class="eyebrow small">Reference Safety</p>
      <h3>Growth Engineへ戻す内容</h3>
    </div>
    <ul>
      <li><span aria-hidden="true">OK</span><div><strong>参照IDのみ</strong><p>workspaceId / userId / reservationId / customerId / sessionId / reportId / reportRef</p></div></li>
      <li><span aria-hidden="true">OK</span><div><strong>Report本文なし</strong><p>Report本文、PDF本文、鑑定本文はGrowth Engineへ返しません</p></div></li>
      <li><span aria-hidden="true">OK</span><div><strong>顧客マスターなし</strong><p>個人名、生年月日、メール、Customer masterは返しません</p></div></li>
      <li><span aria-hidden="true">OK</span><div><strong>売上情報なし</strong><p>paymentStatus、salesAmount、支払い情報、売上情報は返しません</p></div></li>
      <li><span aria-hidden="true">OK</span><div><strong>全文記録なし</strong><p>fullMeetingTranscript、全文カルテ、機密Prompt、APIキーは返しません</p></div></li>
    </ul>
  </div>`;

function ensureReferenceSafetyChecklist() {
  if (document.querySelector('.safety-checklist')) return;
  const resultBox = document.querySelector('.start-panel .result-box');
  if (!resultBox) return;
  resultBox.insertAdjacentHTML('afterend', safetyChecklistMarkup);
}

ensureReferenceSafetyChecklist();
document.addEventListener('click', () => setTimeout(ensureReferenceSafetyChecklist, 0));
