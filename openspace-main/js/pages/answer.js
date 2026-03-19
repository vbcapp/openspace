/* ================================================================
   answer.js — 掃碼作答頁 (T-017)
   路由: #/answer/:questionId
   ================================================================ */

let _answerQuestionId = null;
let _answerQuestion = null;
let _existingAnswer = null;

function _cleanupAnswerPage() {
  _answerQuestionId = null;
  _answerQuestion = null;
  _existingAnswer = null;
}

async function renderAnswerPage(params) {
  _answerQuestionId = params.questionId;

  const container = document.createElement('div');
  container.className = 'layout-mobile';

  container.innerHTML = `
    <header class="layout-mobile__header">
      <button class="btn btn--ghost" id="ansBackBtn" style="font-size:var(--text-xs);padding:var(--space-1) var(--space-2);">
        &larr; 返回
      </button>
      <span class="layout-mobile__header-title">作答</span>
      <span></span>
    </header>
    <main class="layout-mobile__content" id="ansContent">
      <div style="text-align:center;padding:var(--space-8) 0;">
        <div class="subtitle-cyber">載入中...</div>
      </div>
    </main>
  `;

  setTimeout(() => _initAnswerPage(), 0);
  setTimeout(() => {
    document.getElementById('ansBackBtn')?.addEventListener('click', () => {
      Router.navigate('profile');
    });
  }, 0);

  return container;
}

async function _initAnswerPage() {
  const content = document.getElementById('ansContent');
  if (!content) return;

  try {
    // 載入題目資訊（含區域）
    _answerQuestion = await QuestionsAPI.getQuestion(_answerQuestionId);
    if (!_answerQuestion) {
      content.innerHTML = `
        <div class="ans-error-state">
          <div class="subtitle-cyber">找不到題目</div>
          <p>此題目不存在或已被刪除</p>
          <button class="btn btn--ghost" onclick="Router.navigate('profile')">返回個人頁</button>
        </div>
      `;
      return;
    }

    // 檢查議會代表身份
    const _ansProfile = await UsersAPI.getCurrentProfile();
    const _ansIsParliament = _ansProfile && _ansProfile.delegate_status === 'parliament';

    // 議會代表才載入已有答案
    if (_ansIsParliament) {
      _existingAnswer = await AnswersAPI.getMyAnswer(_answerQuestionId);
    }

    _renderAnswerForm(content, _ansIsParliament);
  } catch (err) {
    console.error('_initAnswerPage:', err);
    content.innerHTML = `
      <div class="ans-error-state">
        <div class="subtitle-cyber">載入失敗</div>
        <p>載入失敗，請重新整理頁面</p>
      </div>
    `;
  }
}

function _renderAnswerForm(content, isParliament) {
  if (isParliament === undefined) isParliament = true;
  const q = _answerQuestion;
  const zoneName = q.zones?.zone_name || 'UNKNOWN ZONE';
  const existingContent = _existingAnswer?.content || '';
  const isEdit = !!_existingAnswer;
  const updatedAt = _existingAnswer?.updated_at || _existingAnswer?.created_at;

  content.innerHTML = `
    <!-- 區域資訊 -->
    <div class="ans-zone-badge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      ${_escapeHtml(zoneName)}
    </div>

    <!-- 題目卡片 -->
    <div class="ans-question-card">
      <div class="ans-question-card__label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        題目
      </div>
      <p class="ans-question-card__text">${_escapeHtml(q.content)}</p>
    </div>

    ${!isParliament ? `
    <!-- 備選代表預覽提示 -->
    <div class="ans-preview-notice">
      <span class="badge badge--delegate-alt">備選代表</span>
      <p>僅議會代表可提交答案</p>
    </div>
    ` : `
    <!-- 作答表單 -->
    <div class="ans-form">
      ${isEdit ? `
        <div class="ans-edit-notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          你已作答過此題，可修改答案
          <span class="ans-edit-notice__time">${_ansFormatTime(updatedAt)}</span>
        </div>
      ` : ''}

      <div class="form-field">
        <label class="form-field__label">你的答案</label>
        <textarea
          class="textarea"
          id="ansTextarea"
          rows="6"
          placeholder="輸入你的答案..."
          maxlength="1000"
        >${_escapeHtml(existingContent)}</textarea>
        <span class="form-field__hint" id="ansCharCount">${existingContent.length} / 1000</span>
      </div>

      <div id="ansError" class="form-field__error" style="display:none;text-align:center;margin-bottom:var(--space-3);"></div>

      <button class="btn btn--primary btn--full" id="ansSubmitBtn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${isEdit ? '更新答案' : '提交答案'}
      </button>
    </div>

    <!-- 成功狀態（隱藏） -->
    <div id="ansSuccess" class="ans-success" style="display:none;">
      <div class="ans-success__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div class="subtitle-cyber">作答完成</div>
      <p>答案已成功${isEdit ? '更新' : '提交'}</p>
      <div class="ans-success__actions">
        <button class="btn btn--ghost" id="ansEditAgainBtn">繼續修改</button>
        <button class="btn btn--secondary" id="ansBackToProfile">返回個人頁</button>
      </div>
    </div>
    `}
  `;

  if (isParliament) _bindAnswerEvents();
}

function _bindAnswerEvents() {
  // 字數計算
  const textarea = document.getElementById('ansTextarea');
  const charCount = document.getElementById('ansCharCount');
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / 1000`;
      if (len > 1000) charCount.style.color = 'var(--color-error)';
      else charCount.style.color = 'var(--color-text-muted)';
    });
  }

  // 提交
  document.getElementById('ansSubmitBtn')?.addEventListener('click', () => _submitAnswer());

  // 成功後操作
  document.getElementById('ansEditAgainBtn')?.addEventListener('click', () => {
    document.getElementById('ansSuccess').style.display = 'none';
    const form = document.querySelector('.ans-form');
    if (form) form.style.display = 'block';
  });

  document.getElementById('ansBackToProfile')?.addEventListener('click', () => {
    Router.navigate('profile');
  });
}

async function _submitAnswer() {
  const textarea = document.getElementById('ansTextarea');
  const btn = document.getElementById('ansSubmitBtn');
  const errorEl = document.getElementById('ansError');
  if (!textarea || !btn) return;

  const text = textarea.value.trim();

  // 驗證
  if (!text) {
    if (errorEl) {
      errorEl.textContent = '請輸入答案內容';
      errorEl.style.display = 'block';
    }
    textarea.classList.add('input--error');
    return;
  }

  if (text.length > 1000) {
    if (errorEl) {
      errorEl.textContent = '答案不可超過 1000 字';
      errorEl.style.display = 'block';
    }
    return;
  }

  // 清除錯誤
  textarea.classList.remove('input--error');
  if (errorEl) errorEl.style.display = 'none';

  btn.disabled = true;
  btn.textContent = '提交中...';

  try {
    const answer = await AnswersAPI.submitAnswer(_answerQuestionId, text);
    _existingAnswer = answer;

    // 顯示成功狀態
    const form = document.querySelector('.ans-form');
    const success = document.getElementById('ansSuccess');
    if (form) form.style.display = 'none';
    if (success) success.style.display = 'block';
  } catch (err) {
    console.error('_submitAnswer:', err);
    if (errorEl) {
      errorEl.textContent = '提交失敗：' + (err.message || '未知錯誤');
      errorEl.style.display = 'block';
    }
    btn.disabled = false;
    btn.textContent = _existingAnswer ? '更新答案' : '提交答案';
  }
}

function _ansFormatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}
