/* ================================================================
   zones.js — 11 區總覽頁 (T-014)
   ================================================================ */

let _zonesChannel = null;
let _zonesDelegateStatus = null;

function _cleanupZonesPage() {
  if (_zonesChannel) {
    supabaseClient.removeChannel(_zonesChannel);
    _zonesChannel = null;
  }
}

async function renderZonesPage() {
  const container = document.createElement('div');
  container.className = 'layout-mobile';

  container.innerHTML = `
    <header class="layout-mobile__header">
      <span class="layout-mobile__header-title">題區</span>
      <span class="data-label" style="font-size:var(--text-2xs);color:var(--color-text-muted)">共 11 區</span>
    </header>
    <main class="layout-mobile__content" id="zonesContent">
      <div style="text-align:center;padding:var(--space-8) 0;">
        <div class="subtitle-cyber">載入中...</div>
      </div>
    </main>
  `;

  setTimeout(() => _initZonesPage(), 0);
  return container;
}

async function _initZonesPage() {
  const content = document.getElementById('zonesContent');
  if (!content) return;

  try {
    const profile = await UsersAPI.getCurrentProfile();
    _zonesDelegateStatus = profile?.delegate_status || 'alternate';
    const zones = await ZonesAPI.getAllZones();
    _renderZonesGrid(content, zones);
    _subscribeZoneLocks();
  } catch (err) {
    console.error('_initZonesPage:', err);
    content.innerHTML = `
      <div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">
        載入失敗，請重新整理頁面
      </div>
    `;
  }
}

function _renderZonesGrid(content, zones) {
  content.innerHTML = `
    <div class="zone-grid">
      ${zones.map(z => _renderZoneCard(z)).join('')}
    </div>
  `;

  // 綁定點擊事件
  content.querySelectorAll('.zone-card').forEach(card => {
    card.addEventListener('click', () => {
      const zoneId = card.dataset.zoneId;
      Router.navigate('zones/' + zoneId);
    });
  });
}

function _renderZoneCard(zone) {
  const hasQuestion = zone.questions && zone.questions.content;
  const isLocked = zone.is_locked;

  let statusBadge, statusClass;
  if (isLocked) {
    statusBadge = '已鎖定';
    statusClass = 'zone-card__status--locked';
  } else if (hasQuestion) {
    statusBadge = '進行中';
    statusClass = 'zone-card__status--active';
  } else {
    statusBadge = '空白';
    statusClass = 'zone-card__status--empty';
  }

  const questionPreview = hasQuestion
    ? `<p class="zone-card__question">${_escapeHtml(zone.questions.content)}</p>`
    : `<p class="zone-card__question zone-card__question--empty">尚無題目</p>`;

  return `
    <div class="zone-card" data-zone-id="${zone.id}">
      <div class="zone-card__corners">
        <span class="bc-corner bc-corner--tl"></span>
        <span class="bc-corner bc-corner--tr"></span>
        <span class="bc-corner bc-corner--bl"></span>
        <span class="bc-corner bc-corner--br"></span>
      </div>
      <div class="zone-card__header">
        <span class="zone-card__id">${zone.zone_name}</span>
        <span class="zone-card__status ${statusClass}">${statusBadge}</span>
      </div>
      ${questionPreview}
      <div class="zone-card__footer">
        <span class="zone-card__icon">
          ${isLocked
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
            : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
          }
        </span>
        <span class="zone-card__action">進入 &rarr;</span>
      </div>
      ${_zonesDelegateStatus !== 'parliament' ? '<div style="text-align:right;margin-top:var(--space-2);"><span class="badge badge--delegate-alt">預覽</span></div>' : ''}
    </div>
  `;
}

function _subscribeZoneLocks() {
  _zonesChannel = supabaseClient
    .channel('zone-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'zones'
    }, () => {
      // 重新載入全部區域資料
      _reloadZones();
    })
    .subscribe();
}

async function _reloadZones() {
  const content = document.getElementById('zonesContent');
  if (!content) return;
  try {
    const zones = await ZonesAPI.getAllZones();
    _renderZonesGrid(content, zones);
  } catch (err) {
    console.error('_reloadZones:', err);
  }
}

function _escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
