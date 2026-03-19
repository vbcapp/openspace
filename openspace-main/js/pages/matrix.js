/* ================================================================
   matrix.js — 矩陣登入牆頁面
   ================================================================ */

async function renderMatrixPage() {
  const el = document.createElement('div');
  el.className = 'layout-matrix vignette';

  // CRT 掃描線覆蓋層
  const crt = document.createElement('div');
  crt.className = 'fx-crt';
  el.appendChild(crt);


  // 警告 Banner
  const banner = document.createElement('div');
  banner.className = 'fx-warning-banner';
  banner.id = 'warningBanner';
  banner.textContent = '系統奇異點偵測中';
  el.appendChild(banner);

  // 頂部 UI 疊層
  const uiOverlay = document.createElement('div');
  uiOverlay.className = 'matrix-ui-overlay';
  uiOverlay.innerHTML = `
    <div class="matrix-ui-overlay__left">
      <h1 class="matrix-title fx-text-glitch" data-text="AI末日議會">AI末日議會</h1>
      <h2 class="matrix-subtitle">矩陣_監控_啟動中</h2>
    </div>
    <div class="matrix-ui-overlay__right">
      <div class="matrix-session-time fx-text-glitch" data-text="3/28">3/28</div>
      <div class="matrix-session-label">場次 // 奇異點</div>
    </div>
  `;
  el.appendChild(uiOverlay);

  // Loading 狀態
  const loadingEl = document.createElement('div');
  loadingEl.className = 'matrix-loading';
  loadingEl.innerHTML = '<div class="matrix-loading__text fx-text-glitch" data-text="載入矩陣中...">載入矩陣中...</div>';
  el.appendChild(loadingEl);

  // 非同步載入資料後渲染網格
  setTimeout(async () => {
    try {
      const users = await UsersAPI.getAllUsers();

      // 移除 loading
      const loading = el.querySelector('.matrix-loading');
      if (loading) loading.remove();

      // 建立網格
      const { grid, counter } = MatrixGrid.create(users);

      // 計數器插入 UI 疊層
      const overlayLeft = el.querySelector('.matrix-ui-overlay__left');
      if (overlayLeft) overlayLeft.appendChild(counter);

      el.appendChild(grid);

      // 啟動 Realtime 訂閱
      MatrixGrid.subscribe();

      // 啟動 glitch 特效
      MatrixGrid.startGlitchEffects();
    } catch (err) {
      console.error('Matrix load error:', err);
      const loading = el.querySelector('.matrix-loading');
      if (loading) {
        loading.innerHTML = '<div class="matrix-loading__text">矩陣離線</div>';
      }
    }
  }, 0);

  return el;
}
