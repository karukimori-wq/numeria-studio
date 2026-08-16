const operationalLinks = [
  { label: 'Health', href: '/health' },
  { label: 'Version', href: '/version' },
  { label: 'Contracts Status', href: '/contracts/status' },
  { label: 'Production Flow', href: '/contracts/production-flow-result' },
  { label: 'Data Boundaries', href: '/contracts/data-boundaries' },
  { label: 'Operational Manifest', href: '/contracts/operational-manifest' },
  { label: 'UI Readiness', href: '/contracts/ui-readiness' },
];

function createOperationalLinksPanel() {
  if (document.querySelector('.operational-links')) return;

  const panel = document.createElement('section');
  panel.className = 'operational-links';
  panel.setAttribute('aria-label', 'Operational contract links');
  panel.style.cssText = [
    'margin: 16px auto',
    'max-width: 1040px',
    'padding: 14px',
    'border: 1px solid rgba(15, 23, 42, 0.12)',
    'border-radius: 8px',
    'background: #fff',
    'box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06)',
  ].join(';');

  const heading = document.createElement('h2');
  heading.textContent = 'Operational Links';
  heading.style.cssText = 'margin: 0 0 8px; font-size: 16px; line-height: 1.4;';

  const note = document.createElement('p');
  note.textContent = '公開確認用。Growth Engineへ返すのは sessionId / reportId / reportRef などの参照IDのみです。';
  note.style.cssText = 'margin: 0 0 10px; color: #475569; font-size: 13px; line-height: 1.6;';

  const list = document.createElement('div');
  list.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px;';

  for (const link of operationalLinks) {
    const anchor = document.createElement('a');
    anchor.href = link.href;
    anchor.textContent = link.label;
    anchor.style.cssText = [
      'display: inline-flex',
      'align-items: center',
      'min-height: 32px',
      'padding: 0 10px',
      'border-radius: 999px',
      'background: #f8fafc',
      'color: #0f172a',
      'font-size: 13px',
      'font-weight: 600',
      'text-decoration: none',
      'border: 1px solid rgba(15, 23, 42, 0.10)',
    ].join(';');
    list.append(anchor);
  }

  panel.append(heading, note, list);
  document.body.append(panel);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createOperationalLinksPanel, { once: true });
} else {
  createOperationalLinksPanel();
}

export { createOperationalLinksPanel, operationalLinks };
