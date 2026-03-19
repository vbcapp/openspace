/* ================================================================
   app.js — 應用程式進入點
   ================================================================ */

/** 產生玩家名片 slug：保留英文字母與數字，過濾中文，格式如 john-42 */
function playerSlug(displayName, playerNumber) {
  const ascii = (displayName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return ascii ? ascii + '-' + playerNumber : String(playerNumber);
}

document.addEventListener('DOMContentLoaded', async () => {
  // 判斷是否為公開路由（不需登入即可瀏覽）
  const hash = window.location.hash || '';
  const isPublicRoute = hash.match(/^#\/player\/.+/);

  // Auth guard：未登入且非公開路由 → 跳轉登入頁
  const session = await Auth.getSession();
  if (!session && !isPublicRoute) {
    window.location.href = 'login.html';
    return;
  }

  // Nav bar click handling（已登入才需要）
  if (session) {
    document.querySelectorAll('.nav-bar__item').forEach(item => {
      item.addEventListener('click', () => {
        Router.navigate(item.dataset.route);
      });
    });
  }

  // Register pages（已登入才載入完整路由）
  if (session) {
    Router.register('profile', renderProfilePage);
    Router.register('matrix', renderMatrixPage);
    Router.register('vote', renderVotePage);
    Router.register('vote/result', renderVoteResultPage);
    Router.register('zones', renderZonesPage);
    Router.register('zones/:id', renderQuestionGenPage);
    Router.register('zones/:id/locked', renderLockedQRPage);
    Router.register('answer/:questionId', renderAnswerPage);
    Router.register('admin/members', renderAdminMembersPage);
  }

  // 玩家名片（公開路由，不需登入）
  Router.register('player/:number', renderPlayerCardPage);

  // 設定登入狀態供 Router 判斷是否顯示 nav bar
  Router.isAuthenticated = !!session;

  // Start router
  Router.init();
});
