/* ================================================================
   matrix-grid.js — MatrixGrid 元件
   16×7 矩陣登入牆，即時同步玩家在線狀態
   ================================================================ */

const MatrixGrid = {
  TOTAL_COLS: 16,
  TITLE_RESERVED_COUNT: 6,  // 第一排前 6 格保留給標題

  /** 根據螢幕寬度計算實際欄數 */
  _getCols() {
    if (window.innerWidth <= 768) {
      // 手機：用螢幕寬度算出能放幾個 64px 格（含 gap）
      const gap = 3; // --grid-gap 預設
      const margin = window.innerWidth * 0.04; // 左右 margin 2% * 2
      const available = window.innerWidth - margin;
      return Math.max(4, Math.floor(available / (64 + gap)));
    }
    return this.TOTAL_COLS;
  },

  /** 用戶資料快取 { player_number: user } */
  _usersMap: {},

  /** 格位對照表 { player_number: cellElement } */
  _cellMap: {},

  /** Realtime 訂閱 channel */
  _channel: null,

  /** 在線計數 */
  _onlineCount: 0,

  /** 計數器 DOM 元素 */
  _counterEl: null,

  /**
   * 建立矩陣 DOM
   * @param {Array} users - 從 UsersAPI.getAllUsers() 取得的用戶陣列
   * @returns {{ grid: HTMLElement, counter: HTMLElement }}
   */
  create(users) {
    // 建立用戶索引
    this._usersMap = {};
    users.forEach(u => {
      if (u.player_number) this._usersMap[u.player_number] = u;
    });

    // 計算在線人數與總議會代表數
    this._onlineCount = users.filter(u => u.is_online).length;
    this._totalPlayers = users.filter(u => u.player_number).length;

    // 根據螢幕寬度決定欄數
    const cols = this._getCols();

    // 預留至少 100 個玩家格位 + 標題保留格
    const reservedSlots = Math.max(100, this._totalPlayers);
    const minCells = reservedSlots + this.TITLE_RESERVED_COUNT;
    const totalRows = Math.ceil(minCells / cols);
    const totalCells = totalRows * cols;

    // 標題保留格位（第一排前幾格，不超過欄數）
    const titleCount = Math.min(this.TITLE_RESERVED_COUNT, cols);
    const titleReserved = new Set();
    for (let i = 0; i < titleCount; i++) titleReserved.add(i);

    // 建立計數器
    this._counterEl = document.createElement('div');
    this._counterEl.className = 'matrix-counter';
    this._updateCounter();

    // 建立 grid
    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    grid.id = 'matrixGrid';
    grid.style.gridTemplateColumns = `repeat(${cols}, 64px)`;
    grid.style.gridTemplateRows = `repeat(${totalRows}, 64px)`;

    // 分配可用格位
    const availableSlots = [];
    for (let i = 0; i < totalCells; i++) {
      if (!titleReserved.has(i)) availableSlots.push(i);
    }

    // 前 N 個可用格 → 玩家，剩餘 → 雜訊
    const playerPositions = availableSlots.slice(0, this._totalPlayers);
    const deadNoisePositions = new Set(availableSlots.slice(this._totalPlayers));

    // 依 player_number 排序建立位置映射
    const sortedPlayers = users.filter(u => u.player_number).sort((a, b) => a.player_number - b.player_number);
    const positionToPlayer = {};
    playerPositions.forEach((posIdx, i) => {
      if (sortedPlayers[i]) positionToPlayer[posIdx] = sortedPlayers[i].player_number;
    });

    this._cellMap = {};

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'matrix-cell';

      if (titleReserved.has(i)) {
        cell.classList.add('matrix-cell--reserved');
      } else if (deadNoisePositions.has(i)) {
        cell.classList.add('matrix-cell--noise');
      } else {
        const playerNum = positionToPlayer[i];
        const user = this._usersMap[playerNum];

        if (user && user.is_online) {
          this._renderActiveCell(cell, user);
        } else if (user) {
          this._renderOfflineCell(cell, user);
        } else {
          cell.classList.add('matrix-cell--noise');
        }

        if (playerNum) {
          cell.dataset.playerNumber = playerNum;
          this._cellMap[playerNum] = cell;
        }

        cell.addEventListener('click', () => {
          if (cell.classList.contains('matrix-cell--active')) {
            Router.navigate('vote?player=' + playerNum);
          }
        });
      }

      grid.appendChild(cell);
    }

    return { grid, counter: this._counterEl };
  },

  /** 渲染在線玩家格位 */
  _renderActiveCell(cell, user) {
    cell.className = 'matrix-cell matrix-cell--active';
    cell.innerHTML = '';

    const img = document.createElement('img');
    img.className = 'matrix-cell__avatar';
    img.alt = user.display_name || 'Player ' + user.player_number;
    img.loading = 'lazy';
    if (user.avatar_url) {
      img.src = user.avatar_url;
    } else {
      img.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=Matrix${user.player_number}`;
    }
    img.onerror = () => {
      img.src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=Matrix${user.player_number}`;
      img.onerror = null;
    };

    const idLabel = document.createElement('span');
    idLabel.className = 'matrix-cell__id';
    idLabel.textContent = String(user.player_number).padStart(3, '0');

    cell.appendChild(img);
    cell.appendChild(idLabel);
  },

  /** 渲染離線玩家格位（有帳號但未登入，顯示雜訊） */
  _renderOfflineCell(cell, user) {
    cell.className = 'matrix-cell matrix-cell--waiting';
    cell.innerHTML = '';
    cell.dataset.playerNumber = user.player_number;
  },

  /** 更新在線計數器 */
  _updateCounter() {
    if (!this._counterEl) return;
    this._counterEl.innerHTML = `
      <span class="matrix-counter__label">在線：</span>
      <span class="matrix-counter__value">${this._onlineCount}</span>
      <span class="matrix-counter__total">/ ${this._totalPlayers || 0}</span>
    `;
  },

  /* ── Realtime 同步 ── */

  /** 啟動 Realtime 訂閱 */
  subscribe() {
    this._channel = supabaseClient
      .channel('matrix-users')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload) => this._handleUserUpdate(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'users' },
        (payload) => this._handleUserInsert(payload.new)
      )
      .subscribe();
  },

  /** 取消訂閱 */
  unsubscribe() {
    if (this._channel) {
      supabaseClient.removeChannel(this._channel);
      this._channel = null;
    }
  },

  /** 處理用戶資料更新（主要是 is_online 變更） */
  _handleUserUpdate(user) {
    if (!user.player_number) return;

    const oldUser = this._usersMap[user.player_number];
    const wasOnline = oldUser ? oldUser.is_online : false;
    const isNowOnline = user.is_online;

    // 更新快取
    this._usersMap[user.player_number] = user;

    // 更新在線計數
    if (!wasOnline && isNowOnline) this._onlineCount++;
    if (wasOnline && !isNowOnline) this._onlineCount--;
    this._updateCounter();

    // 更新格位
    const cell = this._cellMap[user.player_number];
    if (!cell) return;

    if (isNowOnline) {
      this._renderActiveCell(cell, user);
    } else {
      // 離線：播放崩潰動畫後變為等待狀態
      cell.classList.add('matrix-cell--crash');
      setTimeout(() => {
        cell.classList.remove('matrix-cell--crash');
        this._renderOfflineCell(cell, user);
      }, 400);
    }
  },

  /** 處理新用戶註冊 */
  _handleUserInsert(user) {
    if (!user.player_number) return;
    this._usersMap[user.player_number] = user;

    const cell = this._cellMap[user.player_number];
    if (!cell) return;

    if (user.is_online) {
      this._onlineCount++;
      this._updateCounter();
      this._renderActiveCell(cell, user);
    } else {
      this._renderOfflineCell(cell, user);
    }
  },

  /* ── 視覺特效 ── */

  /** 隨機 glitch 閃爍（持續運行） */
  _glitchTimer: null,

  startGlitchEffects() {
    const run = () => {
      const activeCells = document.querySelectorAll('.matrix-cell--active');
      if (activeCells.length === 0) {
        this._glitchTimer = setTimeout(run, 1000);
        return;
      }
      const target = activeCells[Math.floor(Math.random() * activeCells.length)];
      target.classList.add('matrix-cell--glitch');
      setTimeout(() => target.classList.remove('matrix-cell--glitch'), Math.random() * 300 + 100);
      this._glitchTimer = setTimeout(run, Math.random() * 2000 + 1000);
    };
    run();
  },

  stopGlitchEffects() {
    if (this._glitchTimer) {
      clearTimeout(this._glitchTimer);
      this._glitchTimer = null;
    }
  },

  /** 清理：取消訂閱 + 停止特效 */
  destroy() {
    this.unsubscribe();
    this.stopGlitchEffects();
    this._cellMap = {};
    this._usersMap = {};
  }
};
