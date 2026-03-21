/* ================================================================
   answer.js — 掃碼作答頁 (T-017)  1-BIT TERMINAL STYLE
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
        &larr; ABORT
      </button>
      <span class="layout-mobile__header-title">RESPOND</span>
      <span></span>
    </header>
    <main class="layout-mobile__content" id="ansContent">
      <div style="text-align:center;padding:var(--space-8) 0;">
        <div class="blink" style="font-family:var(--font-terminal);color:var(--color-blood-red);">LOADING...</div>
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
    _answerQuestion = await QuestionsAPI.getQuestion(_answerQuestionId);
    if (!_answerQuestion) {
      content.innerHTML = `
        <div class="terminal-wrapper" style="margin:0 auto;">
          <div class="terminal-header">
            <span>ERROR</span>
            <span style="font-size:0.8rem;">404</span>
          </div>
          <div class="terminal-content" style="text-align:center;padding:2rem;">
            <div style="font-size:1.2rem;font-weight:bold;margin-bottom:12px;">QUESTION NOT FOUND</div>
            <div style="font-size:0.85rem;opacity:0.7;margin-bottom:16px;">此題目不存在或已被刪除</div>
            <button class="action-btn" onclick="Router.navigate('profile')">[RETURN]</button>
          </div>
        </div>
      `;
      return;
    }

    const _ansProfile = await UsersAPI.getCurrentProfile();
    const _ansIsParliament = _ansProfile && _ansProfile.delegate_status === 'parliament';

    if (_ansIsParliament) {
      _existingAnswer = await AnswersAPI.getMyAnswer(_answerQuestionId);
    }

    _renderAnswerForm(content, _ansIsParliament);
  } catch (err) {
    console.error('_initAnswerPage:', err);
    content.innerHTML = `
      <div class="terminal-wrapper" style="margin:0 auto;">
        <div class="terminal-header">
          <span>SYSTEM ERROR</span>
        </div>
        <div class="terminal-content" style="text-align:center;padding:2rem;">
          <div style="font-size:1.1rem;font-weight:bold;">LOAD FAILED</div>
          <div style="font-size:0.85rem;opacity:0.7;margin-top:8px;">載入失敗，請重新整理頁面</div>
        </div>
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

  // Parse zone name parts
  const nameParts = zoneName.split(' // ');
  const enName = nameParts[0] || zoneName;
  const zhName = nameParts[1] || '';

  // Zone logo
  const zoneId = q.zone_id || q.zones?.id;
  const logo = (typeof _ZONE_LOGOS !== 'undefined' && zoneId) ? _ZONE_LOGOS[zoneId] : null;
  const isCross = zoneId === 8;

  const logoHtml = isCross
    ? `<div style="width:40px;height:40px;flex-shrink:0;border:2px solid var(--color-blood-red);display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:bold;color:var(--color-blood-red);">X</div>`
    : (logo
      ? `<img class="zone-logo" src="${logo}" alt="${_escapeHtml(enName)}">`
      : '');

  content.innerHTML = `
    <div class="terminal-wrapper scan-line-anim" style="margin:0 auto;">
      <div class="terminal-header">
        <span>RESPOND // 作答</span>
        <span style="font-size:0.8rem;">${isEdit ? '[EDIT MODE]' : '[NEW]'}</span>
      </div>

      <div class="terminal-content">
        <!-- Zone Display -->
        <div class="zone-display">
          ${logoHtml}
          <div class="zone-info">
            <div class="zone-label-1bit">${_escapeHtml(enName)}</div>
            ${zhName ? `<div class="zone-sub">${_escapeHtml(zhName)}</div>` : ''}
          </div>
        </div>

        <!-- Question Display -->
        <div class="output-text" id="ansQuestionText">${renderQuestionHtml(q.content)}</div>

        ${!isParliament ? `
        <!-- Alternate Delegate Notice -->
        <div style="border:2px dashed var(--color-blood-red);padding:16px;text-align:center;margin-top:12px;">
          <div style="font-size:1rem;font-weight:bold;text-transform:uppercase;margin-bottom:6px;">[ACCESS DENIED]</div>
          <div style="font-size:0.85rem;opacity:0.7;">備選代表 — 僅議會代表可提交答案</div>
        </div>
        ` : `
        <!-- Answer Form -->
        <div id="ansFormSection">
          ${isEdit ? `
          <div style="border:1px dashed var(--color-blood-red);padding:8px 12px;margin-bottom:12px;font-size:0.8rem;opacity:0.7;display:flex;align-items:center;gap:6px;">
            <span>[!]</span>
            <span>已作答 — 可修改答案</span>
            <span style="margin-left:auto;">${_ansFormatTime(updatedAt)}</span>
          </div>
          ` : ''}

          <div style="margin-bottom:8px;">
            <div style="font-size:0.85rem;text-transform:uppercase;margin-bottom:6px;opacity:0.7;">// YOUR RESPONSE</div>
            <textarea
              class="textarea"
              id="ansTextarea"
              rows="6"
              placeholder="輸入你的答案..."
              maxlength="1000"
              style="font-size:1rem;"
            >${_escapeHtml(existingContent)}</textarea>
            <div style="font-size:0.75rem;opacity:0.5;text-align:right;margin-top:4px;" id="ansCharCount">${existingContent.length} / 1000</div>
          </div>

          <div id="ansError" style="display:none;text-align:center;margin-bottom:8px;font-size:0.9rem;border:1px solid var(--color-blood-red);padding:6px;"></div>

          <button class="action-btn" id="ansSubmitBtn">
            ${isEdit ? '[UPDATE] 更新答案' : '[SUBMIT] 提交答案'}
          </button>
        </div>

        <!-- Success State -->
        <div id="ansSuccess" style="display:none;text-align:center;padding:1.5rem 0;">
          <div style="font-size:2rem;font-weight:bold;margin-bottom:8px;">TRANSMITTED</div>
          <div class="blink" style="font-size:0.9rem;margin-bottom:16px;">/// 答案已成功${isEdit ? '更新' : '提交'} ///</div>

          <div class="counter-display" style="margin-bottom:16px;">
            <span>STATUS: COMPLETE</span>
            <span>Q-${_answerQuestionId?.slice(0, 8) || '???'}</span>
          </div>

          <div style="display:flex;gap:8px;">
            <button class="action-btn" id="ansEditAgainBtn" style="font-size:1rem;">[EDIT] 繼續修改</button>
            <button class="action-btn" id="ansBackToProfile" style="font-size:1rem;background:var(--color-blood-red);color:#000;">[RETURN] 返回</button>
          </div>
        </div>
        `}

        <!-- Counter -->
        <div class="counter-display">
          <span>Q-ID: ${_answerQuestionId?.slice(0, 8) || '???'}</span>
          <span>ZONE: ${_escapeHtml(enName)}</span>
        </div>
      </div>
    </div>
  `;

  // Run scrambler on question text
  const qTextEl = document.getElementById('ansQuestionText');
  if (qTextEl) {
    const rawText = typeof stripQuestionHtml === 'function' ? stripQuestionHtml(q.content) : q.content.replace(/<[^>]*>/g, '');
    const htmlContent = renderQuestionHtml(q.content);
    const scrambler = new Scrambler(qTextEl);
    scrambler.run(rawText, htmlContent);
  }

  if (isParliament) _bindAnswerEvents();
}

function _bindAnswerEvents() {
  const textarea = document.getElementById('ansTextarea');
  const charCount = document.getElementById('ansCharCount');
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / 1000`;
      if (len > 1000) charCount.style.color = '#ff0000';
      else charCount.style.color = '';
    });
  }

  document.getElementById('ansSubmitBtn')?.addEventListener('click', () => _submitAnswer());

  document.getElementById('ansEditAgainBtn')?.addEventListener('click', () => {
    document.getElementById('ansSuccess').style.display = 'none';
    const form = document.getElementById('ansFormSection');
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

  if (!text) {
    if (errorEl) {
      errorEl.textContent = '[ERROR] 請輸入答案內容';
      errorEl.style.display = 'block';
    }
    textarea.style.borderColor = '#ff0000';
    return;
  }

  if (text.length > 1000) {
    if (errorEl) {
      errorEl.textContent = '[ERROR] 答案不可超過 1000 字';
      errorEl.style.display = 'block';
    }
    return;
  }

  textarea.style.borderColor = '';
  if (errorEl) errorEl.style.display = 'none';

  btn.disabled = true;
  btn.textContent = 'TRANSMITTING...';

  try {
    const answer = await AnswersAPI.submitAnswer(_answerQuestionId, text);
    _existingAnswer = answer;

    const form = document.getElementById('ansFormSection');
    const success = document.getElementById('ansSuccess');
    if (form) form.style.display = 'none';
    if (success) success.style.display = 'block';
  } catch (err) {
    console.error('_submitAnswer:', err);
    if (errorEl) {
      errorEl.textContent = '[FAIL] ' + (err.message || '未知錯誤');
      errorEl.style.display = 'block';
    }
    btn.disabled = false;
    btn.textContent = _existingAnswer ? '[UPDATE] 更新答案' : '[SUBMIT] 提交答案';
  }
}

function _ansFormatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}
