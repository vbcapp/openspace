/* ================================================================
   question-gen.js — 題目生成頁 (T-015) + iPad 鎖定/QR Code (T-016)
   ================================================================ */

let _qgZoneId = null;
let _qgZone = null;
let _qgQuestions = [];
let _qgChannel = null;

/* ── 1-BIT Text Scrambler ── */
class Scrambler {
  constructor(el) {
    this.el = el;
    this.chars = '█▓▒░▀▄▌▐';
  }
  run(raw, html) {
    const len = Math.max(this.el.innerText.length, raw.length);
    return new Promise(resolve => {
      let frame = 0;
      const interval = setInterval(() => {
        let out = '';
        for (let i = 0; i < len; i++) {
          if (frame > 20 + Math.random() * 20) {
            out += raw[i] || '';
          } else {
            out += this.chars[Math.floor(Math.random() * this.chars.length)];
          }
        }
        this.el.innerText = out;
        frame++;
        if (frame > 50) {
          clearInterval(interval);
          this.el.innerHTML = html;
          resolve();
        }
      }, 30);
    });
  }
}

let _qgGenCounter = 0;

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

/* DEV: mock zone data keyed by zone id */
const _MOCK_ZONE_MAP = {
  1: { id: 1, zone_name: 'PRIDE // 驕傲之塔', is_locked: false, current_question_id: 'q1', questions: { id: 'q1', content: '如果AI能<span class="invert-hl">完美預測</span>每個人的未來，你會選擇知道自己的命運嗎？', source_type: 'classic', created_at: '2026-03-18T10:00:00Z' } },
  2: { id: 2, zone_name: 'GREED // 全知之貪', is_locked: false, current_question_id: 'q2', questions: { id: 'q2', content: '當AI掌握了全球<span class="invert-hl">財富分配</span>的權力，你願意讓它決定你能擁有多少？', source_type: 'classic', created_at: '2026-03-18T10:05:00Z' } },
  3: { id: 3, zone_name: 'LUST // 色慾之鏡', is_locked: true, current_question_id: 'q3', questions: { id: 'q3', content: '如果AI能創造出<span class="invert-hl">完美的虛擬伴侶</span>，你還會追求真實的人際關係嗎？', source_type: 'classic', created_at: '2026-03-18T10:10:00Z' } },
  4: { id: 4, zone_name: 'GLUTTONY // 暴食之腦', is_locked: false, current_question_id: 'q4', questions: { id: 'q4', content: '當AI可以直接向你的大腦<span class="invert-hl">注入快樂</span>，你會放棄真實的體驗嗎？', source_type: 'ai', created_at: '2026-03-18T10:15:00Z' } },
  5: { id: 5, zone_name: 'SLOTH // 存在之墓', is_locked: false, current_question_id: null, questions: null },
  6: { id: 6, zone_name: 'WRATH // 全知之怒', is_locked: false, current_question_id: 'q6', questions: { id: 'q6', content: '如果AI判定某人未來會犯罪，你支持在他<span class="invert-hl">行動之前</span>就逮捕他嗎？', source_type: 'classic', created_at: '2026-03-18T10:25:00Z' } },
  7: { id: 7, zone_name: 'ENVY // 完美之妒', is_locked: true, current_question_id: 'q7', questions: { id: 'q7', content: '當AI讓每個人都能擁有<span class="invert-hl">完美的外貌</span>，「美」還有意義嗎？', source_type: 'classic', created_at: '2026-03-18T10:30:00Z' } },
  8: { id: 8, zone_name: 'CROSS-ZONE // 跨區極限', is_locked: false, current_question_id: 'q8', questions: { id: 'q8', content: '如果必須在<span class="invert-hl">人類自由意志</span>和AI帶來的世界和平之間選擇，你選哪個？', source_type: 'classic', created_at: '2026-03-18T10:35:00Z' } },
};

const _MOCK_HISTORY = [
  { id: 'h1', content: '當AI的智慧<span class="invert-hl">超越人類</span>，我們還有權關掉它嗎？', source_type: 'classic', created_at: '2026-03-18T09:00:00Z' },
  { id: 'h2', content: '如果AI能讓你<span class="invert-hl">永生不死</span>，但代價是放棄所有情感，你願意嗎？', source_type: 'ai', created_at: '2026-03-18T08:30:00Z' },
];

async function _initQuestionGenPage() {
  const content = document.getElementById('qgContent');
  if (!content) return;

  try {
    let zone = null;
    try {
      zone = await ZonesAPI.getZone(_qgZoneId);
    } catch (e) {
      console.warn('getZone API failed');
    }

    // DEV fallback: use mock data if no auth/data
    if (!zone) {
      zone = _MOCK_ZONE_MAP[_qgZoneId];
    }
    if (!zone) {
      content.innerHTML = '<div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">找不到此區域</div>';
      return;
    }
    _qgZone = zone;

    // Update header title
    const titleEl = document.getElementById('qgTitle');
    if (titleEl) titleEl.textContent = zone.zone_name;

    // 若已鎖定，直接顯示鎖定頁面
    if (_qgZone.is_locked && _qgZone.current_question_id) {
      _renderLockedPage(content);
      return;
    }

    try {
      _qgQuestions = await QuestionsAPI.getQuestionsByZone(_qgZoneId);
    } catch (e) {
      _qgQuestions = _MOCK_HISTORY;
    }
    if (!_qgQuestions || _qgQuestions.length === 0) {
      _qgQuestions = _MOCK_HISTORY;
    }

    _renderQuestionGenPanel(content);
    try { _subscribeZoneChanges(); } catch(e) {}
  } catch (err) {
    console.error('_initQuestionGenPage:', err);
    content.innerHTML = '<div style="text-align:center;padding:var(--space-8) 0;color:var(--color-error);">載入失敗</div>';
  }
}

function _renderQuestionGenPanel(content) {
  const currentQ = _qgZone.questions;
  const hasCurrentQ = currentQ && currentQ.content;
  const logo = typeof _ZONE_LOGOS !== 'undefined' ? _ZONE_LOGOS[_qgZoneId] : null;
  const nameParts = (_qgZone.zone_name || '').split(' // ');
  const enName = nameParts[0] || _qgZone.zone_name;
  const zhName = nameParts[1] || '';
  const isCross = _qgZoneId === 8;

  content.innerHTML = `
    <!-- 1-BIT Zone Display -->
    <div class="zone-display" style="display:flex;">
      ${isCross
        ? '<div style="width:40px;height:40px;flex-shrink:0;border:2px solid var(--color-blood-red);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:bold;color:var(--color-blood-red);">X</div>'
        : (logo ? `<img src="${logo}" alt="${enName}" class="zone-logo">` : '')}
      <div class="zone-info">
        <div class="zone-label-1bit">${enName}</div>
        <div class="zone-sub">${zhName}</div>
      </div>
    </div>

    <!-- Loader Bar -->
    <div class="loader-box" id="qgLoaderBox">
      <div class="loader-bar" id="qgLoaderBar"></div>
    </div>

    <!-- 題目顯示區（scrambler target） -->
    <div class="output-text" id="qgOutputText">
      ${hasCurrentQ ? renderQuestionHtml(currentQ.content) : '[ SYSTEM READY ]<br>WAITING FOR INPUT...'}
    </div>

    <!-- Pain point / meta -->
    <div class="pain-box" id="qgPainBox">
      ${hasCurrentQ ? '<span class="blink">_</span> >> CURRENT QUESTION // ' + (currentQ.source_type === 'ai' ? 'AI GENERATED' : 'MANUAL / BANK') : ''}
    </div>

    <!-- 出題方式切換 Tab -->
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <button class="qg-tab qg-tab--active" data-mode="execute" style="flex:1;">>>> EXECUTE 抽題</button>
      <button class="qg-tab" data-mode="manual" style="flex:1;">手動出題</button>
    </div>

    <!-- 抽題模式（預設顯示） -->
    <div id="qgFormExecute">
      <button class="action-btn" id="qgExecuteBtn">>>> EXECUTE</button>
      <div id="qgAIResult"></div>
    </div>

    <!-- 手動出題表單（隱藏） -->
    <div id="qgFormManual" style="display:none;">
      <div class="form-field" style="margin-bottom:12px;">
        <label class="form-field__label" style="color:var(--color-blood-red);">題目內容</label>
        <textarea class="textarea" id="qgQuestionText" rows="4" placeholder="輸入題目內容..."></textarea>
        <span class="form-field__hint" id="qgCharCount" style="color:rgba(255,63,0,0.5);">0 / 500</span>
      </div>
      <button class="action-btn" id="qgSubmitBtn">>>> SAVE</button>
    </div>

    <!-- Counter Display -->
    <div class="counter-display">
      <span id="qgSeedUI">ID: 000000</span>
      <span id="qgGenCount">GEN: ${_qgGenCounter}</span>
    </div>

    ${hasCurrentQ ? `
    <div style="margin-top:12px;">
      <button class="action-btn" id="qgLockBtn" style="border-width:2px;">LOCK & SHOW QR CODE</button>
    </div>
    ` : ''}

    <!-- 歷史題目 -->
    ${_qgQuestions.length > 0 ? `
      <div style="margin-top:16px;border-top:1px dashed var(--color-blood-red);padding-top:12px;">
        <div style="font-size:0.9rem;text-transform:uppercase;margin-bottom:8px;opacity:0.7;">HISTORY (${_qgQuestions.length})</div>
        ${_qgQuestions.slice(0, 5).map(q => `
          <div class="qg-history-item" data-question-id="${q.id}">
            <p class="qg-history-item__text">${renderQuestionHtml(q.content)}</p>
            <div class="qg-history-item__meta">
              <span style="font-size:0.75rem;opacity:0.6;">${q.source_type === 'ai' ? 'AI' : 'MANUAL'}</span>
              <span style="font-size:0.75rem;opacity:0.6;">${new Date(q.created_at).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <button class="top-nav-btn qg-use-btn" data-question-id="${q.id}">USE</button>
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
      if (len > 500) charCount.style.color = '#ff0000';
      else charCount.style.color = 'rgba(255,63,0,0.5)';
    });
  }

  // Tab 切換（execute / manual）
  content.querySelectorAll('.qg-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      content.querySelectorAll('.qg-tab').forEach(t => t.classList.remove('qg-tab--active'));
      tab.classList.add('qg-tab--active');
      const mode = tab.dataset.mode;
      const execForm = document.getElementById('qgFormExecute');
      const manualForm = document.getElementById('qgFormManual');
      if (execForm) execForm.style.display = mode === 'execute' ? 'block' : 'none';
      if (manualForm) manualForm.style.display = mode === 'manual' ? 'block' : 'none';
    });
  });

  // EXECUTE 抽題
  document.getElementById('qgExecuteBtn')?.addEventListener('click', () => _generateAIQuestion());

  // 手動出題提交
  document.getElementById('qgSubmitBtn')?.addEventListener('click', () => _submitManualQuestion());

  // 鎖定按鈕
  document.getElementById('qgLockBtn')?.addEventListener('click', () => _lockZoneAndShowQR());

  // 使用歷史題目
  content.querySelectorAll('.qg-use-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const qId = btn.dataset.questionId;
      try {
        btn.disabled = true;
        btn.textContent = 'SETTING...';
        await ZonesAPI.setCurrentQuestion(_qgZoneId, qId);
        _qgZone = await ZonesAPI.getZone(_qgZoneId);
        _renderQuestionGenPanel(document.getElementById('qgContent'));
      } catch (err) {
        console.error('setCurrentQuestion:', err);
        alert('設定失敗');
        btn.disabled = false;
        btn.textContent = 'USE';
      }
    });
  });
}

/* ── 題庫抽題流程（含 loader + scrambler 動畫） ── */
let _qgBusy = false;

function _generateAIQuestion() {
  if (_qgBusy) return;
  _qgBusy = true;
  _qgGenCounter++;

  const outputEl = document.getElementById('qgOutputText');
  const painEl = document.getElementById('qgPainBox');
  const loaderBox = document.getElementById('qgLoaderBox');
  const loaderBar = document.getElementById('qgLoaderBar');
  const resultDiv = document.getElementById('qgAIResult');
  const genCountEl = document.getElementById('qgGenCount');
  const seedEl = document.getElementById('qgSeedUI');

  if (!outputEl || !loaderBox) { _qgBusy = false; return; }

  // 從 QuestionBank 抽一題
  const picked = QuestionBank.pickRandom(_qgZoneId);
  const questionHtml = picked.content;
  const questionRaw = questionHtml.replace(/<[^>]*>/g, '');

  // Pain point 顯示
  const zoneEnName = (_qgZone.zone_name || '').split(' // ')[0];
  const painText = '>> ZONE: ' + zoneEnName + ' // BILL #' + _qgGenCounter;

  // Update counter
  if (genCountEl) genCountEl.textContent = 'GEN: ' + _qgGenCounter;
  if (seedEl) seedEl.textContent = 'ID: ' + Math.random().toString(16).substr(2, 6).toUpperCase();

  // 清空 pain + 結果區
  if (painEl) painEl.innerHTML = '';
  if (resultDiv) resultDiv.innerHTML = '';

  // Show loader
  loaderBox.style.display = 'block';
  loaderBar.style.width = '0%';

  let w = 0;
  const loaderInterval = setInterval(() => {
    w += 10;
    loaderBar.style.width = w + '%';
    if (w >= 100) {
      clearInterval(loaderInterval);
      loaderBox.style.display = 'none';

      // Scrambler 動畫
      const scrambler = new Scrambler(outputEl);
      scrambler.run(questionRaw, renderQuestionHtml(questionHtml)).then(() => {
        if (painEl) painEl.innerHTML = '<span class="blink">_</span> ' + painText;
        _qgBusy = false;

        // 顯示確認/再抽按鈕
        if (resultDiv) {
          resultDiv.innerHTML = `
            <div style="display:flex;gap:8px;margin-top:12px;">
              <button class="action-btn" id="qgAISaveBtn" style="flex:1;border-width:2px;font-size:1rem;">CONFIRM & SAVE</button>
              <button class="top-nav-btn" id="qgAIRetryBtn" style="padding:8px 12px;">REROLL</button>
            </div>
          `;

          setTimeout(() => {
            document.getElementById('qgAISaveBtn')?.addEventListener('click', async () => {
              const saveBtn = document.getElementById('qgAISaveBtn');
              if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'SAVING...'; }
              try {
                const question = await QuestionsAPI.createQuestion(_qgZoneId, questionHtml, 'manual');
                await ZonesAPI.setCurrentQuestion(_qgZoneId, question.id);
                _qgZone = await ZonesAPI.getZone(_qgZoneId);
                _qgQuestions = await QuestionsAPI.getQuestionsByZone(_qgZoneId);
                _renderQuestionGenPanel(document.getElementById('qgContent'));
              } catch (err) {
                console.error('Bank save error:', err);
                alert('儲存失敗：' + (err.message || '未知錯誤'));
                if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'CONFIRM & SAVE'; }
              }
            });
            document.getElementById('qgAIRetryBtn')?.addEventListener('click', () => _generateAIQuestion());
          }, 0);
        }
      });
    }
  }, 30);
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

  // Zone info
  const nameParts = (_qgZone.zone_name || '').split(' // ');
  const enName = nameParts[0] || _qgZone.zone_name;
  const zhName = nameParts[1] || '';
  const logo = typeof _ZONE_LOGOS !== 'undefined' ? _ZONE_LOGOS[_qgZoneId] : null;
  const isCross = _qgZoneId === 8;

  const logoHtml = isCross
    ? `<div style="width:48px;height:48px;flex-shrink:0;border:3px solid var(--color-blood-red);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:bold;color:var(--color-blood-red);">X</div>`
    : (logo ? `<img src="${logo}" alt="${enName}" style="width:48px;height:48px;object-fit:contain;flex-shrink:0;filter:brightness(0) invert(31%) sepia(98%) saturate(6630%) hue-rotate(10deg) brightness(103%) contrast(107%);">` : '');

  // 隱藏 nav bar
  const navBar = document.getElementById('navBar');
  if (navBar) navBar.style.display = 'none';

  // 切換為全螢幕佈局
  const app = document.getElementById('app');
  if (app && app.firstElementChild) {
    app.firstElementChild.className = 'layout-matrix';
  }

  content.innerHTML = `
    <div class="qg-locked-page scan-line-anim">
      <!-- Terminal Header -->
      <div style="width:100%;max-width:600px;border:4px solid var(--color-blood-red);background:#000;box-shadow:10px 10px 0px rgba(255,63,0,0.3);">
        <div class="terminal-header" style="font-size:1.4rem;">
          <span>LOCKED</span>
          <span class="blink" style="font-size:0.9rem;">[ACTIVE]</span>
        </div>

        <div style="padding:1.5rem;">
          <!-- Zone Display -->
          <div class="zone-display" style="margin-bottom:16px;">
            ${logoHtml}
            <div class="zone-info">
              <div class="zone-label-1bit" style="font-size:1.3rem;">${enName}</div>
              ${zhName ? `<div class="zone-sub">${zhName}</div>` : ''}
            </div>
          </div>

          <!-- Question -->
          <div class="output-text" id="qgLockedQuestion" style="font-size:clamp(1.1rem,3vw,1.5rem);text-align:center;">
            ${renderQuestionHtml(questionText)}
          </div>

          <!-- QR Code -->
          <div style="display:flex;justify-content:center;margin:16px 0;">
            <div class="qg-locked-page__qr" id="qgQRContainer" style="display:inline-block;">
              <div class="blink" style="padding:2rem;">GENERATING QR...</div>
            </div>
          </div>

          <!-- URL -->
          <div style="text-align:center;margin-bottom:12px;">
            <div style="font-size:0.8rem;text-transform:uppercase;margin-bottom:4px;opacity:0.7;">// SCAN TO RESPOND</div>
            <div style="font-size:0.7rem;opacity:0.5;word-break:break-all;">${qrUrl}</div>
          </div>

          <!-- Counter -->
          <div class="counter-display">
            <span>ZONE: ${enName}</span>
            <span>Q-${questionId?.slice(0, 8) || '???'}</span>
          </div>
        </div>
      </div>

      <div class="qg-locked-page__unlock">
        <button class="action-btn" id="qgUnlockBtn" style="border-width:2px;font-size:0.9rem;width:auto;padding:8px 16px;">[UNLOCK] 解鎖</button>
      </div>
    </div>
  `;

  // Scrambler on locked question text
  setTimeout(() => {
    const lockedQEl = document.getElementById('qgLockedQuestion');
    if (lockedQEl && questionText) {
      const rawText = questionText.replace(/<[^>]*>/g, '');
      const scrambler = new Scrambler(lockedQEl);
      scrambler.run(rawText, renderQuestionHtml(questionText));
    }
  }, 50);

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
        <div style="font-size:0.85rem;opacity:0.7;">
          QR Code 庫未載入<br>
          <span style="font-size:0.75rem;word-break:break-all;">${qrUrl}</span>
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
