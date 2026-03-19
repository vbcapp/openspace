/* ================================================================
   vote-result.js — 投票結果排行榜
   Realtime 即時更新
   ================================================================ */

let _leaderboardChannel = null;

async function renderVoteResultPage() {
  const container = document.createElement('div');
  container.className = 'layout-mobile';

  container.innerHTML = `
    <header class="layout-mobile__header">
      <button class="btn btn--ghost" id="backToVoteBtn" style="font-size:var(--text-xs);padding:var(--space-1) var(--space-2);">
        ← 投票
      </button>
      <span class="layout-mobile__header-title">排行榜</span>
    </header>
    <main class="layout-mobile__content" id="leaderboardContent">
      <div style="text-align:center;padding:var(--space-8) 0;">
        <div class="subtitle-cyber">載入中...</div>
      </div>
    </main>
  `;

  setTimeout(() => _initLeaderboard(), 0);
  setTimeout(() => {
    document.getElementById('backToVoteBtn')?.addEventListener('click', () => {
      Router.navigate('vote');
    });
  }, 0);

  return container;
}

async function _initLeaderboard() {
  // 檢查議會代表身份
  const profile = await UsersAPI.getCurrentProfile();
  if (!profile || profile.delegate_status !== 'parliament') {
    const content = document.getElementById('leaderboardContent');
    if (content) {
      content.innerHTML = `
        <div style="text-align:center;padding:var(--space-12) 0;">
          <span class="badge badge--delegate-alt" style="display:inline-block;margin-bottom:var(--space-3);">備選代表</span>
          <div class="subtitle-cyber">權限不足</div>
          <p style="color:var(--color-text-muted);margin-top:var(--space-2);font-family:var(--font-ui);font-size:var(--text-sm);">
            僅議會代表可查看排行榜
          </p>
        </div>
      `;
    }
    return;
  }

  await _loadLeaderboard();
  _subscribeVotes();
}

async function _loadLeaderboard() {
  const content = document.getElementById('leaderboardContent');
  if (!content) return;

  try {
    const leaderboard = await VotesAPI.getLeaderboard();
    _renderLeaderboard(content, leaderboard);
  } catch (err) {
    console.error('_loadLeaderboard:', err);
    content.innerHTML = `
      <div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">
        載入失敗，請重新整理頁面
      </div>
    `;
  }
}

function _renderLeaderboard(content, leaderboard) {
  if (leaderboard.length === 0) {
    content.innerHTML = `
      <div class="leaderboard-empty">
        <div class="leaderboard-empty__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-text-muted)">
            <path d="M12 20V10"></path>
            <path d="M18 20V4"></path>
            <path d="M6 20v-4"></path>
          </svg>
        </div>
        <span class="subtitle-cyber">尚無投票</span>
        <p style="color:var(--color-text-muted);margin-top:var(--space-2);">尚無投票紀錄</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="leaderboard">
      ${leaderboard.map((player, idx) => {
        const rank = idx + 1;
        const avatarSrc = player.avatar_url || `https://api.dicebear.com/7.x/cyberpunk/svg?seed=${player.player_number}&backgroundColor=1a0005`;
        const rankClass = rank <= 3 ? `leaderboard-item--rank-${rank}` : '';

        const playerName = player.display_name || 'Unknown';
        return `
          <div class="leaderboard-item ${rankClass}" data-player-slug="${playerSlug(playerName, player.player_number)}" style="cursor:pointer;">
            <div class="leaderboard-item__rank">
              ${rank <= 3 ? `<span class="leaderboard-item__medal">${['🥇', '🥈', '🥉'][rank - 1]}</span>` : `<span class="leaderboard-item__rank-num">${rank}</span>`}
            </div>
            <div class="leaderboard-item__avatar">
              <img src="${avatarSrc}" alt="${playerName}" onerror="this.src='https://api.dicebear.com/7.x/pixel-art/svg?seed=P${player.player_number}'" />
            </div>
            <div class="leaderboard-item__info">
              <span class="leaderboard-item__number">#${String(player.player_number).padStart(3, '0')}</span>
              <span class="leaderboard-item__name">${playerName}</span>
            </div>
            <div class="leaderboard-item__votes">
              <span class="leaderboard-item__count">${player.vote_count}</span>
              <span class="leaderboard-item__label">票數</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // 綁定排行榜項目點擊導航
  content.querySelectorAll('.leaderboard-item[data-player-slug]').forEach(item => {
    item.addEventListener('click', () => {
      const slug = item.dataset.playerSlug;
      if (slug) Router.navigate('player/' + slug);
    });
  });
}

/** 訂閱投票表 Realtime，即時更新排行 */
function _subscribeVotes() {
  _unsubscribeVotes();

  _leaderboardChannel = supabaseClient
    .channel('leaderboard-votes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'votes' },
      () => _loadLeaderboard()
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'votes' },
      () => _loadLeaderboard()
    )
    .subscribe();
}

function _unsubscribeVotes() {
  if (_leaderboardChannel) {
    supabaseClient.removeChannel(_leaderboardChannel);
    _leaderboardChannel = null;
  }
}
