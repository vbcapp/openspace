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

/* Zone LOGO 映射 */
const _ZONE_LOGOS = {
  1: 'assets/zone-logos/驕傲之塔_傲慢.png',
  2: 'assets/zone-logos/全知之貪_貪婪.png',
  3: 'assets/zone-logos/色慾之鏡_色慾.png',
  4: 'assets/zone-logos/暴食之腦.png',
  5: 'assets/zone-logos/存在之墓_怠惰.png',
  6: 'assets/zone-logos/全知之怒_憤怒.png',
  7: 'assets/zone-logos/完美之妒_忌妒.png',
  8: null, // cross-zone 用 X 圖示
};

/* DEV: mock data for preview without auth */
const _MOCK_ZONES = [
  { id: 1, zone_name: 'PRIDE // 驕傲之塔', is_locked: false, questions: { content: '如果AI能<span class="invert-hl">完美預測</span>每個人的未來，你會選擇知道自己的命運嗎？' } },
  { id: 2, zone_name: 'GREED // 全知之貪', is_locked: false, questions: { content: '當AI掌握了全球<span class="invert-hl">財富分配</span>的權力，你願意讓它決定你能擁有多少？' } },
  { id: 3, zone_name: 'LUST // 色慾之鏡', is_locked: true, questions: { content: '如果AI能創造出<span class="invert-hl">完美的虛擬伴侶</span>，你還會追求真實的人際關係嗎？' } },
  { id: 4, zone_name: 'GLUTTONY // 暴食之腦', is_locked: false, questions: { content: '當AI可以直接向你的大腦<span class="invert-hl">注入快樂</span>，你會放棄真實的體驗嗎？' } },
  { id: 5, zone_name: 'SLOTH // 存在之墓', is_locked: false, questions: null },
  { id: 6, zone_name: 'WRATH // 全知之怒', is_locked: false, questions: { content: '如果AI判定某人未來會犯罪，你支持在他<span class="invert-hl">行動之前</span>就逮捕他嗎？' } },
  { id: 7, zone_name: 'ENVY // 完美之妒', is_locked: true, questions: { content: '當AI讓每個人都能擁有<span class="invert-hl">完美的外貌</span>，「美」還有意義嗎？' } },
  { id: 8, zone_name: 'CROSS-ZONE // 跨區極限', is_locked: false, questions: { content: '如果必須在<span class="invert-hl">人類自由意志</span>和AI帶來的世界和平之間選擇，你選哪個？' } },
];

async function _initZonesPage() {
  const content = document.getElementById('zonesContent');
  if (!content) return;

  try {
    let profile = null;
    let zones = [];
    try {
      profile = await UsersAPI.getCurrentProfile();
      zones = await ZonesAPI.getAllZones();
    } catch (e) {
      console.warn('API failed, using mock data');
    }
    // DEV fallback: always use mock for preview (no auth session)
    if (!profile) {
      console.warn('No auth session — using mock zones data for preview');
      zones = _MOCK_ZONES;
    }
    _zonesDelegateStatus = profile?.delegate_status || 'parliament';
    _renderZonesGrid(content, zones);
    try { _subscribeZoneLocks(); } catch(e) {}
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
    <div class="text-center blink" style="font-size:0.875rem;margin-bottom:12px;color:var(--color-blood-red);">/// CHOOSE YOUR SIN ///</div>
    <div class="zone-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      ${zones.map(z => _renderZoneCard(z)).join('')}
    </div>
  `;

  // 綁定點擊事件
  content.querySelectorAll('.zone-btn-1bit').forEach(card => {
    card.addEventListener('click', () => {
      const zoneId = card.dataset.zoneId;
      Router.navigate('zones/' + zoneId);
    });
  });
}

function _renderZoneCard(zone) {
  const hasQuestion = zone.questions && zone.questions.content;
  const isLocked = zone.is_locked;
  const logo = _ZONE_LOGOS[zone.id];
  const isCross = zone.id === 8;

  // 解析英文 + 中文名稱
  const nameParts = zone.zone_name.split(' // ');
  const enName = nameParts[0] || zone.zone_name;
  const zhName = nameParts[1] || '';

  let statusTag = '';
  if (isLocked) statusTag = '<span style="font-size:0.7rem;opacity:0.6;margin-left:auto;">[LOCKED]</span>';
  else if (hasQuestion) statusTag = '<span style="font-size:0.7rem;opacity:0.6;margin-left:auto;">[ACTIVE]</span>';

  const logoHtml = isCross
    ? `<div style="width:36px;height:36px;flex-shrink:0;border:2px solid var(--color-blood-red);display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:bold;">X</div>`
    : (logo
      ? `<img src="${logo}" alt="${enName}" style="width:36px;height:36px;object-fit:contain;flex-shrink:0;filter:brightness(0) invert(31%) sepia(98%) saturate(6630%) hue-rotate(10deg) brightness(103%) contrast(107%);">`
      : '');

  return `
    <div class="zone-btn-1bit ${isCross ? 'zone-btn-cross-1bit' : ''}" data-zone-id="${zone.id}"
         style="border:2px solid var(--color-blood-red);padding:10px;cursor:pointer;transition:0s;display:flex;align-items:center;gap:10px;${isCross ? 'grid-column:1/-1;' : ''}"
         onmouseenter="this.style.background='var(--color-blood-red)';this.style.color='#000';"
         onmouseleave="this.style.background='';this.style.color='';">
      ${logoHtml}
      <div style="min-width:0;flex:1;">
        <div style="font-size:1rem;font-weight:bold;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${enName}</div>
        <div style="font-size:0.7rem;opacity:0.7;">${zhName}</div>
      </div>
      ${statusTag}
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
