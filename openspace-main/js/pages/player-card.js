/* ================================================================
   player-card.js — 玩家名片頁
   路由：#/player/:number
   ================================================================ */

/* URL → 平台標籤 */
function _getPlayerLinkTag(url) {
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

async function renderPlayerCardPage(params) {
  const container = document.createElement('div');
  container.className = 'layout-mobile vignette player-card-page';
  container.style.position = 'relative';

  container.innerHTML = `
    <div class="fx-crt"></div>
    <span class="fx-corner fx-corner--tl"></span>
    <span class="fx-corner fx-corner--tr"></span>
    <span class="fx-corner fx-corner--bl"></span>
    <span class="fx-corner fx-corner--br"></span>

    <!-- 頂部標題區（同矩陣頁） -->
    <div class="matrix-ui-overlay" style="position:relative;pointer-events:auto;padding:var(--space-4) var(--space-4) 0;">
      <div class="matrix-ui-overlay__left">
        <h1 class="matrix-title fx-text-glitch" data-text="AI末日議會">AI末日議會</h1>
        <h2 class="matrix-subtitle">矩陣_監控_啟動中</h2>
      </div>
      <div class="matrix-ui-overlay__right">
        <div class="matrix-session-time fx-text-glitch" data-text="3/28">3/28</div>
        <div class="matrix-session-label">場次 // 奇異點</div>
      </div>
    </div>

    <header class="layout-mobile__header" style="padding-top:0;">
      <button class="btn btn--ghost" id="playerCardBackBtn" style="font-size:var(--text-xs);padding:var(--space-1) var(--space-2);">
        ← 返回
      </button>
      <span class="layout-mobile__header-title">玩家名片</span>
    </header>
    <main class="layout-mobile__content" id="playerCardContent">
      <div style="text-align:center;padding:var(--space-8) 0;">
        <div class="subtitle-cyber fx-text-glitch" data-text="載入中...">載入中...</div>
      </div>
    </main>
  `;

  setTimeout(() => _initPlayerCard(params.number), 0);
  setTimeout(() => {
    document.getElementById('playerCardBackBtn')?.addEventListener('click', () => {
      // 未登入用戶無 history，導向登入頁
      if (window.history.length <= 1) {
        window.location.href = 'login.html';
      } else {
        history.back();
      }
    });
  }, 0);

  return container;
}

async function _initPlayerCard(playerNumber) {
  const content = document.getElementById('playerCardContent');
  if (!content) return;

  try {
    // 判斷是否已登入
    let isLoggedIn = false;
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      isLoggedIn = !!user;
    } catch (_) {}

    // 已登入用 users 表，未登入用 public_profiles view
    const player = isLoggedIn
      ? await UsersAPI.getProfileByNumber(parseInt(playerNumber, 10))
      : await UsersAPI.getPublicProfileByNumber(parseInt(playerNumber, 10));

    if (!player) {
      content.innerHTML = `
        <div style="text-align:center;padding:var(--space-8) 0;">
          <div class="subtitle-cyber">找不到玩家</div>
          <p style="color:var(--color-text-muted);margin-top:var(--space-2);font-family:var(--font-ui);font-size:var(--text-sm);">
            玩家 #${playerNumber} 不存在
          </p>
        </div>
      `;
      return;
    }

    // 取得當前用戶和投票資訊（未登入則跳過）
    let currentUserId = null;
    let myVotes = [];
    let isCurrentParliament = false;
    if (isLoggedIn) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          currentUserId = user.id;
          const currentProfile = await UsersAPI.getCurrentProfile();
          isCurrentParliament = currentProfile && currentProfile.delegate_status === 'parliament';
          myVotes = isCurrentParliament ? await VotesAPI.getMyVotes() : [];
        }
      } catch (_) {}
    }

    _renderPlayerCard(content, player, currentUserId, myVotes, isCurrentParliament);
  } catch (err) {
    console.error('_initPlayerCard:', err);
    content.innerHTML = `
      <div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">
        載入失敗，請重新整理頁面
      </div>
    `;
  }
}

function _renderPlayerCard(content, player, currentUserId, myVotes, isCurrentParliament) {
  const isOnline = player.is_online;
  const avatarSrc = player.avatar_url || `https://api.dicebear.com/7.x/cyberpunk/svg?seed=${player.player_number || player.id.slice(0, 6)}&backgroundColor=1a0005`;
  const isMe = player.id === currentUserId;
  const playerNumberDisplay = player.player_number ? '#' + String(player.player_number).padStart(3, '0') : '#---';

  let voteActionHtml = '';
  if (isMe) {
    // 自己的名片 → 顯示複製網址分享按鈕
    const shareUrl = window.location.origin + window.location.pathname + '#/player/' + playerSlug(player.display_name, player.player_number);
    voteActionHtml = `
      <button class="btn btn--primary btn--full" id="copyShareUrlBtn" data-url="${shareUrl}" style="margin-top:var(--space-4);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        複製網址分享
      </button>
    `;
  } else if (!isCurrentParliament) {
    // 備選代表不顯示投票按鈕
    voteActionHtml = '';
  } else if (!player.player_number) {
    // 被查看者是備選代表，不可被投票
    voteActionHtml = '';
  } else {
    const alreadyVoted = myVotes.some(v => v.target_id === player.id);
    const noRemaining = myVotes.length >= MAX_VOTES;
    if (alreadyVoted) {
      voteActionHtml = '<div class="vote-chip__tag vote-chip__tag--voted" style="display:inline-block;margin-top:var(--space-2);">已投票給此玩家</div>';
    } else if (noRemaining) {
      voteActionHtml = '<button class="btn btn--ghost btn--full" disabled style="margin-top:var(--space-4);">票數已用完</button>';
    } else {
      voteActionHtml = `<button class="btn btn--primary btn--full" id="playerCardVoteBtn" data-target-id="${player.id}" style="margin-top:var(--space-4);">投票給 ${player.display_name}</button>`;
    }
  }

  content.innerHTML = `
    <div class="business-card">
      <div class="fx-scanline-glitch" id="playerCardScanline"></div>
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
            alt="${player.display_name}"
            class="avatar-profile"
            onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=P${player.player_number || player.id.slice(0, 6)}'"
          />
        </div>
        <div class="business-card__number fx-text-glitch" data-text="${playerNumberDisplay}">${playerNumberDisplay}</div>
        ${player.delegate_status === 'parliament' ? '<div class="business-card__role-badge">議會代表</div>' : '<div class="business-card__role-badge business-card__role-badge--survivor">末日倖存者</div>'}
      </div>

      <h1 class="business-card__name ui-text fx-text-glitch" data-text="${player.display_name}">
        ${player.display_name}
      </h1>

      <hr class="divider" />

      <p class="business-card__bio">${player.bio || '尚未填寫自我介紹'}</p>

      ${(player.links && player.links.length > 0) ? `
      <div class="business-card__links">
        ${player.links.map(link => `
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="business-card__link">
            <span class="business-card__link-prompt">&gt;</span>
            <span class="business-card__link-name">${link.name}</span>
            <span class="business-card__link-tag">${_getPlayerLinkTag(link.url)}</span>
            <span class="business-card__link-cursor"></span>
          </a>
        `).join('')}
      </div>
      ` : ''}

      <div class="business-card__status">
        <div class="status-light">
          <span class="status-light__dot ${isOnline ? 'status-light__dot--online fx-pulse-green' : 'status-light__dot--offline'}"></span>
          <span class="status-light__text">${isOnline ? '已登入活動' : '未登入活動'}</span>
        </div>
      </div>

      <hr class="divider" />

      ${voteActionHtml}
    </div>
  `;

  // 綁定投票按鈕
  const voteBtn = document.getElementById('playerCardVoteBtn');
  if (voteBtn) {
    voteBtn.addEventListener('click', async () => {
      voteBtn.disabled = true;
      voteBtn.textContent = '投票中...';
      try {
        await VotesAPI.castVote(player.id);
        voteBtn.textContent = '已投票給此玩家';
        voteBtn.className = 'btn btn--ghost btn--full';
        voteBtn.disabled = true;
      } catch (err) {
        console.error('playerCard vote:', err);
        alert('投票失敗：' + (err.message || '未知錯誤'));
        voteBtn.disabled = false;
        voteBtn.textContent = `投票給 ${player.display_name}`;
      }
    });
  }

  // 綁定複製網址按鈕
  const copyBtn = document.getElementById('copyShareUrlBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const url = copyBtn.dataset.url;
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          已複製！
        `;
        copyBtn.classList.remove('btn--primary');
        copyBtn.classList.add('btn--ghost');
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            複製網址分享
          `;
          copyBtn.classList.remove('btn--ghost');
          copyBtn.classList.add('btn--primary');
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          已複製！
        `;
        copyBtn.classList.remove('btn--primary');
        copyBtn.classList.add('btn--ghost');
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            複製網址分享
          `;
          copyBtn.classList.remove('btn--ghost');
          copyBtn.classList.add('btn--primary');
        }, 2000);
      }
    });
  }

  // 啟動 glitch 特效
  _startPlayerCardGlitch();
}

/* ── Glitch 特效 ── */
let _playerCardGlitchTimer = null;
let _playerCardScanlineTimer = null;

function _startPlayerCardGlitch() {
  if (_playerCardGlitchTimer) clearTimeout(_playerCardGlitchTimer);
  if (_playerCardScanlineTimer) clearInterval(_playerCardScanlineTimer);

  const run = () => {
    const card = document.querySelector('#playerCardContent .business-card');
    if (!card) return;
    card.classList.add('fx-rgb-split');
    setTimeout(() => card.classList.remove('fx-rgb-split'), Math.random() * 200 + 80);
    _playerCardGlitchTimer = setTimeout(run, Math.random() * 4000 + 2000);
  };
  _playerCardGlitchTimer = setTimeout(run, Math.random() * 3000 + 1000);

  const triggerScanline = () => {
    const el = document.getElementById('playerCardScanline');
    if (!el) return;
    el.classList.remove('is-active');
    void el.offsetHeight;
    el.classList.add('is-active');
    setTimeout(() => el.classList.remove('is-active'), 1250);
  };
  triggerScanline();
  _playerCardScanlineTimer = setInterval(triggerScanline, 3000);
}

function _cleanupPlayerCardPage() {
  if (_playerCardGlitchTimer) { clearTimeout(_playerCardGlitchTimer); _playerCardGlitchTimer = null; }
  if (_playerCardScanlineTimer) { clearInterval(_playerCardScanlineTimer); _playerCardScanlineTimer = null; }
}
