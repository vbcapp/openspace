# AI末日議會 — 開發 Ticket 清單

> **依據**: PRD v1.0
> **建立日期**: 2026-03-09
> **狀態標記**: ⬜ 未開始 | 🔧 進行中 | ✅ 完成

---

## 總覽

| 階段 | Ticket 數量 | 內容 |
|------|------------|------|
| **P0** | T-001 ~ T-005 | Design System、PWA、Router、Supabase 初始化、Auth |
| **P1** | T-006 ~ T-007 | 矩陣 16×7 網格、Realtime 同步 |
| **P2** | T-008 ~ T-011 | 名片展示、編輯/頭像上傳、活動密碼、作答紀錄 |
| **P3** | T-012 ~ T-013 | 投票操作、排行榜 |
| **P4** | T-014 ~ T-016 | 11 區總覽、題目生成、iPad 鎖定/QR Code |
| **P5** | T-017 ~ T-018 | 掃碼作答、紀錄整合 |
| **P6** | T-019 ~ T-020 | 管理面板、AI 出題 |
| **非功能** | T-021 ~ T-022 | 行動端適配、效能與部署 |

---

## P0：基礎建設

### T-001：Design System 建置
- **優先級**: P0
- **狀態**: ✅
- **描述**: 建立完整的 CSS Design System
- **任務**:
  - [x] 建立 `css/tokens.css` — 寫入 PRD §7.1 所有 Design Tokens（色彩、字體、間距、圓角、陰影、動畫）
  - [x] 建立 `css/atoms.css` — 實作 Button、Input、Textarea、Avatar、Badge、Icon、Spinner 原子元件樣式
  - [x] 建立 `css/effects.css` — 實作 CRT 掃描線、Glitch 文字、死寂雜訊、呼吸燈、RGB 分裂、三角形裁切、Hover 還原特效
  - [x] 建立 `css/components.css` — 實作分子 & 組織層級元件樣式（PlayerCard、VoteChip、QuestionCard、FormField 等）
- **驗收**: 所有 CSS 變數可用，元件樣式與 `index 2.html` 風格一致
- **參考**: PRD §7, §8

---

### T-002：PWA 骨架
- **優先級**: P0
- **狀態**: ✅
- **描述**: 建立 PWA 基礎設施，讓 WebApp 可安裝並具備離線提示
- **任務**:
  - [x] 建立 `manifest.json` — 配置 app name、icons（192×192, 512×512）、theme_color、background_color、display: standalone
  - [x] 建立 `sw.js` — Service Worker 快取靜態資源（CSS、JS、字體），離線時返回友善提示頁
  - [x] 在 `index.html` 中引入 manifest 與 Service Worker 註冊
  - [x] 建立 PWA 圖示 `assets/icons/` 目錄及圖片
- **驗收**: Lighthouse PWA 分數 ≥ 90，可 Add to Home Screen
- **參考**: PRD §2.2, §9

---

### T-003：SPA 殼層 & Hash Router
- **優先級**: P0
- **狀態**: ✅
- **描述**: 建立單頁應用殼層與 Hash 路由系統
- **任務**:
  - [x] 完善 `index.html` — SPA 殼層（頂部狀態列 + 內容區 + 底部 Tab 導覽佔位）
  - [x] 實作 `js/router.js` — Hash Router 支援所有路由（`#/`, `#/profile`, `#/matrix`, `#/vote`, `#/zones` 等）
  - [x] 實作 `js/app.js` — 應用初始化、路由綁定、全域狀態管理
  - [x] 實作底部 3-Tab 導覽列（內嵌 index.html，含 Profile / Matrix / Zones）
- **驗收**: 切換 Tab 時 URL hash 正確變化，對應頁面正確渲染，底部導覽列高亮正確 Tab
- **參考**: PRD §3, §6.2

---

### T-004：Supabase 專案初始化
- **優先級**: P0
- **狀態**: ✅
- **描述**: 初始化 Supabase 後端，建立所有資料表、RLS 規則、Storage Bucket
- **任務**:
  - [x] 建立 Supabase 專案，取得 URL & anon key
  - [x] 建立資料表：`users`、`app_settings`、`votes`、`zones`、`questions`、`answers`（依 PRD §5.2 定義）
  - [x] 預設資料：`app_settings` 插入 `event_password` 和 `force_offline` 初始值；`zones` 插入 11 筆區域資料
  - [x] 設定 RLS 規則（依 PRD §5.5）
  - [x] 建立 Storage Bucket `avatars`（公開讀取、登入者限自己寫入）
  - [x] 啟用 Realtime 訂閱（`users.is_online`、`votes`、`zones.is_locked`）
  - [x] 實作 `js/supabase.js` — Supabase 客戶端初始化 & 基礎 API 封裝
- **驗收**: 所有資料表建立完成，RLS 正確限制存取，Storage 可上傳/讀取
- **參考**: PRD §5, database.md

---

### T-005：認證系統（Email 登入/註冊）
- **優先級**: P0
- **狀態**: ✅
- **描述**: 實作 Email + Password 註冊/登入流程
- **任務**:
  - [x] 實作 `js/auth.js` — 封裝 Supabase Auth 的 signUp、signIn、signOut、onAuthStateChange
  - [x] 實作 `login.html` — 登入/註冊頁面（Email + 密碼表單），末日風格 UI
  - [x] 註冊時自動分配 `player_number`（1–100 依序遞增）
  - [x] 未登入用戶自動導向登入頁，已登入用戶自動跳轉至個人頁
  - [x] 登出功能
- **驗收**: 新用戶可註冊並獲得編號，可登入/登出，路由守衛正確
- **參考**: PRD §4.1

---

## P1：矩陣登入牆

### T-006：矩陣頁 — 16×7 網格
- **優先級**: P1
- **依賴**: T-001, T-003, T-004
- **狀態**: ✅
- **描述**: 實作矩陣登入牆，完整移植 `index 2.html` 的視覺效果
- **任務**:
  - [ ] 實作 `js/components/matrix-grid.js` — MatrixGrid Web Component（16×7 網格）
  - [ ] 三角形 clip-path 頭像格：已登入顯示頭像+編號，未登入/空位顯示死寂雜訊
  - [ ] 從 Supabase 讀取所有 users 資料，渲染到對應格位
  - [ ] CRT 掃描線覆蓋層、Glitch 閃爍、故障動畫完整移植
  - [ ] 畫面上方顯示在線人數計數器 `ONLINE: XX/100`
- **驗收**: 矩陣外觀與 `index 2.html` 一致，頭像正確顯示，空位顯示雜訊
- **參考**: PRD §4.3, §8.2

---

### T-007：矩陣頁 — Realtime 同步 & 互動
- **優先級**: P1
- **依賴**: T-006
- **狀態**: ✅
- **描述**: 接入 Supabase Realtime，實現即時在線狀態同步與玩家互動
- **任務**:
  - [ ] 訂閱 `users.is_online` 變更，即時更新矩陣格位狀態（頭像 ↔ 雜訊）
  - [ ] 在線人數計數器即時更新
  - [ ] Hover 玩家頭像：放大顯示原始照片（取消三角形裁切），scale(2.5)
  - [ ] 點擊玩家頭像：跳轉至投票頁（`#/vote`），預選該玩家
- **驗收**: 另一裝置改變 is_online，本端矩陣即時更新；Hover/Click 互動正確
- **參考**: PRD §4.3, §5.3

---

## P2：個人頁

### T-008：個人頁 — 名片展示
- **優先級**: P2
- **依賴**: T-001, T-003, T-005
- **狀態**: ✅
- **描述**: 實作個人頁名片展示模式
- **任務**:
  - [ ] 實作 `js/pages/profile.js` — 個人頁主邏輯
  - [ ] BusinessCard 組織元件：頭像（圓形）、編號、顯示名稱、自我介紹
  - [ ] 末日賽博龐克風格名片設計
  - [ ] 預設為名片展示模式（唯讀）
- **驗收**: 進入個人頁可看到完整名片，風格符合末日主題
- **參考**: PRD §4.2 FR-PROFILE-01

---

### T-009：個人頁 — 編輯模式 & 頭像上傳
- **優先級**: P2
- **依賴**: T-008
- **狀態**: ✅
- **描述**: 實作個人資料編輯與頭像上傳功能
- **任務**:
  - [ ] 點擊「編輯」按鈕切換至編輯模式
  - [ ] ProfileEditor 組織元件：頭像上傳區 + 顯示名稱輸入 + Bio 輸入 + 儲存按鈕
  - [ ] 頭像上傳：支援 JPG/PNG/WebP，裁切為正方形，上傳至 Supabase Storage `avatars` bucket
  - [ ] 儲存後更新 `users` 表，即時回到名片展示模式
  - [ ] 矩陣頁頭像同步更新
- **驗收**: 可編輯名稱/Bio/頭像，儲存後名片即時更新，矩陣頁頭像同步
- **參考**: PRD §4.2 FR-PROFILE-02, FR-PROFILE-03

---

### T-010：個人頁 — 活動密碼登入 & 狀態顯示
- **優先級**: P2
- **依賴**: T-008
- **狀態**: ✅
- **描述**: 實作活動當天密碼登入機制與在線狀態顯示
- **任務**:
  - [ ] StatusLight 元件：綠色呼吸燈（已登入）/ 灰色（未登入）
  - [ ] 密碼輸入框：輸入活動密碼，與 `app_settings.event_password` 比對
  - [ ] 密碼正確時將 `users.is_online` 設為 `true`
  - [ ] 已登入狀態帶有綠色脈衝光閃爍效果
  - [ ] 實作 `js/components/status-light.js` Web Component
- **驗收**: 輸入正確密碼後呼吸燈變綠，矩陣牆同步顯示該玩家在線
- **參考**: PRD §4.1 FR-AUTH-02, §4.2 FR-PROFILE-04

---

### T-011：個人頁 — 我的作答紀錄
- **優先級**: P2（但可延後至 P5 完成後整合）
- **依賴**: T-008, T-017
- **狀態**: ✅
- **描述**: 顯示用戶參與過的所有題目作答紀錄
- **任務**:
  - [ ] 查詢 `answers` 表 JOIN `questions` + `zones`，取得用戶所有作答紀錄
  - [ ] 列表展示：區域名稱、題目內容、我的答案、作答時間
  - [ ] 點擊紀錄可進入修改答案
- **驗收**: 個人頁底部可看到所有作答紀錄，點擊可修改答案
- **參考**: PRD §4.2 FR-PROFILE-05

---

## P3：投票系統

### T-012：投票操作頁
- **優先級**: P3
- **依賴**: T-006, T-008
- **狀態**: ✅
- **描述**: 實作投票功能（5 票分散制）
- **任務**:
  - [x] 實作 `js/pages/vote.js` — 投票操作頁
  - [x] VotingPanel 組織元件：搜尋/輸入編號 + 候選人列表 + 剩餘票數顯示
  - [x] VoteChip 元件樣式內嵌於 `css/components.css`（頭像+名稱+投票按鈕）
  - [x] 5 票分散制邏輯：每票投不同人，不可重複
  - [x] 投票後即時扣減剩餘票數，顯示已投給誰
  - [x] 可取消已投出的票（DELETE 對應 votes 記錄，回收票數）
  - [x] 從矩陣頁點入時，預選該玩家
- **驗收**: 可投 5 票給不同人、可取消、票數正確、預選功能正常
- **參考**: PRD §4.4 FR-VOTE-01

---

### T-013：投票結果排行榜
- **優先級**: P3
- **依賴**: T-012
- **狀態**: ✅
- **描述**: 實作投票結果即時排行榜
- **任務**:
  - [x] 實作 `js/pages/vote-result.js` — 投票結果頁
  - [x] LeaderBoard 組織元件：排名列表（排名、頭像、編號、名稱、得票數）
  - [x] 依得票數由高到低排序
  - [x] 前三名特殊視覺效果（金/銀/銅光效）
  - [x] 訂閱 `votes` INSERT/DELETE Realtime，即時更新排行
- **驗收**: 排行榜正確排序，有人投票時即時更新，前三名有特效
- **參考**: PRD §4.4 FR-VOTE-02

---

## P4：題目系統

### T-014：11 區總覽頁
- **優先級**: P4
- **依賴**: T-003, T-004
- **狀態**: ✅
- **描述**: 實作 11 個區域的題目總覽
- **任務**:
  - [x] 實作 `js/pages/zones.js` — 11 區總覽頁
  - [x] ZoneOverview 組織元件：11 張卡片/格子
  - [x] 每區顯示：區域編號、名稱、當前題目預覽、狀態（有題目/無題目/已鎖定）
  - [x] 點擊任一區域進入該區的題目生成頁 `#/zones/:id`
  - [x] 訂閱 `zones.is_locked` Realtime 變更，即時同步鎖定狀態
- **驗收**: 正確顯示 11 區狀態，點擊進入對應區域
- **參考**: PRD §4.5 FR-ZONE-01

---

### T-015：題目生成頁（iPad 端）
- **優先級**: P4
- **依賴**: T-014
- **狀態**: ✅
- **描述**: 實作題目生成頁，所有用戶皆可操作
- **任務**:
  - [x] 實作 `js/pages/question-gen.js` — 題目生成頁
  - [x] QuestionGenerator 組織元件：出題方式切換（AI/手動）+ 表單 + 鎖定按鈕
  - [x] 手動出題：填寫題目文字 → 儲存至 `questions` 表
  - [x] AI 出題（預留介面）：輸入主題/關鍵字 → 呼叫 API 產生題目（v1 先做 UI，API 後續接入）
  - [x] 儲存時設定 `zones.current_question_id`
- **驗收**: 可手動輸入題目並儲存，AI 出題 UI 完成（API 待接）
- **參考**: PRD §4.5 FR-ZONE-02

---

### T-016：iPad 鎖定機制 & QR Code
- **優先級**: P4
- **依賴**: T-015
- **狀態**: ✅
- **描述**: 實作 iPad 鎖定模式與 QR Code 產生
- **任務**:
  - [x] 鎖定按鈕：點擊後 `zones.is_locked` 設為 `true`
  - [x] 鎖定後畫面固定：無法返回/切換，路由至 `#/zones/:id/locked`
  - [x] 使用 `qrcode.js` 產生 QR Code（URL: `https://{domain}/#/answer/{question_id}`）
  - [x] QR Code 全螢幕展示（整合於 question-gen.js 鎖定模式）
  - [x] 使用 Fullscreen API + `beforeunload` 事件攔截返回
  - [x] 解鎖：輸入管理員密碼後 `zones.is_locked` 設為 `false`，返回題目生成頁
- **驗收**: 鎖定後畫面固定、QR Code 正確產生、管理員可解鎖
- **參考**: PRD §4.5 FR-ZONE-03, FR-ZONE-04

---

## P5：作答系統

### T-017：掃碼作答頁
- **優先級**: P5
- **依賴**: T-005, T-016
- **狀態**: ✅
- **描述**: 實作手機掃碼進入的作答頁面
- **任務**:
  - [x] 實作 `js/pages/answer.js` — 作答頁面
  - [x] 路由解析 `#/answer/:questionId`，根據 questionId 查詢題目
  - [x] AnswerForm 組織元件：區域名稱 + 題目內容 + 作答文字框 + 提交按鈕
  - [x] 提交答案至 `answers` 表（UPSERT: 每人每題一筆）
  - [x] 若已有答案，顯示原答案並允許修改
  - [x] 更新 `answers.updated_at` 時間戳
- **驗收**: 掃碼後正確顯示題目，可提交/修改答案
- **參考**: PRD §4.6

---

### T-018：作答紀錄整合至個人頁
- **優先級**: P5
- **依賴**: T-011, T-017
- **狀態**: ✅
- **描述**: 完成個人頁作答紀錄與作答頁的整合
- **任務**:
  - [x] 個人頁作答紀錄列表點擊後導航至 `#/answer/:questionId`
  - [x] 作答頁提交後，個人頁紀錄列表即時更新
  - [x] 處理邊界情況：題目已刪除、區域已鎖定等
- **驗收**: 個人頁紀錄可導航至作答頁修改答案，資料即時同步
- **參考**: PRD §4.2 FR-PROFILE-05, §4.6 FR-ANSWER-02

---

## P6：AI 出題 & 管理面板

### T-019：管理員面板
- **優先級**: P6
- **依賴**: T-005, T-010
- **狀態**: ✅
- **描述**: 實作管理員專用功能
- **任務**:
  - [x] AdminPanel 組織元件：全體離線按鈕 + 密碼設定表單
  - [x] 「全體離線」按鈕：UPDATE `users` SET `is_online = false` WHERE `is_online = true`
  - [x] 矩陣牆所有人立即變為雜訊狀態（依賴 Realtime）
  - [x] 設定/修改活動密碼：UPDATE `app_settings` WHERE `key = 'event_password'`
  - [x] iPad 解鎖功能（輸入管理員密碼）
  - [x] 僅 `role = 'admin'` 的用戶可見此面板（個人頁底部顯示）
- **驗收**: 管理員可全體離線、設定密碼、解鎖 iPad
- **參考**: PRD §4.7

---

### T-020：AI 出題功能（Supabase Edge Function）
- **優先級**: P6
- **依賴**: T-015
- **狀態**: ✅
- **描述**: 接入 LLM API 實現 AI 自動出題
- **任務**:
  - [x] 建立 Supabase Edge Function，接收主題/關鍵字，呼叫 LLM API 回傳題目
  - [x] 前端 QuestionGenerator AI 模式：輸入關鍵字 → 呼叫 Edge Function → 預覽生成題目 → 確認儲存
  - [x] 錯誤處理：API 失敗時顯示提示，引導使用手動出題
  - [x] `questions.source_type` 設為 `'ai'`
- **驗收**: 輸入關鍵字可自動生成題目，API 失敗時 fallback 至手動模式
- **參考**: PRD §4.5 FR-ZONE-02, §12 風險緩解

---

## 非功能需求 Ticket

### T-021：行動端 & iPad 適配
- **優先級**: 貫穿全程
- **狀態**: ✅
- **描述**: 確保所有頁面在手機和 iPad 上體驗良好
- **任務**:
  - [x] 手機端：底部 Tab 導覽不遮擋內容，滾動流暢
  - [x] iPad 端：題目生成頁橫屏/直屏皆正常
  - [x] iPadLayout 模板：鎖定模式全螢幕無導覽
  - [x] MobileLayout 模板：頂部狀態列 + 內容區 + 底部 Tab
  - [ ] iPhone / Android 主流機型測試
- **驗收**: 主流裝置流暢操作，無排版破碎
- **參考**: PRD §11.2 NF-02, NF-03

---

### T-022：效能與部署
- **優先級**: 貫穿全程
- **狀態**: ✅
- **描述**: 確保載入效能與部署流程
- **任務**:
  - [x] 首次載入 < 3 秒（WiFi 環境）
  - [x] 靜態資源透過 Service Worker 快取
  - [x] 設定 GitHub Pages 部署（手動或 GitHub Actions）
  - [x] 確認部署後所有路由、資源可正常存取
- **驗收**: Lighthouse Performance ≥ 90，GitHub Pages 公開可存取
- **參考**: PRD §11.2 NF-04, NF-06

---

## Ticket 依賴關係總覽

```
T-001 (Design System) ──┐
T-002 (PWA)             ├── T-006 (矩陣網格) ── T-007 (Realtime)
T-003 (Router)  ────────┤                              │
T-004 (Supabase) ───────┤                              │
T-005 (Auth)  ──────────┤                              ▼
                        ├── T-008 (名片展示) ── T-009 (編輯/頭像)
                        │        │                     │
                        │        ├── T-010 (活動密碼)  │
                        │        └── T-011 (作答紀錄)◄─┼─── T-017 ── T-018
                        │                              │
                        ├── T-012 (投票) ◄── T-006     │
                        │     └── T-013 (排行榜)       │
                        │                              │
                        ├── T-014 (11區總覽) ── T-015 (題目生成) ── T-016 (鎖定/QR)
                        │                                                │
                        │                                                ▼
                        │                                          T-017 (掃碼作答)
                        │
                        └── T-019 (管理面板)
                            T-020 (AI出題) ◄── T-015
```

---

## 開發建議順序

1. **T-001** → **T-002** → **T-003** → **T-004** → **T-005**（P0 基礎建設，依序完成）
2. **T-006** → **T-007**（P1 矩陣牆）
3. **T-008** → **T-009** → **T-010**（P2 個人頁）
4. **T-012** → **T-013**（P3 投票）
5. **T-014** → **T-015** → **T-016**（P4 題目系統）
6. **T-017** → **T-018**（P5 作答）
7. **T-019** → **T-020**（P6 管理 & AI）
8. **T-011** 可在 T-017 完成後再整合
9. **T-021**、**T-022** 貫穿整個開發過程持續驗證
