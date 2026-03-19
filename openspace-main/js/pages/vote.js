/* ================================================================
   vote.js — 投票操作頁（5 票分散制）
   ================================================================ */

const MAX_VOTES = 5;

/** 當前用戶的已投票列表 [{id, target_id, users:{player_number, display_name, avatar_url}}] */
let _myVotes = [];

/** 當前用戶 ID */
let _currentUserId = null;

/** 搜尋防抖計時器 */
let _searchTimer = null;

async function renderVotePage() {
  const container = document.createElement('div');
  container.className = 'layout-mobile';

  container.innerHTML = `
    <header class="layout-mobile__header">
      <span class="layout-mobile__header-title">投票</span>
      <button class="btn btn--ghost" id="voteResultBtn" style="font-size:var(--text-xs);padding:var(--space-1) var(--space-2);">
        排行榜
      </button>
    </header>
    <main class="layout-mobile__content" id="voteContent">
      <div style="text-align:center;padding:var(--space-8) 0;">
        <div class="subtitle-cyber">載入中...</div>
      </div>
    </main>
  `;

  setTimeout(() => _initVotePage(), 0);
  setTimeout(() => {
    document.getElementById('voteResultBtn')?.addEventListener('click', () => {
      Router.navigate('vote/result');
    });
  }, 0);

  return container;
}

async function _initVotePage() {
  const content = document.getElementById('voteContent');
  if (!content) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { window.location.href = 'login.html'; return; }
    _currentUserId = user.id;

    // 檢查議會代表身份
    const profile = await UsersAPI.getCurrentProfile();
    if (!profile || profile.delegate_status !== 'parliament') {
      content.innerHTML = `
        <div style="text-align:center;padding:var(--space-12) 0;">
          <span class="badge badge--delegate-alt" style="display:inline-block;margin-bottom:var(--space-3);">備選代表</span>
          <div class="subtitle-cyber">權限不足</div>
          <p style="color:var(--color-text-muted);margin-top:var(--space-2);font-family:var(--font-ui);font-size:var(--text-sm);">
            僅議會代表可進行投票
          </p>
        </div>
      `;
      return;
    }

    _myVotes = await VotesAPI.getMyVotes();
    _renderVotePanel(content);

    // 若從矩陣頁帶 player 參數過來，自動搜尋
    const hash = window.location.hash;
    const playerMatch = hash.match(/player=(\d+)/);
    if (playerMatch) {
      const searchInput = document.getElementById('voteSearch');
      if (searchInput) {
        searchInput.value = playerMatch[1];
        _doSearch(playerMatch[1]);
      }
    }
  } catch (err) {
    console.error('_initVotePage:', err);
    content.innerHTML = `
      <div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">
        載入失敗，請重新整理頁面
      </div>
    `;
  }
}

function _renderVotePanel(content) {
  const remaining = MAX_VOTES - _myVotes.length;

  content.innerHTML = `
    <!-- 剩餘票數 -->
    <div class="vote-remaining">
      <span class="vote-remaining__label">剩餘票數</span>
      <div class="vote-remaining__count">
        ${Array.from({ length: MAX_VOTES }, (_, i) =>
          `<span class="vote-remaining__dot ${i < remaining ? 'vote-remaining__dot--active' : ''}"></span>`
        ).join('')}
      </div>
      <span class="vote-remaining__number">${remaining} / ${MAX_VOTES}</span>
    </div>

    <!-- 搜尋區 -->
    <div class="vote-search">
      <div class="form-field">
        <label class="form-field__label">搜尋玩家</label>
        <input
          type="text"
          class="input"
          id="voteSearch"
          placeholder="輸入編號或名稱搜尋..."
          autocomplete="off"
        />
      </div>
      <div id="searchResults" class="vote-search-results"></div>
    </div>

    <!-- 已投給的人 -->
    <section class="vote-cast-section">
      <h2 class="vote-section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        我的投票
      </h2>
      <div id="myVotesList">
        ${_myVotes.length === 0 ? `
          <div class="vote-empty">
            <span class="subtitle-cyber">尚未投票</span>
            <p>搜尋玩家編號或名稱來投票</p>
          </div>
        ` : _myVotes.map(v => _renderVoteChip(v)).join('')}
      </div>
    </section>
  `;

  // 綁定搜尋事件
  const searchInput = document.getElementById('voteSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(_searchTimer);
      const query = e.target.value.trim();
      if (query.length === 0) {
        document.getElementById('searchResults').innerHTML = '';
        return;
      }
      _searchTimer = setTimeout(() => _doSearch(query), 300);
    });
  }
}

async function _doSearch(query) {
  const resultsEl = document.getElementById('searchResults');
  if (!resultsEl) return;

  resultsEl.innerHTML = '<div class="vote-search-loading">搜尋中...</div>';

  try {
    const players = await VotesAPI.searchPlayers(query);

    if (players.length === 0) {
      resultsEl.innerHTML = '<div class="vote-search-empty">找不到玩家</div>';
      return;
    }

    // 已投過的 target_id 集合
    const votedTargets = new Set(_myVotes.map(v => v.target_id));
    const remaining = MAX_VOTES - _myVotes.length;

    resultsEl.innerHTML = players.map(p => {
      const isMe = p.id === _currentUserId;
      const alreadyVoted = votedTargets.has(p.id);
      const noRemaining = remaining <= 0;
      const avatarSrc = p.avatar_url || `https://api.dicebear.com/7.x/cyberpunk/svg?seed=${p.player_number}&backgroundColor=1a0005`;

      let btnHtml;
      if (isMe) {
        btnHtml = '<span class="vote-chip__tag">自己</span>';
      } else if (alreadyVoted) {
        btnHtml = '<span class="vote-chip__tag vote-chip__tag--voted">已投</span>';
      } else if (noRemaining) {
        btnHtml = '<button class="btn btn--ghost btn--sm" disabled>已用完</button>';
      } else {
        btnHtml = `<button class="btn btn--primary btn--sm vote-btn" data-target-id="${p.id}">投票</button>`;
      }

      return `
        <div class="vote-chip">
          <div class="vote-chip__profile" data-player-slug="${playerSlug(p.display_name, p.player_number)}">
            <div class="vote-chip__avatar">
              <img src="${avatarSrc}" alt="${p.display_name}" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=P${p.player_number}'" />
            </div>
            <div class="vote-chip__info">
              <span class="vote-chip__number">#${String(p.player_number).padStart(3, '0')}</span>
              <span class="vote-chip__name">${p.display_name || 'Unknown'}</span>
            </div>
          </div>
          ${btnHtml}
        </div>
      `;
    }).join('');

    // 綁定投票按鈕
    resultsEl.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', () => _castVote(btn.dataset.targetId));
    });

    // 綁定名片點擊導航
    resultsEl.querySelectorAll('.vote-chip__profile').forEach(el => {
      el.addEventListener('click', () => {
        const slug = el.dataset.playerSlug;
        if (slug) Router.navigate('player/' + slug);
      });
    });
  } catch (err) {
    console.error('_doSearch:', err);
    resultsEl.innerHTML = '<div class="vote-search-empty">搜尋失敗</div>';
  }
}

async function _castVote(targetId) {
  if (_myVotes.length >= MAX_VOTES) return;

  // 停用所有投票按鈕避免重複點擊
  document.querySelectorAll('.vote-btn').forEach(b => b.disabled = true);

  try {
    const vote = await VotesAPI.castVote(targetId);
    _myVotes.push(vote);

    // 重新渲染
    const content = document.getElementById('voteContent');
    if (content) _renderVotePanel(content);
  } catch (err) {
    console.error('_castVote:', err);
    // 可能是重複投票或超過上限
    const msg = err.message || '投票失敗';
    alert('投票失敗：' + msg);
    document.querySelectorAll('.vote-btn').forEach(b => b.disabled = false);
  }
}

async function _cancelVote(voteId) {
  try {
    await VotesAPI.cancelVote(voteId);
    _myVotes = _myVotes.filter(v => v.id !== voteId);

    // 重新渲染
    const content = document.getElementById('voteContent');
    if (content) _renderVotePanel(content);
  } catch (err) {
    console.error('_cancelVote:', err);
    alert('取消投票失敗');
  }
}

function _renderVoteChip(vote) {
  const user = vote.users;
  const avatarSrc = user?.avatar_url || `https://api.dicebear.com/7.x/cyberpunk/svg?seed=${user?.player_number || 0}&backgroundColor=1a0005`;
  const playerNum = user?.player_number || '???';
  const name = user?.display_name || 'Unknown';

  return `
    <div class="vote-chip vote-chip--cast">
      <div class="vote-chip__profile" onclick="Router.navigate('player/' + playerSlug('${name.replace(/'/g, "\\'")}', '${playerNum}'))">
        <div class="vote-chip__avatar">
          <img src="${avatarSrc}" alt="${name}" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=P${playerNum}'" />
        </div>
        <div class="vote-chip__info">
          <span class="vote-chip__number">#${String(playerNum).padStart(3, '0')}</span>
          <span class="vote-chip__name">${name}</span>
        </div>
      </div>
      <button class="btn btn--ghost btn--sm vote-cancel-btn" data-vote-id="${vote.id}" onclick="_cancelVote('${vote.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        取消
      </button>
    </div>
  `;
}
