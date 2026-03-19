/* ================================================================
   profile.js — 個人頁（名片展示 + 編輯模式 + 一鍵活動登入）
   連接 Supabase 資料庫
   ================================================================ */

/* URL → 平台標籤 */
function _getLinkTag(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('line.me')) return 'LINE';
    if (host.includes('github.com')) return 'GITHUB';
    if (host.includes('instagram.com')) return 'IG';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'X';
    if (host.includes('facebook.com')) return 'FB';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YT';
    if (host.includes('linkedin.com')) return 'LINKEDIN';
    if (host.includes('threads.net')) return 'THREADS';
    if (host.includes('discord')) return 'DISCORD';
    if (host.includes('t.me') || host.includes('telegram')) return 'TG';
    return 'LINK';
  } catch { return 'LINK'; }
}

/* 當前用戶 profile 快取（頁面內使用） */
let _currentProfile = null;

function renderProfilePage() {
  const container = document.createElement('div');
  container.className = 'layout-mobile vignette';
  container.style.position = 'relative';

  container.innerHTML = `
    <!-- CRT 掃描線覆蓋層 -->
    <div class="fx-crt"></div>

    <!-- 四角標記 -->
    <span class="fx-corner fx-corner--tl"></span>
    <span class="fx-corner fx-corner--tr"></span>
    <span class="fx-corner fx-corner--bl"></span>
    <span class="fx-corner fx-corner--br"></span>

    <header class="layout-mobile__header">
      <span class="layout-mobile__header-title fx-text-glitch" data-text="個人資料">個人資料</span>
      <button class="btn btn--ghost" id="logoutBtn" style="font-size:var(--text-xs);padding:var(--space-1) var(--space-2);">
        登出
      </button>
    </header>
    <main class="layout-mobile__content" id="profileContent">
      <div style="text-align:center;padding:var(--space-8) 0;">
        <div class="subtitle-cyber fx-text-glitch" data-text="載入中...">載入中...</div>
      </div>
    </main>
  `;

  // 載入完成後抓資料
  setTimeout(() => _loadProfile(), 0);

  // 登出按鈕
  setTimeout(() => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await Auth.signOut();
        window.location.href = 'login.html';
      });
    }
  }, 0);

  return container;
}

/* ── 載入用戶資料 ── */
async function _loadProfile() {
  const content = document.getElementById('profileContent');
  if (!content) return;

  try {
    _currentProfile = await UsersAPI.getCurrentProfile();
    if (!_currentProfile) {
      window.location.href = 'login.html';
      return;
    }
    _renderCardView(content);

    // 升級通知
    if (_currentProfile.promotion_seen === false) {
      _showPromotionToast();
      UsersAPI.markPromotionSeen();
    }
  } catch (err) {
    console.error('_loadProfile:', err);
    content.innerHTML = `
      <div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">
        載入失敗，請重新整理頁面
      </div>
    `;
  }
}

/* ── 名片展示模式 ── */
function _renderCardView(container) {
  const user = _currentProfile;
  const isOnline = user.is_online;
  const avatarSrc = user.avatar_url || 'https://api.dicebear.com/7.x/cyberpunk/svg?seed=' + (user.player_number || user.id.slice(0, 6)) + '&backgroundColor=1a0005';
  const numberDisplay = user.player_number ? '#' + String(user.player_number).padStart(3, '0') : '#---';
  const isParliament = user.delegate_status === 'parliament';
  const delegateBadgeClass = isParliament ? 'badge--delegate-parliament' : 'badge--delegate-alt';
  const delegateBadgeText = isParliament ? '議會代表' : '備選代表';

  container.innerHTML = `
    <!-- 名片卡 -->
    <div class="business-card">
      <!-- 閃爍干擾帶掃描線 -->
      <div class="fx-scanline-glitch" id="profileScanline"></div>
      <div class="business-card__corners">
        <span class="bc-corner bc-corner--tl"></span>
        <span class="bc-corner bc-corner--tr"></span>
        <span class="bc-corner bc-corner--bl"></span>
        <span class="bc-corner bc-corner--br"></span>
      </div>

      <div class="business-card__avatar-section">
        <div class="business-card__avatar-ring ${isOnline ? 'business-card__avatar-ring--online' : ''}">
          <img
            src="${avatarSrc}"
            alt="Avatar"
            class="avatar-profile"
          />
        </div>
        <div class="business-card__number fx-text-glitch" data-text="${numberDisplay}">${numberDisplay}</div>
        <span class="badge ${delegateBadgeClass}" style="margin-top:var(--space-2);">${delegateBadgeText}</span>
      </div>

      <h1 class="business-card__name ui-text fx-text-glitch" data-text="${user.display_name}">
        ${user.display_name}
      </h1>

      <hr class="divider" />

      <p class="business-card__bio">${user.bio || '尚未填寫自我介紹'}</p>

      <!-- 連結 -->
      ${(user.links && user.links.length > 0) ? `
      <div class="business-card__links">
        ${user.links.map(link => `
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="business-card__link">
            <span class="business-card__link-prompt">&gt;</span>
            <span class="business-card__link-name">${link.name}</span>
            <span class="business-card__link-tag">${_getLinkTag(link.url)}</span>
            <span class="business-card__link-cursor"></span>
          </a>
        `).join('')}
      </div>
      ` : ''}

      <!-- 登入狀態 -->
      <div class="business-card__status">
        <div class="status-light">
          <span class="status-light__dot ${isOnline ? 'status-light__dot--online fx-pulse-green' : 'status-light__dot--offline'}"></span>
          <span class="status-light__text">${isOnline ? '已登入活動' : '未登入活動'}</span>
        </div>
      </div>

      <!-- 活動登入（未登入時顯示） -->
      ${isOnline ? '' : `
      <div id="eventLoginSection" style="margin-top:var(--space-4);">
        <button class="btn btn--primary btn--full" id="eventLoginBtn">登入活動</button>
      </div>
      `}

      <hr class="divider" />

      <button class="btn btn--secondary btn--full" id="previewCardBtn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        名片預覽
      </button>

      <button class="btn btn--ghost btn--full mt-2" id="editProfileBtn" style="font-size:var(--text-sm);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        編輯個人資料
      </button>
    </div>

    <!-- 管理員面板（僅 admin 可見） -->
    ${user.role === 'admin' ? `
    <section class="admin-panel mt-6">
      <h2 class="admin-panel__title fx-text-glitch" data-text="管理員控制台">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        管理員控制台
      </h2>

      <!-- 成員管理 -->
      <div class="admin-panel__section">
        <div class="admin-panel__label">成員管理</div>
        <p class="admin-panel__desc">管理議會代表與備選代表身分。</p>
        <button class="btn btn--secondary btn--full" id="adminMembersBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          成員管理
        </button>
      </div>

      <hr class="divider" />

      <!-- 全體離線 -->
      <div class="admin-panel__section">
        <div class="admin-panel__label">全體離線</div>
        <p class="admin-panel__desc">將所有在線玩家強制設為離線狀態，矩陣牆即時切換為雜訊狀態。</p>
        <button class="btn btn--primary btn--full" id="adminForceOfflineBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
            <line x1="12" y1="2" x2="12" y2="12"></line>
          </svg>
          全體離線
        </button>
        <div id="adminForceOfflineMsg" class="admin-panel__msg" style="display:none;"></div>
      </div>

      <hr class="divider" />

      <!-- 修改活動密碼 -->
      <div class="admin-panel__section">
        <div class="admin-panel__label">修改活動密碼</div>
        <p class="admin-panel__desc">設定或修改玩家登入活動所需的密碼。</p>
        <div class="form-field">
          <input type="text" class="input" id="adminNewPassword" placeholder="輸入新活動密碼..." maxlength="20" />
        </div>
        <button class="btn btn--secondary btn--full" id="adminSetPwdBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          更新密碼
        </button>
        <div id="adminSetPwdMsg" class="admin-panel__msg" style="display:none;"></div>
      </div>
    </section>
    ` : ''}

    <!-- 我的作答紀錄（僅議會代表可見） -->
    ${isParliament ? `
    <section class="answer-history mt-6">
      <h2 class="answer-history__title fx-text-glitch" data-text="我的作答">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        我的作答
      </h2>
      <div id="answersContainer">
        <div style="text-align:center;padding:var(--space-4) 0;color:var(--color-text-muted);font-family:var(--font-mono);font-size:var(--text-xs);">
          載入中...
        </div>
      </div>
    </section>
    ` : ''}
  `;

  // 綁定事件
  const previewBtn = document.getElementById('previewCardBtn');
  if (previewBtn) previewBtn.addEventListener('click', () => {
    Router.navigate('player/' + playerSlug(user.display_name, user.player_number));
  });

  const editBtn = document.getElementById('editProfileBtn');
  if (editBtn) editBtn.addEventListener('click', () => _enterEditMode());

  const eventLoginBtn = document.getElementById('eventLoginBtn');
  if (eventLoginBtn) {
    eventLoginBtn.addEventListener('click', () => _eventLogin());
    _checkPasswordRequirement();
  }

  // 管理員面板事件
  if (user.role === 'admin') {
    _bindAdminPanelEvents();

    // 成員管理按鈕
    const membersBtn = document.getElementById('adminMembersBtn');
    if (membersBtn) membersBtn.addEventListener('click', () => Router.navigate('admin/members'));
  }

  // 載入作答紀錄（僅議會代表）
  if (isParliament) _loadAnswers();

  // 啟動隨機 glitch 特效
  _startProfileGlitch();
}

/* ── 管理員面板事件綁定 ── */
function _bindAdminPanelEvents() {
  // 全體離線
  const forceOfflineBtn = document.getElementById('adminForceOfflineBtn');
  if (forceOfflineBtn) {
    forceOfflineBtn.addEventListener('click', async () => {
      if (!confirm('確定要將所有玩家強制離線嗎？')) return;

      forceOfflineBtn.disabled = true;
      forceOfflineBtn.textContent = '執行中...';
      const msg = document.getElementById('adminForceOfflineMsg');

      try {
        const count = await AdminAPI.setAllOffline();
        if (msg) {
          msg.textContent = `已將 ${count} 位玩家設為離線`;
          msg.className = 'admin-panel__msg admin-panel__msg--success';
          msg.style.display = 'block';
        }
        // 更新自己的狀態
        _currentProfile.is_online = false;
      } catch (err) {
        console.error('forceOffline:', err);
        if (msg) {
          msg.textContent = '操作失敗：' + (err.message || '未知錯誤');
          msg.className = 'admin-panel__msg admin-panel__msg--error';
          msg.style.display = 'block';
        }
      }
      forceOfflineBtn.disabled = false;
      forceOfflineBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
          <line x1="12" y1="2" x2="12" y2="12"></line>
        </svg>
        全體離線
      `;
    });
  }

  // 修改密碼
  const setPwdBtn = document.getElementById('adminSetPwdBtn');
  if (setPwdBtn) {
    setPwdBtn.addEventListener('click', async () => {
      const input = document.getElementById('adminNewPassword');
      const msg = document.getElementById('adminSetPwdMsg');
      const pwd = input?.value.trim();

      if (!pwd) {
        if (input) input.classList.add('input--error');
        return;
      }

      setPwdBtn.disabled = true;
      setPwdBtn.textContent = '更新中...';
      if (input) input.classList.remove('input--error');

      try {
        await AppSettingsAPI.updateEventPassword(pwd);
        if (msg) {
          msg.textContent = '活動密碼已更新';
          msg.className = 'admin-panel__msg admin-panel__msg--success';
          msg.style.display = 'block';
        }
        if (input) input.value = '';
      } catch (err) {
        console.error('updatePassword:', err);
        if (msg) {
          msg.textContent = '更新失敗：' + (err.message || '未知錯誤');
          msg.className = 'admin-panel__msg admin-panel__msg--error';
          msg.style.display = 'block';
        }
      }
      setPwdBtn.disabled = false;
      setPwdBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        更新密碼
      `;
    });
  }
}

/* ── 檢查是否需要活動密碼，動態插入欄位 ── */
async function _checkPasswordRequirement() {
  try {
    const required = await AppSettingsAPI.isEventPasswordRequired();
    const section = document.getElementById('eventLoginSection');
    if (!section || !required) return;

    const pwdField = document.createElement('div');
    pwdField.className = 'form-field';
    pwdField.style.marginBottom = 'var(--space-3)';
    pwdField.innerHTML = `
      <label class="form-field__label">活動碼</label>
      <input
        type="password"
        class="input"
        id="eventPasswordInput"
        placeholder="輸入活動碼"
        maxlength="20"
      />
      <div id="eventPwdError" class="form-field__error" style="display:none;"></div>
    `;
    section.insertBefore(pwdField, section.firstChild);
  } catch (err) {
    console.error('_checkPasswordRequirement:', err);
  }
}

/* ── 登入活動（支援條件式密碼驗證） ── */
async function _eventLogin() {
  const btn = document.getElementById('eventLoginBtn');
  if (!btn) return;

  const pwdInput = document.getElementById('eventPasswordInput');
  const pwdError = document.getElementById('eventPwdError');

  // 如果密碼欄位存在，先驗證密碼
  if (pwdInput) {
    const inputPwd = pwdInput.value.trim();
    if (!inputPwd) {
      pwdInput.classList.add('input--error');
      if (pwdError) { pwdError.textContent = '請輸入活動碼'; pwdError.style.display = 'block'; }
      return;
    }

    btn.disabled = true;
    btn.textContent = '驗證中...';

    try {
      const correctPwd = await AppSettingsAPI.getEventPassword();
      if (inputPwd !== correctPwd) {
        pwdInput.classList.add('input--error');
        if (pwdError) { pwdError.textContent = '活動碼錯誤'; pwdError.style.display = 'block'; }
        btn.disabled = false;
        btn.textContent = '登入活動';
        return;
      }
    } catch (err) {
      console.error('Password check failed:', err);
      btn.disabled = false;
      btn.textContent = '登入活動';
      return;
    }
  }

  // 密碼正確或不需要密碼 → 登入
  btn.disabled = true;
  btn.textContent = '登入中...';

  try {
    await UsersAPI.setOnlineStatus(true);
    _currentProfile.is_online = true;
    const content = document.getElementById('profileContent');
    if (content) _renderCardView(content);
  } catch (err) {
    console.error('_eventLogin:', err);
    btn.disabled = false;
    btn.textContent = '登入活動';
  }
}

/* ── 載入作答紀錄 ── */
async function _loadAnswers() {
  const answersContainer = document.getElementById('answersContainer');
  if (!answersContainer) return;

  try {
    const answers = await AnswersAPI.getMyAnswers();

    if (answers.length === 0) {
      answersContainer.innerHTML = `
        <div class="answer-history__empty">
          <span class="subtitle-cyber">尚無紀錄</span>
          <p>尚未作答任何題目</p>
        </div>
      `;
      return;
    }

    answersContainer.innerHTML = answers.map(ans => `
      <div class="answer-card answer-card--clickable" data-question-id="${ans.question_id}" style="cursor:pointer;">
        <div class="answer-card__zone">${ans.questions?.zones?.zone_name || 'UNKNOWN ZONE'}</div>
        <div class="answer-card__question">${ans.questions?.content || ''}</div>
        <div class="answer-card__answer">
          <span class="answer-card__label">我的答案：</span>
          ${ans.content}
        </div>
        <div class="answer-card__time">${_formatTime(ans.updated_at || ans.created_at)}</div>
      </div>
    `).join('');

    // 點擊導航至作答頁修改
    answersContainer.querySelectorAll('.answer-card--clickable').forEach(card => {
      card.addEventListener('click', () => {
        const qId = card.dataset.questionId;
        if (qId) Router.navigate('answer/' + qId);
      });
    });
  } catch (err) {
    console.error('_loadAnswers:', err);
    answersContainer.innerHTML = `
      <div class="answer-history__empty">
        <span class="subtitle-cyber">載入失敗</span>
        <p>無法載入作答紀錄</p>
      </div>
    `;
  }
}

/* ── 隨機 Glitch 特效（仿矩陣頁） ── */
let _profileGlitchTimer = null;
let _profileScanlineTimer = null;

function _startProfileGlitch() {
  // 清除舊的 timer
  if (_profileGlitchTimer) clearTimeout(_profileGlitchTimer);
  if (_profileScanlineTimer) clearInterval(_profileScanlineTimer);

  // RGB 分裂閃爍（隨機）
  const run = () => {
    const card = document.querySelector('.business-card');
    if (!card) return;

    card.classList.add('fx-rgb-split');
    setTimeout(() => card.classList.remove('fx-rgb-split'), Math.random() * 200 + 80);

    _profileGlitchTimer = setTimeout(run, Math.random() * 4000 + 2000);
  };
  _profileGlitchTimer = setTimeout(run, Math.random() * 3000 + 1000);

  // 閃爍干擾帶掃描線（每 3 秒）
  _triggerScanline();
  _profileScanlineTimer = setInterval(_triggerScanline, 3000);
}

function _triggerScanline() {
  const el = document.getElementById('profileScanline');
  if (!el) return;

  // 移除再重加 class 以重新觸發動畫
  el.classList.remove('is-active');
  void el.offsetHeight;
  el.classList.add('is-active');

  // 動畫結束後隱藏（1.2s = 動畫時長）
  setTimeout(() => el.classList.remove('is-active'), 1250);
}

/* ── 升級通知 Toast ── */
function _showPromotionToast() {
  const toast = document.createElement('div');
  toast.className = 'promotion-toast';
  toast.textContent = '恭喜！你已被提升為議會代表！';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ── 編輯模式 ── */
function _enterEditMode() {
  const content = document.getElementById('profileContent');
  if (!content) return;

  const user = _currentProfile;
  const avatarSrc = user.avatar_url || 'https://api.dicebear.com/7.x/cyberpunk/svg?seed=' + (user.player_number || user.id.slice(0, 6)) + '&backgroundColor=1a0005';

  content.innerHTML = `
    <div class="profile-editor page-enter">
      <h2 class="profile-editor__title ui-text">編輯個人資料</h2>

      <!-- 頭像上傳區 -->
      <div class="profile-editor__avatar-section">
        <div class="profile-editor__avatar-wrapper">
          <img
            src="${avatarSrc}"
            alt="Avatar"
            class="avatar-profile"
            id="editAvatar"
          />
          <label class="profile-editor__avatar-overlay" for="avatarInput">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <span>更換頭像</span>
          </label>
          <input type="file" id="avatarInput" accept="image/jpeg,image/png,image/webp" class="hidden" />
        </div>
        <div class="business-card__number">${user.player_number ? '#' + String(user.player_number).padStart(3, '0') : '#---'}</div>
      </div>

      <!-- 表單 -->
      <div class="form-field">
        <label class="form-field__label">顯示名稱</label>
        <input
          type="text"
          class="input"
          id="editName"
          value="${user.display_name}"
          placeholder="輸入顯示名稱"
          maxlength="20"
        />
      </div>

      <div class="form-field">
        <label class="form-field__label">自我介紹</label>
        <textarea
          class="textarea"
          id="editBio"
          placeholder="介紹一下自己..."
          maxlength="200"
        >${user.bio || ''}</textarea>
        <span class="form-field__hint" id="bioCount">${(user.bio || '').length}/200</span>
      </div>

      <!-- 連結管理 -->
      <div class="form-field">
        <label class="form-field__label">連結</label>
        <div id="editLinksContainer"></div>
        <button type="button" class="btn btn--ghost btn--full mt-2" id="addLinkBtn" style="font-size:var(--text-sm);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          新增連結
        </button>
      </div>

      <!-- 儲存狀態 -->
      <div id="saveError" class="form-field__error" style="display:none;text-align:center;"></div>

      <!-- 操作按鈕 -->
      <div class="profile-editor__actions">
        <button class="btn btn--primary btn--full" id="saveProfileBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          儲存變更
        </button>
        <button class="btn btn--ghost btn--full mt-2" id="cancelEditBtn">
          取消
        </button>
      </div>
    </div>
  `;

  // Bio 字數計數
  const bioEl = document.getElementById('editBio');
  const bioCount = document.getElementById('bioCount');
  if (bioEl && bioCount) {
    bioEl.addEventListener('input', () => {
      bioCount.textContent = `${bioEl.value.length}/200`;
    });
  }

  // 頭像上傳
  document.getElementById('avatarInput')?.addEventListener('change', (e) => _handleAvatarUpload(e));

  // 連結管理
  _editLinks = Array.isArray(user.links) ? [...user.links] : [];
  _renderEditLinks();
  document.getElementById('addLinkBtn')?.addEventListener('click', () => {
    _editLinks.push({ name: '', url: '' });
    _renderEditLinks();
  });

  // 儲存
  document.getElementById('saveProfileBtn')?.addEventListener('click', () => _saveProfile());

  // 取消
  document.getElementById('cancelEditBtn')?.addEventListener('click', () => _cancelEdit());
}

/* ── 連結編輯 ── */
let _editLinks = [];

function _renderEditLinks() {
  const container = document.getElementById('editLinksContainer');
  if (!container) return;

  container.innerHTML = _editLinks.map((link, i) => `
    <div class="link-edit-row" data-index="${i}">
      <div class="link-edit-row__fields">
        <input type="text" class="input link-edit-row__name" placeholder="連結名稱" value="${link.name}" maxlength="30" data-index="${i}" />
        <input type="url" class="input link-edit-row__url" placeholder="https://..." value="${link.url}" data-index="${i}" />
      </div>
      <button type="button" class="btn btn--ghost link-edit-row__delete" data-index="${i}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');

  // 綁定輸入事件
  container.querySelectorAll('.link-edit-row__name').forEach(input => {
    input.addEventListener('input', (e) => {
      _editLinks[parseInt(e.target.dataset.index)].name = e.target.value;
    });
  });
  container.querySelectorAll('.link-edit-row__url').forEach(input => {
    input.addEventListener('input', (e) => {
      _editLinks[parseInt(e.target.dataset.index)].url = e.target.value;
    });
  });
  // 綁定刪除
  container.querySelectorAll('.link-edit-row__delete').forEach(btn => {
    btn.addEventListener('click', () => {
      _editLinks.splice(parseInt(btn.dataset.index), 1);
      _renderEditLinks();
    });
  });
}

/* ── 頭像上傳 ── */
async function _handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // 先顯示預覽
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('editAvatar');
    if (img) img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // 上傳到 Supabase Storage
  try {
    const url = await AvatarAPI.upload(file);
    _currentProfile.avatar_url = url;
  } catch (err) {
    console.error('Avatar upload failed:', err);
    const saveError = document.getElementById('saveError');
    if (saveError) {
      saveError.textContent = '頭像上傳失敗：' + (err.message || '未知錯誤');
      saveError.style.display = 'block';
    }
  }
}

/* ── 儲存個人資料 ── */
async function _saveProfile() {
  const name = document.getElementById('editName')?.value.trim();
  const bio = document.getElementById('editBio')?.value.trim();
  const saveBtn = document.getElementById('saveProfileBtn');
  const saveError = document.getElementById('saveError');

  if (!name) {
    document.getElementById('editName')?.classList.add('input--error');
    return;
  }

  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '儲存中...'; }
  if (saveError) saveError.style.display = 'none';

  try {
    // 過濾掉空的連結
    const validLinks = _editLinks.filter(l => l.name.trim() && l.url.trim()).map(l => ({ name: l.name.trim(), url: l.url.trim() }));
    const updated = await UsersAPI.updateProfile({ display_name: name, bio: bio || null, links: validLinks });
    _currentProfile.display_name = updated.display_name;
    _currentProfile.bio = updated.bio;
    _currentProfile.links = updated.links;
    const content = document.getElementById('profileContent');
    if (content) _renderCardView(content);
  } catch (err) {
    console.error('_saveProfile:', err);
    if (saveError) {
      saveError.textContent = '儲存失敗：' + (err.message || '未知錯誤');
      saveError.style.display = 'block';
    }
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '儲存變更'; }
  }
}

/* ── 取消編輯 ── */
function _cancelEdit() {
  const content = document.getElementById('profileContent');
  if (content) _renderCardView(content);
}

/* ── 時間格式化 ── */
function _formatTime(isoStr) {
  const d = new Date(isoStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}
