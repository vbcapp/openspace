/* ================================================================
   app.js — 應用程式進入點
   ================================================================ */

/**
 * 安全渲染題目 HTML：只允許 <span class="invert-hl"> 標籤
 * 同時處理 inline style 格式（舊資料）和 class 格式
 */
function renderQuestionHtml(raw) {
  if (!raw) return '';
  const _esc = (s) => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  // 在 escape 之前，先用 regex 拆出所有允許的 span 標籤
  const spanRe = /<span\s+(?:class=["']invert-hl["']|style=["'][^"']*background[^"']*["'])>(.*?)<\/span>/gi;
  const parts = [];
  let last = 0, m;
  while ((m = spanRe.exec(raw)) !== null) {
    parts.push(_esc(raw.slice(last, m.index)));
    parts.push('<span class="invert-hl">' + _esc(m[1]) + '</span>');
    last = spanRe.lastIndex;
  }
  parts.push(_esc(raw.slice(last)));
  return parts.join('');
}

/**
 * 從題目 HTML 中提取純文字（用於預覽/截斷）
 */
function stripQuestionHtml(raw) {
  if (!raw) return '';
  return raw.replace(/<[^>]*>/g, '');
}

/** 產生玩家名片 slug：保留英文字母與數字，過濾中文，格式如 john-42 */
function playerSlug(displayName, playerNumber) {
  const ascii = (displayName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return ascii ? ascii + '-' + playerNumber : String(playerNumber);
}

document.addEventListener('DOMContentLoaded', async () => {
  // 判斷是否為公開路由（不需登入即可瀏覽）
  const hash = window.location.hash || '';
  const isPublicRoute = hash.match(/^#\/player\/.+/);

  // Auth guard：暫時關閉，開發用
  const session = await Auth.getSession();
  // if (!session && !isPublicRoute) {
  //   window.location.href = 'login.html';
  //   return;
  // }

  // Nav bar click handling
  document.querySelectorAll('.nav-bar__item').forEach(item => {
    item.addEventListener('click', () => {
      Router.navigate(item.dataset.route);
    });
  });

  // Register pages（暫時移除登入限制）
  Router.register('profile', renderProfilePage);
  Router.register('matrix', renderMatrixPage);
  Router.register('vote', renderVotePage);
  Router.register('vote/result', renderVoteResultPage);
  Router.register('zones', renderZonesPage);
  Router.register('zones/:id', renderQuestionGenPage);
  Router.register('zones/:id/locked', renderLockedQRPage);
  Router.register('answer/:questionId', renderAnswerPage);
  Router.register('admin/members', renderAdminMembersPage);

  // 玩家名片（公開路由，不需登入）
  Router.register('player/:number', renderPlayerCardPage);

  // 設定登入狀態供 Router 判斷是否顯示 nav bar（暫時強制為 true）
  Router.isAuthenticated = true;

  // Start router
  Router.init();
});
