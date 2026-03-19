/* ================================================================
   router.js — 簡易 Hash Router（支援動態路由）
   ================================================================ */

const Router = {
  routes: {},
  currentPage: null,
  isAuthenticated: false,

  register(path, renderFn) {
    this.routes[path] = renderFn;
  },

  navigate(path) {
    window.location.hash = '#/' + path;
  },

  init() {
    window.addEventListener('hashchange', () => this._resolve());
    this._resolve();
  },

  _mount(container, page) {
    if (typeof page === 'string') {
      container.innerHTML = page;
    } else if (page instanceof HTMLElement) {
      container.appendChild(page);
    }
    container.firstElementChild?.classList.add('page-enter');
  },

  /**
   * 解析 path，嘗試匹配動態路由
   * 支援 zones/:id、zones/:id/locked、answer/:questionId
   */
  _matchRoute(path) {
    // 1. 精確匹配
    if (this.routes[path]) {
      return { renderFn: this.routes[path], params: {}, resolvedPath: path };
    }

    // 2. 去掉 query string 再精確匹配
    const basePath = path.split('?')[0];
    if (this.routes[basePath]) {
      return { renderFn: this.routes[basePath], params: {}, resolvedPath: basePath };
    }

    // 3. 動態路由匹配
    const segments = basePath.split('/');

    // zones/:id/locked
    if (segments[0] === 'zones' && segments.length === 3 && segments[2] === 'locked') {
      const fn = this.routes['zones/:id/locked'];
      if (fn) return { renderFn: fn, params: { id: segments[1] }, resolvedPath: 'zones/:id/locked' };
    }

    // zones/:id
    if (segments[0] === 'zones' && segments.length === 2 && segments[1]) {
      const fn = this.routes['zones/:id'];
      if (fn) return { renderFn: fn, params: { id: segments[1] }, resolvedPath: 'zones/:id' };
    }

    // answer/:questionId
    if (segments[0] === 'answer' && segments.length === 2 && segments[1]) {
      const fn = this.routes['answer/:questionId'];
      if (fn) return { renderFn: fn, params: { questionId: segments[1] }, resolvedPath: 'answer/:questionId' };
    }

    // admin/members
    if (segments[0] === 'admin' && segments.length === 2 && segments[1] === 'members') {
      const fn = this.routes['admin/members'];
      if (fn) return { renderFn: fn, params: {}, resolvedPath: 'admin/members' };
    }

    // player/:slug (slug 格式: name-42，從尾端提取數字)
    if (segments[0] === 'player' && segments.length === 2 && segments[1]) {
      const fn = this.routes['player/:number'];
      const match = segments[1].match(/(\d+)$/);
      const number = match ? match[1] : segments[1];
      if (fn) return { renderFn: fn, params: { number }, resolvedPath: 'player/:number' };
    }

    return null;
  },

  _resolve() {
    const hash = window.location.hash || '#/profile';
    const path = hash.replace('#/', '') || 'profile';

    const app = document.getElementById('app');
    const navBar = document.getElementById('navBar');

    const match = this._matchRoute(path);

    // 未登入且路由不存在 → 導向登入頁
    if (!match && !this.isAuthenticated) {
      window.location.href = 'login.html';
      return;
    }

    if (match) {
      const { renderFn, params, resolvedPath } = match;

      // 離開矩陣頁時清理 Realtime 訂閱和特效
      if (this.currentPage === 'matrix' && resolvedPath !== 'matrix') {
        MatrixGrid.destroy();
      }

      // 離開排行榜頁時清理 Realtime 訂閱
      if (this.currentPage === 'vote/result' && resolvedPath !== 'vote/result') {
        if (typeof _unsubscribeVotes === 'function') _unsubscribeVotes();
      }

      // 離開 zones 總覽頁時清理 Realtime 訂閱
      if (this.currentPage === 'zones' && resolvedPath !== 'zones') {
        if (typeof _cleanupZonesPage === 'function') _cleanupZonesPage();
      }

      // 離開題目生成頁時清理
      if (this.currentPage === 'zones/:id' && resolvedPath !== 'zones/:id') {
        if (typeof _cleanupQuestionGenPage === 'function') _cleanupQuestionGenPage();
      }

      // 離開作答頁時清理
      if (this.currentPage === 'answer/:questionId' && resolvedPath !== 'answer/:questionId') {
        if (typeof _cleanupAnswerPage === 'function') _cleanupAnswerPage();
      }

      // 離開玩家名片頁時清理
      if (this.currentPage === 'player/:number' && resolvedPath !== 'player/:number') {
        if (typeof _cleanupPlayerCardPage === 'function') _cleanupPlayerCardPage();
      }

      app.innerHTML = '';
      this.currentPage = resolvedPath;

      const result = renderFn(params);

      // 支援 async render functions（回傳 Promise）
      if (result && typeof result.then === 'function') {
        result.then(page => this._mount(app, page));
      } else {
        this._mount(app, result);
      }
    }

    // Show nav bar & update active state（僅限已登入用戶）
    if (navBar) {
      // 未登入或鎖定頁面隱藏 nav bar
      const isLockedPage = path.includes('/locked');
      navBar.style.display = (!this.isAuthenticated || isLockedPage) ? 'none' : 'flex';

      navBar.querySelectorAll('.nav-bar__item').forEach(item => {
        const route = item.dataset.route;
        const isActive = route === path ||
          (route === 'matrix' && (path === 'vote' || path.startsWith('vote/'))) ||
          (route === 'zones' && path.startsWith('zones'));
        item.classList.toggle('nav-bar__item--active', isActive);
      });
    }
  }
};
