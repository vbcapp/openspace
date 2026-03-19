/* ================================================================
   admin-members.js — 管理員成員管理頁
   管理議會代表與備選代表身分
   ================================================================ */

function renderAdminMembersPage() {
  const container = document.createElement('div');
  container.className = 'layout-mobile vignette';
  container.style.position = 'relative';

  container.innerHTML = `
    <div class="fx-crt"></div>
    <span class="fx-corner fx-corner--tl"></span>
    <span class="fx-corner fx-corner--tr"></span>
    <span class="fx-corner fx-corner--bl"></span>
    <span class="fx-corner fx-corner--br"></span>

    <header class="layout-mobile__header">
      <button class="btn btn--ghost" id="adminMembersBackBtn" style="font-size:var(--text-xs);padding:var(--space-1) var(--space-2);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        返回
      </button>
      <span class="layout-mobile__header-title fx-text-glitch" data-text="成員管理">成員管理</span>
      <div style="width:48px;"></div>
    </header>
    <main class="layout-mobile__content" id="adminMembersContent">
      <div style="text-align:center;padding:var(--space-8) 0;">
        <div class="subtitle-cyber fx-text-glitch" data-text="載入中...">載入中...</div>
      </div>
    </main>
  `;

  setTimeout(() => _initAdminMembers(), 0);

  setTimeout(() => {
    const backBtn = document.getElementById('adminMembersBackBtn');
    if (backBtn) backBtn.addEventListener('click', () => Router.navigate('profile'));
  }, 0);

  return container;
}

async function _initAdminMembers() {
  const content = document.getElementById('adminMembersContent');
  if (!content) return;

  try {
    const profile = await UsersAPI.getCurrentProfile();
    if (!profile || profile.role !== 'admin') {
      content.innerHTML = `
        <div style="text-align:center;padding:var(--space-8) 0;">
          <div class="subtitle-cyber">權限不足</div>
          <p style="color:var(--color-text-muted);margin-top:var(--space-2);font-family:var(--font-ui);font-size:var(--text-sm);">
            僅管理員可存取此頁面
          </p>
        </div>
      `;
      return;
    }

    await _loadMembersList(content, profile.id);
  } catch (err) {
    console.error('_initAdminMembers:', err);
    content.innerHTML = `
      <div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">
        載入失敗，請重新整理頁面
      </div>
    `;
  }
}

async function _loadMembersList(content, adminId) {
  const members = await AdminAPI.getAllMembers();
  const parliamentCount = members.filter(m => m.delegate_status === 'parliament').length;

  content.innerHTML = `
    <div class="admin-members__stats">
      <span>議會代表 <strong>${parliamentCount}</strong> / 總人數 <strong>${members.length}</strong></span>
    </div>
    <div class="admin-members__search">
      <svg class="admin-members__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" id="memberSearchInput" class="admin-members__search-input" placeholder="搜尋成員名稱或編號..." autocomplete="off" />
    </div>
    <div class="admin-members__list" id="membersList">
      ${members.map(m => _renderMemberItem(m, adminId)).join('')}
    </div>
  `;

  // 搜尋過濾
  const searchInput = document.getElementById('memberSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const keyword = searchInput.value.trim().toLowerCase();
      content.querySelectorAll('.member-item').forEach(item => {
        const name = item.querySelector('.vote-chip__name')?.textContent?.toLowerCase() || '';
        const number = item.querySelector('.vote-chip__number')?.textContent?.toLowerCase() || '';
        item.style.display = (name.includes(keyword) || number.includes(keyword)) ? '' : 'none';
      });
    });
  }

  // 綁定 toggle 事件
  content.querySelectorAll('.toggle-switch input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const userId = e.target.dataset.userId;
      const isChecked = e.target.checked;
      const item = e.target.closest('.member-item');

      // 禁止操作中重複點擊
      e.target.disabled = true;
      if (item) item.style.opacity = '0.5';

      try {
        if (isChecked) {
          await AdminAPI.promoteToParliament(userId);
        } else {
          await AdminAPI.demoteToAlternate(userId);
        }
        // 重新載入列表
        await _loadMembersList(content, adminId);
      } catch (err) {
        console.error('toggleDelegate:', err);
        // 還原 toggle 狀態
        e.target.checked = !isChecked;
        e.target.disabled = false;
        if (item) item.style.opacity = '1';
        alert('操作失敗：' + (err.message || '未知錯誤'));
      }
    });
  });
}

function _renderMemberItem(member, adminId) {
  const isParliament = member.delegate_status === 'parliament';
  const isSelf = member.id === adminId;
  const numberDisplay = member.player_number
    ? '#' + String(member.player_number).padStart(3, '0')
    : '#---';
  const avatarSrc = member.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=P${member.id.slice(0, 6)}`;
  const badgeClass = isParliament ? 'badge--delegate-parliament' : 'badge--delegate-alt';
  const badgeText = isParliament ? '議會代表' : '備選代表';

  return `
    <div class="vote-chip member-item">
      <div class="vote-chip__profile">
        <div class="vote-chip__avatar">
          <img src="${avatarSrc}" alt="${member.display_name}" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=P${member.id.slice(0, 6)}'">
        </div>
        <div class="vote-chip__info">
          <span class="vote-chip__number">${numberDisplay}</span>
          <span class="vote-chip__name">${member.display_name}</span>
        </div>
      </div>
      <div class="member-item__status">
        <span class="badge ${badgeClass}">${badgeText}</span>
        <label class="toggle-switch">
          <input type="checkbox" data-user-id="${member.id}" ${isParliament ? 'checked' : ''} ${isSelf ? 'disabled' : ''} />
          <span class="toggle-switch__slider"></span>
        </label>
      </div>
    </div>
  `;
}
