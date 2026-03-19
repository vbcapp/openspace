/* ================================================================
   question-gen.js — 題目生成頁 (T-015) + iPad 鎖定/QR Code (T-016)
   ================================================================ */

let _qgZoneId = null;
let _qgZone = null;
let _qgQuestions = [];
let _qgChannel = null;

function _isIPad() {
  const ua = navigator.userAgent;
  // 傳統 iPad UA 或 iPadOS 桌面模式（Macintosh + 觸控）
  if (/iPad/.test(ua)) return true;
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true;
  // 部分瀏覽器（如 Chrome for iPad）可能回報為 CriOS + 觸控裝置
  if (/CriOS|FxiOS/.test(ua) && navigator.maxTouchPoints > 1) return true;
  // 最後防線：有觸控且螢幕夠大就視為平板（排除桌機觸控螢幕較少見）
  if (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) >= 768) return true;
  return false;
}

function _cleanupQuestionGenPage() {
  if (_qgChannel) {
    supabaseClient.removeChannel(_qgChannel);
    _qgChannel = null;
  }
  _qgZoneId = null;
  _qgZone = null;
  _qgQuestions = [];
}

async function renderQuestionGenPage(params) {
  _qgZoneId = parseInt(params.id, 10);

  const container = document.createElement('div');
  container.className = 'layout-mobile';

  container.innerHTML = `
    <header class="layout-mobile__header">
      <button class="btn btn--ghost" id="qgBackBtn" style="font-size:var(--text-xs);padding:var(--space-1) var(--space-2);">
        &larr; 返回
      </button>
      <span class="layout-mobile__header-title" id="qgTitle">第 ${String(_qgZoneId).padStart(2, '0')} 區</span>
      <span></span>
    </header>
    <main class="layout-mobile__content" id="qgContent">
      <div style="text-align:center;padding:var(--space-8) 0;">
        <div class="subtitle-cyber">載入中...</div>
      </div>
    </main>
  `;

  setTimeout(() => _initQuestionGenPage(), 0);
  setTimeout(() => {
    document.getElementById('qgBackBtn')?.addEventListener('click', () => {
      Router.navigate('zones');
    });
  }, 0);

  return container;
}

async function _initQuestionGenPage() {
  const content = document.getElementById('qgContent');
  if (!content) return;

  try {
    _qgZone = await ZonesAPI.getZone(_qgZoneId);
    if (!_qgZone) {
      content.innerHTML = '<div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">找不到此區域</div>';
      return;
    }

    // 若已鎖定，直接顯示鎖定頁面
    if (_qgZone.is_locked && _qgZone.current_question_id) {
      _renderLockedPage(content);
      return;
    }

    _qgQuestions = await QuestionsAPI.getQuestionsByZone(_qgZoneId);
    _renderQuestionGenPanel(content);
    _subscribeZoneChanges();
  } catch (err) {
    console.error('_initQuestionGenPage:', err);
    content.innerHTML = '<div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">載入失敗</div>';
  }
}

function _renderQuestionGenPanel(content) {
  const currentQ = _qgZone.questions;
  const hasCurrentQ = currentQ && currentQ.content;

  content.innerHTML = `
    <!-- 區域資訊 -->
    <div class="qg-zone-info">
      <span class="qg-zone-info__name">${_qgZone.zone_name}</span>
      <span class="qg-zone-info__status ${_qgZone.is_locked ? 'qg-zone-info__status--locked' : ''}">
        ${_qgZone.is_locked ? '已鎖定' : '未鎖定'}
      </span>
    </div>

    <!-- 當前題目 -->
    ${hasCurrentQ ? `
      <div class="qg-current-question">
        <div class="qg-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          目前題目
        </div>
        <div class="qg-question-card">
          <p class="qg-question-card__text">${_escapeHtml(currentQ.content)}</p>
          <div class="qg-question-card__meta">
            <span class="data-label">${currentQ.source_type === 'ai' ? 'AI 生成' : '手動'}</span>
          </div>
        </div>
        ${_isIPad() ? `
        <div class="qg-lock-actions">
          <button class="btn btn--primary btn--full" id="qgLockBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            鎖定並顯示 QR Code
          </button>
        </div>
        ` : ''}
      </div>
    ` : ''}

    <!-- 出題方式切換 -->
    <div class="qg-mode-switch">
      <div class="qg-section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        建立題目
      </div>
      <div class="qg-tabs">
        <button class="qg-tab qg-tab--active" data-mode="manual">手動出題</button>
        <button class="qg-tab" data-mode="ai">AI 出題</button>
      </div>
    </div>

    <!-- 手動出題表單 -->
    <div id="qgFormManual" class="qg-form">
      <div class="form-field">
        <label class="form-field__label">題目內容</label>
        <textarea class="textarea" id="qgQuestionText" rows="4" placeholder="輸入題目內容..."></textarea>
        <span class="form-field__hint" id="qgCharCount">0 / 500</span>
      </div>
      <button class="btn btn--primary btn--full" id="qgSubmitBtn">
        儲存題目
      </button>
    </div>

    <!-- AI 出題表單 -->
    <div id="qgFormAI" class="qg-form" style="display:none;">
      <div class="form-field">
        <label class="form-field__label">主題 / 關鍵字</label>
        <input type="text" class="input" id="qgAIKeyword" placeholder="輸入主題或關鍵字，例：資源分配、AI倫理..." />
      </div>
      <button class="btn btn--primary btn--full" id="qgAIBtn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        AI 生成題目
      </button>
      <div id="qgAIResult"></div>
    </div>

    <!-- 歷史題目 -->
    ${_qgQuestions.length > 0 ? `
      <div class="qg-history">
        <div class="qg-section-title" style="margin-top:var(--space-6);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          歷史題目
        </div>
        ${_qgQuestions.map(q => `
          <div class="qg-history-item" data-question-id="${q.id}">
            <p class="qg-history-item__text">${_escapeHtml(q.content)}</p>
            <div class="qg-history-item__meta">
              <span class="data-label">${q.source_type === 'ai' ? 'AI' : '手動'}</span>
              <span class="data-label">${new Date(q.created_at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <button class="btn btn--ghost btn--sm qg-use-btn" data-question-id="${q.id}">使用此題</button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  _bindQuestionGenEvents(content);
}

function _bindQuestionGenEvents(content) {
  // 字數計算
  const textarea = document.getElementById('qgQuestionText');
  const charCount = document.getElementById('qgCharCount');
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / 500`;
      if (len > 500) charCount.style.color = 'var(--color-error)';
      else charCount.style.color = 'var(--color-text-muted)';
    });
  }

  // Tab 切換
  content.querySelectorAll('.qg-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      content.querySelectorAll('.qg-tab').forEach(t => t.classList.remove('qg-tab--active'));
      tab.classList.add('qg-tab--active');
      const mode = tab.dataset.mode;
      document.getElementById('qgFormManual').style.display = mode === 'manual' ? 'block' : 'none';
      document.getElementById('qgFormAI').style.display = mode === 'ai' ? 'block' : 'none';
    });
  });

  // 手動出題提交
  document.getElementById('qgSubmitBtn')?.addEventListener('click', () => _submitManualQuestion());

  // AI 出題
  document.getElementById('qgAIBtn')?.addEventListener('click', () => _generateAIQuestion());

  // 鎖定按鈕
  document.getElementById('qgLockBtn')?.addEventListener('click', () => _lockZoneAndShowQR());

  // 使用歷史題目
  content.querySelectorAll('.qg-use-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const qId = btn.dataset.questionId;
      try {
        btn.disabled = true;
        btn.textContent = '設定中...';
        await ZonesAPI.setCurrentQuestion(_qgZoneId, qId);
        _qgZone = await ZonesAPI.getZone(_qgZoneId);
        _renderQuestionGenPanel(document.getElementById('qgContent'));
      } catch (err) {
        console.error('setCurrentQuestion:', err);
        alert('設定失敗');
        btn.disabled = false;
        btn.textContent = '使用此題';
      }
    });
  });
}

/* ── AI 出題流程 ── */
async function _generateAIQuestion() {
  const keyword = document.getElementById('qgAIKeyword')?.value.trim();
  const btn = document.getElementById('qgAIBtn');
  const resultDiv = document.getElementById('qgAIResult');
  if (!keyword || !btn || !resultDiv) return;

  if (!keyword) {
    document.getElementById('qgAIKeyword')?.classList.add('input--error');
    return;
  }

  // 顯示載入狀態
  btn.disabled = true;
  resultDiv.innerHTML = `
    <div class="qg-ai-loading">
      <div class="qg-ai-loading__spinner"></div>
      <div class="qg-ai-loading__text">AI 正在生成題目...</div>
    </div>
  `;

  try {
    const data = await AIQuestionAPI.generateQuestion(keyword, _qgZone?.zone_name || '');
    const questionText = data.question;

    if (!questionText) throw new Error('未能生成題目');

    // 顯示預覽
    resultDiv.innerHTML = `
      <div class="qg-ai-preview">
        <div class="qg-ai-preview__label">AI 生成預覽</div>
        <p class="qg-ai-preview__text">${_escapeHtml(questionText)}</p>
        <div class="qg-ai-preview__actions">
          <button class="btn btn--primary" id="qgAISaveBtn">確認使用</button>
          <button class="btn btn--ghost" id="qgAIRetryBtn">重新生成</button>
        </div>
      </div>
    `;

    // 確認儲存
    document.getElementById('qgAISaveBtn')?.addEventListener('click', async () => {
      const saveBtn = document.getElementById('qgAISaveBtn');
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '儲存中...'; }

      try {
        const question = await QuestionsAPI.createQuestion(_qgZoneId, questionText, 'ai');
        await ZonesAPI.setCurrentQuestion(_qgZoneId, question.id);
        _qgZone = await ZonesAPI.getZone(_qgZoneId);
        _qgQuestions = await QuestionsAPI.getQuestionsByZone(_qgZoneId);
        _renderQuestionGenPanel(document.getElementById('qgContent'));
      } catch (err) {
        console.error('AI save:', err);
        alert('儲存失敗：' + (err.message || '未知錯誤'));
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '確認使用'; }
      }
    });

    // 重新生成
    document.getElementById('qgAIRetryBtn')?.addEventListener('click', () => _generateAIQuestion());

  } catch (err) {
    console.error('AI generate:', err);
    resultDiv.innerHTML = `
      <div class="qg-ai-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>AI 生成失敗：${_escapeHtml(err.message || '請稍後再試')}。可切換至手動出題模式。</span>
      </div>
    `;
  }

  btn.disabled = false;
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
    AI 生成題目
  `;
}

async function _submitManualQuestion() {
  const textarea = document.getElementById('qgQuestionText');
  const btn = document.getElementById('qgSubmitBtn');
  if (!textarea || !btn) return;

  const text = textarea.value.trim();
  if (!text) {
    alert('請輸入題目內容');
    return;
  }
  if (text.length > 500) {
    alert('題目內容不可超過 500 字');
    return;
  }

  btn.disabled = true;
  btn.textContent = '儲存中...';

  try {
    const question = await QuestionsAPI.createQuestion(_qgZoneId, text, 'manual');
    // 設為當前題目
    await ZonesAPI.setCurrentQuestion(_qgZoneId, question.id);

    // 重新載入
    _qgZone = await ZonesAPI.getZone(_qgZoneId);
    _qgQuestions = await QuestionsAPI.getQuestionsByZone(_qgZoneId);
    _renderQuestionGenPanel(document.getElementById('qgContent'));
  } catch (err) {
    console.error('_submitManualQuestion:', err);
    alert('儲存失敗：' + (err.message || '未知錯誤'));
    btn.disabled = false;
    btn.textContent = '儲存題目';
  }
}

async function _lockZoneAndShowQR() {
  const btn = document.getElementById('qgLockBtn');
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = '鎖定中...';

  try {
    await ZonesAPI.lockZone(_qgZoneId);
    _qgZone.is_locked = true;

    // 進入鎖定頁面
    const content = document.getElementById('qgContent');
    if (content) _renderLockedPage(content);
  } catch (err) {
    console.error('_lockZoneAndShowQR:', err);
    alert('鎖定失敗');
    btn.disabled = false;
    btn.textContent = '鎖定並顯示 QR Code';
  }
}

function _renderLockedPage(content) {
  const questionId = _qgZone.current_question_id;
  const questionText = _qgZone.questions?.content || '';
  const qrUrl = `${window.location.origin}${window.location.pathname}#/answer/${questionId}`;

  // 隱藏 nav bar
  const navBar = document.getElementById('navBar');
  if (navBar) navBar.style.display = 'none';

  // 切換為全螢幕佈局
  const app = document.getElementById('app');
  if (app && app.firstElementChild) {
    app.firstElementChild.className = 'layout-matrix';
  }

  content.innerHTML = `
    <div class="qg-locked-page">
      <div class="qg-locked-page__header">
        <span class="qg-locked-page__zone fx-text-glitch" data-text="${_qgZone.zone_name}">${_qgZone.zone_name}</span>
        <span class="qg-locked-page__badge">已鎖定</span>
      </div>

      <div class="qg-locked-page__question">
        <p>${_escapeHtml(questionText)}</p>
      </div>

      <div class="qg-locked-page__qr" id="qgQRContainer">
        <div class="subtitle-cyber">正在產生 QR Code...</div>
      </div>

      <div class="qg-locked-page__url">
        <span class="data-label">掃描作答</span>
        <span class="qg-locked-page__url-text">${qrUrl}</span>
      </div>

      ${_isIPad() ? `
      <div class="qg-locked-page__unlock">
        <button class="btn btn--ghost" id="qgUnlockBtn" style="font-size:var(--text-xs);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5"></path>
          </svg>
          解鎖
        </button>
      </div>
      ` : ''}
    </div>
  `;

  // 生成 QR Code
  setTimeout(() => {
    const qrContainer = document.getElementById('qgQRContainer');
    if (qrContainer && typeof QRCode !== 'undefined') {
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: qrUrl,
        width: 256,
        height: 256,
        colorDark: '#ffffff',
        colorLight: '#000000',
        correctLevel: QRCode.CorrectLevel.M
      });
    } else if (qrContainer) {
      qrContainer.innerHTML = `
        <div style="color:var(--color-text-muted);font-size:var(--text-sm);">
          QR Code 庫未載入<br>
          <span style="font-family:var(--font-mono);font-size:var(--text-xs);word-break:break-all;">${qrUrl}</span>
        </div>
      `;
    }
  }, 100);

  // 嘗試全螢幕
  _tryFullscreen();

  // 綁定解鎖事件
  setTimeout(() => {
    document.getElementById('qgUnlockBtn')?.addEventListener('click', () => _unlockZone());
  }, 0);

  // 攔截返回
  window.addEventListener('beforeunload', _preventLeave);
}

function _preventLeave(e) {
  e.preventDefault();
  e.returnValue = '';
}

async function _unlockZone() {
  try {
    await ZonesAPI.unlockZone(_qgZoneId);
    window.removeEventListener('beforeunload', _preventLeave);

    // 退出全螢幕
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    // 恢復 nav bar
    const navBar = document.getElementById('navBar');
    if (navBar) navBar.style.display = 'flex';

    // 重新載入題目生成頁
    _qgZone = await ZonesAPI.getZone(_qgZoneId);
    _qgQuestions = await QuestionsAPI.getQuestionsByZone(_qgZoneId);

    const content = document.getElementById('qgContent');
    const app = document.getElementById('app');
    if (app && app.firstElementChild) {
      app.firstElementChild.className = 'layout-mobile';
    }
    if (content) _renderQuestionGenPanel(content);
  } catch (err) {
    console.error('_unlockZone:', err);
    alert('解鎖失敗');
  }
}

function _tryFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    el.requestFullscreen().catch(() => {});
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  }
}

function _subscribeZoneChanges() {
  _qgChannel = supabaseClient
    .channel('zone-detail-' + _qgZoneId)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'zones',
      filter: `id=eq.${_qgZoneId}`
    }, async (payload) => {
      // 如果被其他地方鎖定或解鎖，同步更新
      _qgZone = await ZonesAPI.getZone(_qgZoneId);
      const content = document.getElementById('qgContent');
      if (!content) return;

      if (_qgZone.is_locked && _qgZone.current_question_id) {
        _renderLockedPage(content);
      } else {
        _qgQuestions = await QuestionsAPI.getQuestionsByZone(_qgZoneId);
        const app = document.getElementById('app');
        if (app && app.firstElementChild) {
          app.firstElementChild.className = 'layout-mobile';
        }
        const navBar = document.getElementById('navBar');
        if (navBar) navBar.style.display = 'flex';
        window.removeEventListener('beforeunload', _preventLeave);
        _renderQuestionGenPanel(content);
      }
    })
    .subscribe();
}

/* ── 鎖定頁面直達路由 ── */
async function renderLockedQRPage(params) {
  _qgZoneId = parseInt(params.id, 10);

  const container = document.createElement('div');
  container.className = 'layout-matrix';

  container.innerHTML = `
    <main id="qgContent" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
      <div class="subtitle-cyber">載入中...</div>
    </main>
  `;

  setTimeout(async () => {
    try {
      _qgZone = await ZonesAPI.getZone(_qgZoneId);
      if (!_qgZone) return;
      const content = document.getElementById('qgContent');
      if (!content) return;

      if (_qgZone.is_locked && _qgZone.current_question_id) {
        _renderLockedPage(content);
      } else {
        // 若未鎖定，跳回題目生成頁
        Router.navigate('zones/' + _qgZoneId);
      }
    } catch (err) {
      console.error('renderLockedQRPage:', err);
    }
  }, 0);

  return container;
}
