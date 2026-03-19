# AI末日議會 WebApp — 產品需求文件（PRD）

> **版本**: v1.0
> **日期**: 2026-03-09
> **活動日期**: 2026-03-28（六）19:00–24:00
> **狀態**: Draft

---

## 1. 產品概述

### 1.1 產品名稱
**AI末日議會**（Doomsday Parliament）

### 1.2 產品定位
一款為 3/28 實體活動設計的 HTML5 WebApp，結合「末日賽博龐克」視覺風格，提供活動參與者即時互動體驗——包含個人名片展示、矩陣式登入牆、即時投票、以及 11 區互動答題系統。

### 1.3 核心目標
| 目標 | 描述 |
|------|------|
| 沉浸感 | 延續 CRT 掃描線、Glitch 故障、血紅色調的末日美學 |
| 零門檻參與 | Email 快速註冊，活動當天密碼登入，手機即開即用 |
| 即時互動 | Realtime 同步登入狀態、投票排行、答題紀錄 |
| 多裝置協作 | 手機作答 + iPad 出題，QR Code 串接兩端 |

### 1.4 目標用戶
| 角色 | 描述 | 裝置 |
|------|------|------|
| 參與者 | 活動現場的 100 名玩家 | 手機（主要） |
| 出題者 | 操作 11 個區域的 iPad 出題端 | iPad |
| 管理員 | 活動主辦方工作人員 | 手機/電腦 |

---

## 2. 設計原則

### 2.1 希克定律（Hick's Law）
- 底部導覽列固定 **3 個入口**，減少決策時間
- 子功能透過上下文觸發（點擊、掃碼）進入，不增加導覽項
- 每個操作頁面聚焦單一任務

### 2.2 介面語言原則
- **所有使用者可見的文字一律使用中文（繁體）**，包含：
  - 頁面標題、導覽列標籤、按鈕文字
  - 表單欄位標籤（如「電子信箱」「密碼」「顯示名稱」「自我介紹」）
  - 狀態標籤（如「已鎖定」「進行中」「載入中...」）
  - 錯誤訊息、提示文字、空狀態文字
- 僅允許英文出現在以下場景：
  - 系統底部裝飾性狀態文字（如 `SYS.v1.0 // MATRIX_PROTOCOL_READY`）
  - 技術性內容（URL、程式碼、CSS class 名稱）
  - 品牌名稱「AI末日議會」可搭配英文副標

### 2.3 PWA 標準
- `manifest.json` 提供安裝能力
- Service Worker 快取靜態資源
- 支援 Add to Home Screen
- 離線時顯示友善提示（核心功能需網路）

### 2.4 原子設計（Atomic Design）
所有 UI 元件依循 Atoms → Molecules → Organisms → Templates → Pages 五層架構，詳見第 7 節。

---

## 3. 資訊架構

### 3.1 導覽結構

```
底部導覽列（固定 3 Tab）
├── Tab 1: 個人（Profile）
├── Tab 2: 矩陣（Matrix）
└── Tab 3: 題目（Zones）
```

### 3.2 完整頁面地圖

```
[歡迎頁 / 登入頁]
  │  Email + 密碼 註冊/登入
  ▼
┌─────────── 主應用程式 ───────────┐
│                                   │
│  Tab 1: 個人頁                    │
│  ├─ 名片展示模式（預設）          │
│  ├─ 編輯模式（點擊編輯按鈕）     │
│  ├─ 登入狀態區塊                  │
│  │   └─ 活動密碼輸入 → 已登入     │
│  └─ 我的作答紀錄列表              │
│                                   │
│  Tab 2: 矩陣頁（登入牆）         │
│  ├─ 16×7 矩陣網格（同 index 2）  │
│  ├─ 點擊人物 → 投票頁             │
│  ├─ 投票頁                        │
│  │   └─ 輸入編號 or 點選 → 投票   │
│  └─ 投票結果頁（排行榜）          │
│                                   │
│  Tab 3: 題目頁                    │
│  ├─ 11 區總覽                     │
│  ├─ 題目生成頁（iPad 專用）       │
│  │   ├─ AI 自動生題               │
│  │   ├─ 手動輸入題目              │
│  │   └─ 鎖定模式 + QR Code       │
│  └─ 題目作答頁（手機掃碼進入）    │
│      └─ 顯示題目 + 作答表單       │
└───────────────────────────────────┘
```

---

## 4. 功能需求

### 4.1 認證系統

#### FR-AUTH-01：Email 註冊/登入
- 使用 Supabase Auth Email + Password 機制
- 註冊時自動分配 `player_number`（1–100，依序遞增）
- 註冊成功後進入主應用程式

#### FR-AUTH-02：活動當天密碼登入機制
- 管理員可在後台設定「活動密碼」
- 管理員可按下「全體離線」按鈕，將所有用戶的 `is_online` 設為 `false`
- 用戶在個人頁輸入正確活動密碼後，`is_online` 變為 `true`
- 已登入狀態顯示綠色呼吸燈閃爍動畫

---

### 4.2 個人頁（Tab 1: Profile）

#### FR-PROFILE-01：名片展示模式
- 預設顯示為名片樣式（唯讀）
- 展示內容：頭像、編號、顯示名稱、自我介紹
- 風格符合末日賽博龐克主題

#### FR-PROFILE-02：編輯模式
- 點擊「編輯」按鈕進入編輯模式
- 可編輯欄位：
  - 頭像（上傳照片，存至 Supabase Storage）
  - 顯示名稱
  - 自我介紹（Bio）
- 儲存後即時更新名片展示

#### FR-PROFILE-03：頭像上傳
- 支援 JPG / PNG / WebP 格式
- 上傳後裁切為正方形
- 儲存至 Supabase Storage，URL 寫入 `users.avatar_url`
- 矩陣頁的頭像同步更新

#### FR-PROFILE-04：登入狀態顯示
- 顯示當前狀態：「已登入」（綠色呼吸燈）或「未登入」（灰色）
- 包含密碼輸入框，輸入正確活動密碼後切換為已登入
- 已登入狀態帶有綠色脈衝光閃爍效果

#### FR-PROFILE-05：我的作答紀錄
- 列表展示用戶參與過的所有題目
- 每筆紀錄顯示：區域名稱、題目內容、我的答案、作答時間
- 點擊可進入修改答案

---

### 4.3 矩陣頁（Tab 2: Matrix — 登入牆）

#### FR-MATRIX-01：矩陣登入牆
- 視覺風格與 `index 2.html` 幾乎一致
- 16×7 網格，最多顯示 100 位玩家
- 三角形 clip-path 頭像格
- 已登入玩家顯示頭像 + 編號
- 未登入 / 空位顯示死寂雜訊
- 透過 Supabase Realtime 即時同步在線狀態
- 保留 CRT 掃描線、Glitch 閃爍、故障動畫

#### FR-MATRIX-02：玩家互動
- 點擊任一玩家頭像：
  - Hover 時放大顯示原始照片（取消三角形裁切）
  - 點擊後跳轉至投票頁，預選該玩家
- 可查看該玩家的名片資訊

#### FR-MATRIX-03：即時在線人數
- 畫面上方顯示當前在線人數計數器
- 格式：`ONLINE: 42/100`
- Realtime 更新

---

### 4.4 投票系統

#### FR-VOTE-01：投票操作
- 從矩陣頁點擊人物，或在投票頁輸入玩家編號
- 每位用戶共有 **5 票**
- 每票只能投給不同的人（5 票分散制，不可重複投同一人）
- 投票後即時扣減剩餘票數
- 顯示已投給哪些人的列表
- 可取消已投出的票（收回票數）

#### FR-VOTE-02：投票結果頁
- 依照被投票數由高到低排序
- 顯示內容：排名、頭像、編號、顯示名稱、得票數
- Realtime 更新排名變動
- 前三名有特殊視覺效果（金/銀/銅光效）

---

### 4.5 題目系統（Tab 3: Zones）

#### FR-ZONE-01：11 區總覽
- 以卡片或格子形式展示 11 個區域
- 每區顯示：區域編號、區域名稱、當前題目預覽、狀態（有題目/無題目/已鎖定）
- 點擊任一區域進入該區的題目生成頁

#### FR-ZONE-02：題目生成頁（iPad 版）
- **所有用戶皆可操作**
- 兩種出題方式：
  - **AI 自動生題**：輸入主題/關鍵字，AI 產生題目
  - **手動輸入**：直接填寫題目文字
- 產生的題目儲存至 Supabase

#### FR-ZONE-03：iPad 鎖定機制
- 出題完成後，點擊「🔒 鎖定」按鈕
- 鎖定後的行為：
  - 畫面固定在該題目頁，無法返回或切換
  - 自動產生 QR Code（內含題目 ID + 作答頁 URL）
  - QR Code 全螢幕展示，供手機掃描
- 解鎖方式：輸入管理員密碼

#### FR-ZONE-04：QR Code 產生
- QR Code 內容格式：`https://{domain}/#/answer/{question_id}`
- 使用 `qrcode.js` 前端產生
- 顯示在 iPad 鎖定畫面的中央位置

---

### 4.6 作答系統

#### FR-ANSWER-01：掃碼作答
- 手機掃描 iPad 上的 QR Code
- 開啟作答頁面，顯示：
  - 區域名稱
  - 題目內容
  - 作答文字框
- 提交答案後儲存至 Supabase

#### FR-ANSWER-02：答案管理
- 每人每題只能有一筆答案
- 可在作答頁或個人頁修改已提交的答案
- 修改時更新 `answers.updated_at` 時間戳

---

### 4.7 管理員功能

#### FR-ADMIN-01：全體離線按鈕
- 管理員在個人頁可見「全體離線」按鈕
- 點擊後所有用戶的 `is_online` 設為 `false`
- 矩陣牆上所有人立即變為雜訊狀態

#### FR-ADMIN-02：設定活動密碼
- 管理員可設定/修改活動密碼
- 儲存至 `app_settings` 表

#### FR-ADMIN-03：iPad 解鎖
- 管理員可輸入密碼解鎖被鎖定的 iPad 區域

---

## 5. 資料庫設計（Supabase PostgreSQL）

### 5.1 ER 圖

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  users   │──1:N──│  votes   │       │app_settings│
│          │       │(voter)   │       │          │
│          │──1:N──│(target)  │       └──────────┘
│          │       └──────────┘
│          │
│          │──1:N──┌──────────┐──N:1──┌──────────┐
│          │       │ answers  │       │questions │
│          │       └──────────┘       │          │
│          │                          │          │
│          │──1:N─────────────────────│(created) │
│          │                          │          │
└──────────┘                          │          │
                                      │          │──N:1──┌──────────┐
                                      └──────────┘       │  zones   │
                                                         └──────────┘
```

### 5.2 資料表定義

#### `users`
| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid, PK | Supabase Auth UID |
| `player_number` | int, UNIQUE | 玩家編號 1–100，自動分配 |
| `email` | text, UNIQUE | 登入信箱 |
| `display_name` | text | 顯示名稱 |
| `bio` | text, NULL | 自我介紹 |
| `avatar_url` | text, NULL | 頭像圖片 URL（Supabase Storage） |
| `is_online` | bool, DEFAULT false | 活動當天登入狀態 |
| `role` | text, DEFAULT 'user' | 角色：`user` / `admin` |
| `created_at` | timestamptz | 建立時間 |

#### `app_settings`
| 欄位 | 類型 | 說明 |
|------|------|------|
| `key` | text, PK | 設定鍵名 |
| `value` | text | 設定值 |

預設資料：
- `event_password` → 活動密碼（管理員設定）
- `force_offline` → `'true'` / `'false'`

#### `votes`
| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid, PK | 主鍵 |
| `voter_id` | uuid, FK → users | 投票者 |
| `target_id` | uuid, FK → users | 被投票者 |
| `created_at` | timestamptz | 投票時間 |

約束：
- `UNIQUE(voter_id, target_id)` — 不可重複投同一人
- RLS Policy：每個 `voter_id` 最多 5 筆記錄

#### `zones`
| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | int, PK | 區域編號 1–11 |
| `zone_name` | text | 區域名稱 |
| `current_question_id` | uuid, FK → questions, NULL | 當前顯示的題目 |
| `is_locked` | bool, DEFAULT false | iPad 是否鎖定 |

#### `questions`
| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid, PK | 主鍵 |
| `zone_id` | int, FK → zones | 所屬區域 |
| `content` | text | 題目內容 |
| `source_type` | text | `'ai'` / `'manual'` |
| `qr_code_url` | text, NULL | QR Code 對應 URL |
| `created_by` | uuid, FK → users | 出題者 |
| `created_at` | timestamptz | 建立時間 |

#### `answers`
| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid, PK | 主鍵 |
| `question_id` | uuid, FK → questions | 對應題目 |
| `user_id` | uuid, FK → users | 作答者 |
| `content` | text | 答案內容 |
| `created_at` | timestamptz | 建立時間 |
| `updated_at` | timestamptz | 最後修改時間 |

約束：
- `UNIQUE(question_id, user_id)` — 每人每題一筆答案

### 5.3 Supabase Realtime 訂閱

| 訂閱目標 | 用途 |
|----------|------|
| `users.is_online` 變更 | 矩陣牆即時更新在線狀態 |
| `votes` INSERT/DELETE | 投票結果頁即時更新排行 |
| `zones.is_locked` 變更 | 11 區總覽鎖定狀態同步 |

### 5.4 Supabase Storage

| Bucket | 用途 | 存取權限 |
|--------|------|---------|
| `avatars` | 用戶頭像 | 公開讀取、登入者寫入（限自己） |

### 5.5 Row Level Security (RLS) 重點規則

| 表 | 規則 |
|----|------|
| `users` | 自己可讀寫自己的資料；所有登入者可讀其他人公開欄位 |
| `votes` | 自己可 INSERT/DELETE 自己的票；所有人可讀（排行用） |
| `questions` | 所有登入者可 INSERT；只有創建者或 admin 可 UPDATE/DELETE |
| `answers` | 自己可讀寫自己的答案；admin 可讀所有答案 |
| `app_settings` | admin 可讀寫；一般用戶可讀（驗證密碼用） |
| `zones` | 所有登入者可讀；鎖定/解鎖需 admin 或特定邏輯 |

---

## 6. 技術架構

### 6.1 技術棧

| 層面 | 選擇 | 說明 |
|------|------|------|
| 前端框架 | Vanilla JS + Web Components | 單頁應用，無需建構工具，沿用 index 2 風格 |
| CSS | Tailwind CSS (CDN) + CSS Custom Properties | Design Token 透過 CSS Variables 管理 |
| PWA | manifest.json + Service Worker | 可安裝、靜態資源快取 |
| 後端 | Supabase (PostgreSQL + Auth + Storage + Realtime) | 全託管 BaaS |
| QR Code | qrcode.js (CDN) | 前端生成 QR Code |
| AI 出題 | Supabase Edge Functions + LLM API | 後續階段實作 |
| 部署 | GitHub Pages | 免費靜態站託管 |
| 字體 | Google Fonts: Anton + Oswald | 與 index 2.html 一致 |

### 6.2 SPA 路由

使用 Hash Router（`#/path`），適合 GitHub Pages 無伺服器環境。

| 路由 | 頁面 |
|------|------|
| `#/` | 歡迎/登入頁 |
| `#/profile` | 個人頁（Tab 1） |
| `#/profile/edit` | 個人頁編輯模式 |
| `#/matrix` | 矩陣登入牆（Tab 2） |
| `#/vote` | 投票頁 |
| `#/vote/result` | 投票結果頁 |
| `#/zones` | 11 區題目總覽（Tab 3） |
| `#/zones/:id` | 單區題目生成頁（iPad） |
| `#/zones/:id/locked` | iPad 鎖定 + QR Code 展示 |
| `#/answer/:questionId` | 題目作答頁（手機掃碼進入） |

---

## 7. Design System

### 7.1 Design Tokens

```css
:root {
  /* ── 色彩系統 ── */
  --color-blood-red:      #ff003c;
  --color-dark-red:       #1a0005;
  --color-cyber-cyan:     #00f3ff;
  --color-cyber-magenta:  #ff00e6;
  --color-bg-primary:     #020002;
  --color-bg-surface:     rgba(20, 0, 0, 0.4);
  --color-bg-elevated:    rgba(40, 0, 5, 0.6);
  --color-text-primary:   #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.7);
  --color-text-muted:     rgba(255, 255, 255, 0.4);
  --color-online-green:   #00ff66;
  --color-border-default: rgba(255, 0, 60, 0.2);
  --color-border-active:  rgba(255, 0, 60, 0.8);

  /* ── 字體系統 ── */
  --font-display:  'Anton', sans-serif;
  --font-ui:       'Oswald', sans-serif;
  --font-mono:     'Courier New', monospace;

  /* ── 字級 ── */
  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.5rem;     /* 24px */
  --text-3xl:  2rem;       /* 32px */
  --text-4xl:  2.5rem;     /* 40px */

  /* ── 間距（8px grid） ── */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;
  --space-2xl: 48px;

  /* ── 圓角 ── */
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   8px;
  --radius-full: 9999px;

  /* ── 陰影 ── */
  --shadow-glow-red:   0 0 20px rgba(255, 0, 60, 0.3);
  --shadow-glow-cyan:  0 0 20px rgba(0, 243, 255, 0.3);
  --shadow-glow-green: 0 0 20px rgba(0, 255, 102, 0.3);

  /* ── 動畫 ── */
  --duration-fast:   150ms;
  --duration-normal: 300ms;
  --duration-slow:   600ms;
  --easing-default:  cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 7.2 原子設計層級

#### Atoms（原子）
| 元件 | 說明 |
|------|------|
| `Button` | 主要（血紅底）/ 次要（透明邊框）/ 幽靈（純文字）；hover 帶 glitch 效果 |
| `Input` | 文字輸入框，暗底、血紅 focus 邊框、monospace 字體 |
| `Textarea` | 多行輸入框，同 Input 風格 |
| `Avatar` | 三角形 clip-path 頭像（矩陣用）/ 圓形頭像（個人頁用） |
| `Badge` | 狀態標籤：在線（綠）/ 離線（灰）/ 已投票（青）/ 已鎖定（紅） |
| `Icon` | SVG icon set（Lucide Icons CDN） |
| `Spinner` | 載入中動畫，帶 glitch 效果 |

#### Molecules（分子）
| 元件 | 組成 |
|------|------|
| `PlayerCard` | Avatar + 編號 + 狀態 Badge |
| `VoteChip` | Avatar（小） + 名稱 + 投票按鈕 |
| `QuestionCard` | 區域編號 + 題目預覽 + 狀態 Badge |
| `FormField` | Label + Input/Textarea + 錯誤訊息 |
| `QRDisplay` | QR Code 圖片 + 區域標題 + 提示文字 |
| `StatusLight` | 綠色/灰色呼吸燈 + 狀態文字 |
| `RankItem` | 排名數字 + Avatar + 名稱 + 得票數 |

#### Organisms（組織）
| 元件 | 說明 |
|------|------|
| `MatrixGrid` | 16×7 矩陣網格，含 CRT 覆蓋層、Glitch 動畫 |
| `ProfileEditor` | 頭像上傳區 + 表單欄位群組 + 儲存按鈕 |
| `BusinessCard` | 名片展示卡：頭像、名稱、編號、Bio |
| `VotingPanel` | 搜尋/輸入編號 + 候選人列表 + 剩餘票數 |
| `LeaderBoard` | 排行榜列表（RankItem × N） |
| `ZoneOverview` | 11 區卡片網格 |
| `QuestionGenerator` | 出題方式切換（AI/手動）+ 表單 + 鎖定按鈕 |
| `AnswerForm` | 題目展示 + 文字輸入 + 提交按鈕 |
| `AdminPanel` | 全體離線按鈕 + 密碼設定 |

#### Templates（模板）
| 模板 | 說明 |
|------|------|
| `MobileLayout` | 頂部狀態列 + 內容區 + 底部 Tab 導覽 |
| `iPadLayout` | 全螢幕無導覽（鎖定模式用）/ 正常模式同 Mobile |
| `AuthLayout` | 登入/註冊頁專用，居中表單 + 背景動畫 |

---

## 8. 視覺風格規範

### 8.1 色彩應用

| 場景 | 色彩 |
|------|------|
| 背景 | `#020002`，疊加紅色半透明網格線 |
| 主要強調 | `#ff003c`（血紅）— 按鈕、邊框、標題 |
| 資訊/互動 | `#00f3ff`（賽博青）— 連結、輔助標題、hover |
| 警告/特效 | `#ff00e6`（品紅）— Glitch 效果用 |
| 成功/在線 | `#00ff66`（綠）— 登入狀態 |
| 表面 | `rgba(20, 0, 0, 0.4)` — 卡片、輸入框背景 |

### 8.2 特效清單（沿用 index 2.html）

| 效果 | 說明 | 使用場景 |
|------|------|---------|
| CRT 掃描線 | 半透明水平條紋覆蓋 | 矩陣頁全域 |
| Glitch 文字 | `::before` / `::after` 偏移 + clip-path 動畫 | 標題 |
| 死寂雜訊 | `repeating-radial-gradient` 靜態雜訊 | 空格、離線狀態 |
| 呼吸燈 | opacity 脈衝 + border-color 變化 | 待機格、在線狀態 |
| RGB 分裂 | drop-shadow cyan + magenta 偏移 | 隨機閃爍 |
| 三角形裁切 | `clip-path: polygon(50% 0%, 0% 100%, 100% 100%)` | 矩陣頭像格 |
| Hover 還原 | 取消 clip-path + scale(2.5) | 矩陣頭像互動 |

---

## 9. 檔案結構

```
/
├── index.html                  ← 主入口（SPA 殼層）
├── manifest.json               ← PWA 配置
├── sw.js                       ← Service Worker
├── PRD.md                      ← 本文件
│
├── css/
│   ├── tokens.css              ← Design Tokens（CSS Variables）
│   ├── atoms.css               ← 原子元件樣式
│   ├── effects.css             ← Glitch / CRT / 雜訊等特效
│   └── components.css          ← 分子 & 組織元件樣式
│
├── js/
│   ├── app.js                  ← 應用程式進入點、初始化
│   ├── router.js               ← Hash Router
│   ├── supabase.js             ← Supabase 客戶端初始化 & API 封裝
│   ├── auth.js                 ← 認證邏輯
│   │
│   ├── pages/
│   │   ├── login.js            ← 登入/註冊頁
│   │   ├── profile.js          ← 個人頁（名片 + 編輯 + 作答紀錄）
│   │   ├── matrix.js           ← 矩陣登入牆
│   │   ├── vote.js             ← 投票操作頁
│   │   ├── vote-result.js      ← 投票結果排行
│   │   ├── zones.js            ← 11 區題目總覽
│   │   ├── question-gen.js     ← 題目生成頁（iPad）
│   │   └── answer.js           ← 題目作答頁（手機掃碼）
│   │
│   └── components/
│       ├── matrix-grid.js      ← 矩陣網格 Web Component
│       ├── player-card.js      ← 玩家卡片
│       ├── vote-chip.js        ← 投票選擇元件
│       ├── nav-bar.js          ← 底部導覽列
│       ├── status-light.js     ← 在線狀態燈
│       └── qr-display.js       ← QR Code 展示元件
│
├── assets/
│   ├── icons/                  ← PWA 圖示（192×192, 512×512）
│   └── avatars/                ← 預設頭像（000–100）
│
└── .github/
    └── workflows/
        └── deploy.yml          ← GitHub Pages 自動部署（optional）
```

---

## 10. 開發階段與優先順序

| 階段 | 內容 | 交付物 | 依賴 |
|------|------|--------|------|
| **P0** | 基礎建設 | Design System（tokens.css, atoms.css, effects.css）、PWA 骨架（index.html, manifest.json, sw.js）、Supabase 專案初始化、Router、Auth（Email 登入/註冊） | 無 |
| **P1** | 矩陣登入牆 | matrix.js、matrix-grid.js、Realtime 在線同步、CRT/Glitch 特效完整移植 | P0 |
| **P2** | 個人頁 | profile.js、ProfileEditor、BusinessCard、頭像上傳（Storage）、活動密碼登入機制、StatusLight | P0 |
| **P3** | 投票系統 | vote.js、vote-result.js、VotingPanel、LeaderBoard、5 票分散邏輯、Realtime 排行 | P1, P2 |
| **P4** | 題目系統 | zones.js、question-gen.js、ZoneOverview、QuestionGenerator、QR Code 產生、iPad 鎖定/解鎖 | P0 |
| **P5** | 作答系統 | answer.js、AnswerForm、掃碼路由解析、答案 CRUD、個人頁作答紀錄整合 | P2, P4 |
| **P6** | AI 出題 & 管理面板 | Supabase Edge Function、AdminPanel、全體離線、密碼設定 | P4 |

---

## 11. 驗收標準

### 11.1 功能驗收

| 編號 | 驗收項目 | 通過條件 |
|------|---------|---------|
| AC-01 | Email 註冊/登入 | 新用戶可註冊、自動分配編號、登入後進入主頁 |
| AC-02 | 個人頁編輯 | 可修改名稱、Bio、上傳頭像，儲存後名片即時更新 |
| AC-03 | 活動密碼登入 | 輸入正確密碼後顯示綠色呼吸燈，矩陣牆同步顯示 |
| AC-04 | 矩陣登入牆 | 16×7 網格正確顯示，在線/離線狀態 Realtime 同步 |
| AC-05 | 投票功能 | 可投 5 票給不同人、可取消、票數正確計算 |
| AC-06 | 投票排行 | 依得票數排序、Realtime 更新、前三名有特效 |
| AC-07 | 11 區總覽 | 正確顯示 11 區狀態（有題/無題/鎖定） |
| AC-08 | 題目生成 | AI 和手動皆可產生題目並儲存至 DB |
| AC-09 | iPad 鎖定 | 鎖定後畫面固定、QR Code 正確產生、管理員可解鎖 |
| AC-10 | 掃碼作答 | 掃碼後正確顯示題目、可提交答案、可修改答案 |
| AC-11 | 管理員操作 | 全體離線、設定密碼功能正常 |

### 11.2 非功能驗收

| 編號 | 驗收項目 | 通過條件 |
|------|---------|---------|
| NF-01 | PWA | Lighthouse PWA 分數 ≥ 90 |
| NF-02 | 行動端體驗 | iPhone / Android 主流機型流暢操作 |
| NF-03 | iPad 適配 | 題目生成頁在 iPad 橫屏/直屏皆正常 |
| NF-04 | 載入效能 | 首次載入 < 3 秒（WiFi 環境） |
| NF-05 | 視覺一致性 | 所有頁面風格與 index 2.html 一致 |
| NF-06 | 部署 | 成功部署至 GitHub Pages 並可公開存取 |

---

## 12. 風險與注意事項

| 風險 | 影響 | 緩解措施 |
|------|------|---------|
| 活動當天網路不穩 | 即時功能失效 | Service Worker 快取靜態資源；顯示離線友善提示 |
| 100 人同時操作 | Supabase 免費方案限制 | 監控連線數；必要時升級方案 |
| iPad 被意外返回 | 鎖定模式被繞過 | 使用 Fullscreen API + beforeunload 事件攔截 |
| QR Code 掃描失敗 | 用戶無法作答 | 提供手動輸入題目 ID 的備用方式 |
| AI 出題 API 失敗 | 無法自動生題 | 手動出題作為 fallback，AI 出題為增值功能 |

---

## 13. 未來擴展（Out of Scope for v1）

- 社群分享功能（分享個人名片到社群平台）
- 答案的即時排行/互評
- 多場次活動支援
- 觀眾模式（非參與者純觀看）
- 音效系統

---

> **文件結束**
> 本 PRD 為 v1.0 開發依據，實作過程中如有需求變更請更新本文件。
