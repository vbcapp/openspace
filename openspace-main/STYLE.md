# AI末日議會 — Style Guide & Design System

> **版本**: v1.0
> **日期**: 2026-03-09
> **風格代號**: DOOMSDAY CYBERPUNK
> **參考來源**: `index 2.html`（矩陣登入流原型）

---

## 目錄

1. [設計哲學](#1-設計哲學)
2. [Design Tokens](#2-design-tokens)
3. [色彩系統](#3-色彩系統)
4. [字體系統](#4-字體系統)
5. [間距與網格](#5-間距與網格)
6. [圖像處理](#6-圖像處理)
7. [特效系統](#7-特效系統)
8. [元件庫 — Atomic Design](#8-元件庫--atomic-design)
9. [佈局模板](#9-佈局模板)
10. [動態與互動](#10-動態與互動)
11. [響應式策略](#11-響應式策略)
12. [無障礙考量](#12-無障礙考量)
13. [CSS 檔案架構](#13-css-檔案架構)

---

## 1. 設計哲學

### 1.1 視覺敘事

本 WebApp 的設計語言來自三個核心意象：

| 意象 | 視覺表現 | 情緒 |
|------|---------|------|
| **末日廢墟** | 暗黑底色、血紅邊框、灰階濾鏡 | 緊張、壓迫 |
| **CRT 監控** | 掃描線覆蓋、雜訊噪點、故障閃爍 | 復古科技、監視感 |
| **賽博矩陣** | 網格系統、三角形裁切、數據流動畫 | 數位化、系統感 |

### 1.2 設計原則

```
┌─────────────────────────────────────────────┐
│  1. 黑暗優先 — 純黑為底，色彩僅作點綴與強調   │
│  2. 克制用色 — 僅 4 色系統（紅/青/品紅/綠）   │
│  3. 動靜結合 — 靜態壓迫感 + 微動態呼吸感       │
│  4. 形態破壞 — 三角形裁切、glitch 撕裂、雜訊    │
│  5. 資訊層級 — 明確的視覺權重，符合希克定律     │
│  6. 中文優先 — 所有 UI 文字使用繁體中文         │
└─────────────────────────────────────────────┘
```

### 1.3 介面語言規範

**所有使用者可見的 UI 文字必須使用繁體中文**，確保活動參與者無語言障礙。

| 元素類型 | 語言 | 範例 |
|---------|------|------|
| 導覽列標籤 | 中文 | 「個人」「矩陣」「題區」 |
| 頁面標題 | 中文 | 「個人資料」「投票」「排行榜」「作答」 |
| 按鈕文字 | 中文 | 「登入」「儲存變更」「提交答案」 |
| 表單標籤 | 中文 | 「電子信箱」「密碼」「顯示名稱」「自我介紹」 |
| 狀態標籤 | 中文 | 「已鎖定」「進行中」「空白」「已投」 |
| 載入/錯誤 | 中文 | 「載入中...」「載入失敗」「找不到題目」 |
| 裝飾性系統文字 | 英文（允許） | `SYS.v1.0 // MATRIX_PROTOCOL_READY` |
| CSS class / 技術代碼 | 英文（允許） | `.btn--primary`, `data-route="profile"` |

---

## 2. Design Tokens

所有設計變數統一透過 CSS Custom Properties 管理，作為唯一真實來源（Single Source of Truth）。

### 2.1 完整 Token 定義

```css
/* ================================================================
   tokens.css — AI末日議會 Design Tokens
   ================================================================ */

:root {

  /* ── 色彩：品牌核心 ── */
  --color-blood-red:       #ff003c;
  --color-dark-red:        #1a0005;
  --color-cyber-cyan:      #00f3ff;
  --color-cyber-magenta:   #ff00e6;
  --color-online-green:    #00ff66;

  /* ── 色彩：背景層級 ── */
  --color-bg-void:         #020002;                      /* 最深底色 */
  --color-bg-primary:      #000000;                      /* 主背景 */
  --color-bg-surface:      rgba(20, 0, 0, 0.4);          /* 卡片/元件表面 */
  --color-bg-elevated:     rgba(40, 0, 5, 0.6);          /* 浮層/對話框 */
  --color-bg-overlay:      rgba(0, 0, 0, 0.85);          /* 遮罩 */
  --color-bg-input:        rgba(10, 0, 0, 0.6);          /* 輸入框背景 */
  --color-bg-vignette:     radial-gradient(circle at center, rgba(30,0,0,0.8) 0%, rgba(0,0,0,1) 80%);

  /* ── 色彩：文字 ── */
  --color-text-primary:    #ffffff;
  --color-text-secondary:  rgba(255, 255, 255, 0.7);
  --color-text-muted:      rgba(255, 255, 255, 0.4);
  --color-text-disabled:   rgba(255, 255, 255, 0.2);
  --color-text-accent:     var(--color-cyber-cyan);
  --color-text-danger:     var(--color-blood-red);

  /* ── 色彩：邊框 ── */
  --color-border-subtle:   rgba(255, 0, 60, 0.1);
  --color-border-default:  rgba(255, 0, 60, 0.2);
  --color-border-strong:   rgba(255, 0, 60, 0.5);
  --color-border-active:   rgba(255, 0, 60, 0.8);
  --color-border-focus:    var(--color-blood-red);
  --color-border-muted:    #333333;

  /* ── 色彩：語意 ── */
  --color-success:         var(--color-online-green);
  --color-warning:         #ff9500;
  --color-error:           var(--color-blood-red);
  --color-info:            var(--color-cyber-cyan);

  /* ── 字體家族 ── */
  --font-display:          'Anton', sans-serif;           /* 標題、大字 */
  --font-ui:               'Oswald', sans-serif;          /* UI 文字、按鈕 */
  --font-mono:             'Courier New', monospace;      /* 數據、編號、代碼 */

  /* ── 字體大小 ── */
  --text-2xs:    0.625rem;   /* 10px */
  --text-xs:     0.75rem;    /* 12px */
  --text-sm:     0.875rem;   /* 14px */
  --text-base:   1rem;       /* 16px */
  --text-lg:     1.125rem;   /* 18px */
  --text-xl:     1.25rem;    /* 20px */
  --text-2xl:    1.5rem;     /* 24px */
  --text-3xl:    2rem;       /* 32px */
  --text-4xl:    2.5rem;     /* 40px */
  --text-5xl:    3rem;       /* 48px */
  --text-hero:   4rem;       /* 64px — 登入牆標題 */

  /* ── 字體粗細 ── */
  --weight-normal:   400;
  --weight-medium:   500;
  --weight-bold:     700;

  /* ── 行高 ── */
  --leading-tight:   1.1;
  --leading-normal:  1.4;
  --leading-relaxed: 1.6;

  /* ── 字距 ── */
  --tracking-tight:    -0.02em;
  --tracking-normal:    0;
  --tracking-wide:      0.05em;
  --tracking-wider:     0.1em;
  --tracking-widest:    0.2em;
  --tracking-ultra:     0.3em;

  /* ── 間距（8px base grid） ── */
  --space-0:     0;
  --space-1:     4px;
  --space-2:     8px;
  --space-3:     12px;
  --space-4:     16px;
  --space-5:     20px;
  --space-6:     24px;
  --space-8:     32px;
  --space-10:    40px;
  --space-12:    48px;
  --space-16:    64px;

  /* ── 圓角 ── */
  --radius-none:   0;
  --radius-sm:     2px;
  --radius-md:     4px;
  --radius-lg:     8px;
  --radius-xl:     12px;
  --radius-full:   9999px;

  /* ── 陰影 & 光暈 ── */
  --shadow-none:         none;
  --shadow-sm:           0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-md:           0 4px 12px rgba(0, 0, 0, 0.6);
  --shadow-lg:           0 8px 24px rgba(0, 0, 0, 0.7);
  --shadow-glow-red:     0 0 20px rgba(255, 0, 60, 0.3);
  --shadow-glow-red-lg:  0 0 50px 20px rgba(255, 0, 60, 0.8);
  --shadow-glow-cyan:    0 0 20px rgba(0, 243, 255, 0.3);
  --shadow-glow-green:   0 0 20px rgba(0, 255, 102, 0.3);
  --shadow-glow-white:   0 0 20px rgba(255, 255, 255, 0.5);
  --shadow-inset-red:    inset 0 0 10px rgba(255, 0, 60, 0.2);
  --shadow-inset-dark:   inset 0 0 100px rgba(0, 0, 0, 0.9);
  --shadow-vignette:     0 0 100px rgba(255, 0, 60, 0.1) inset;

  /* ── 動畫時長 ── */
  --duration-instant:  50ms;
  --duration-fast:     150ms;
  --duration-normal:   300ms;
  --duration-slow:     600ms;
  --duration-slower:   800ms;
  --duration-crawl:    1200ms;

  /* ── 動畫曲線 ── */
  --ease-default:      cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in:           cubic-bezier(0.4, 0, 1, 1);
  --ease-out:          cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce:       cubic-bezier(0.25, 1, 0.5, 1);
  --ease-crash:        cubic-bezier(0.36, 0.07, 0.19, 0.97);

  /* ── Z 軸層級 ── */
  --z-base:        1;
  --z-cell:        10;
  --z-player-id:   10;
  --z-grid:        20;
  --z-corner:      40;
  --z-ui-overlay:  50;
  --z-crt:         50;
  --z-banner:      100;
  --z-nav:         200;
  --z-modal:       500;
  --z-hover-cell:  999;
  --z-flying:      1000;
  --z-toast:       1100;

  /* ── 佈局 ── */
  --nav-height:    56px;
  --nav-height-lg: 64px;
  --content-max-width: 480px;
  --matrix-aspect: 16 / 9;
  --grid-cols:     16;
  --grid-rows:     7;
  --grid-gap:      0.5vh;
}
```

---

## 3. 色彩系統

### 3.1 主色盤

```
 ┌──────────────────────────────────────────────────────────┐
 │                                                          │
 │   ██████  #ff003c   BLOOD RED      主色 / 強調 / 危險    │
 │   ██████  #1a0005   DARK RED       暗紅背景漸層          │
 │   ██████  #00f3ff   CYBER CYAN     資訊 / 互動 / 連結    │
 │   ██████  #ff00e6   CYBER MAGENTA  Glitch 特效專用       │
 │   ██████  #00ff66   ONLINE GREEN   成功 / 在線狀態       │
 │   ██████  #020002   VOID BLACK     最深底色              │
 │   ██████  #ffffff   WHITE          主要文字              │
 │                                                          │
 └──────────────────────────────────────────────────────────┘
```

### 3.2 色彩語意對照

| 用途 | Token | 色值 | 範例場景 |
|------|-------|------|---------|
| 主要操作 | `--color-blood-red` | `#ff003c` | 按鈕背景、Tab 選中、邊框 focus |
| 互動反饋 | `--color-cyber-cyan` | `#00f3ff` | hover 文字、連結、輔助標題 |
| 系統特效 | `--color-cyber-magenta` | `#ff00e6` | Glitch after 層、RGB 分裂 |
| 成功/在線 | `--color-online-green` | `#00ff66` | 登入狀態燈、成功提示 |
| 危險/錯誤 | `--color-blood-red` | `#ff003c` | 錯誤訊息、刪除按鈕 |
| 警告 | `--color-warning` | `#ff9500` | 票數將盡提示 |

### 3.3 背景網格紋理

從 `index 2.html` 提取的全域背景紋理，20px 網格線：

```css
body {
  background-color: var(--color-bg-void);
  background-image:
    linear-gradient(rgba(255, 0, 60, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 60, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### 3.4 暈映漸層（Vignette）

用於容器背景，營造監控螢幕的中心聚光效果：

```css
.vignette {
  background: var(--color-bg-vignette);
  /* radial-gradient(circle at center, rgba(30,0,0,0.8) 0%, rgba(0,0,0,1) 80%) */
}
```

---

## 4. 字體系統

### 4.1 字體載入

```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@500;700&display=swap" rel="stylesheet">
```

### 4.2 字體角色

| 角色 | Token | 字體 | 使用場景 |
|------|-------|------|---------|
| **Display** | `--font-display` | Anton | 頁面標題、Banner 文字、大型裝飾性文字 |
| **UI** | `--font-ui` | Oswald 500/700 | 按鈕文字、導覽列、卡片標題、一般 UI |
| **Mono** | `--font-mono` | Courier New | 玩家編號、倒計時、狀態碼、資料標籤 |

### 4.3 字級規範

```
Display / Hero（頁面標題）
├── hero:   4rem / Anton / bold / tracking-widest / 僅登入牆標題
├── h1:     2.5rem / Anton / bold / tracking-widest
├── h2:     2rem / Anton / bold / tracking-wider
└── h3:     1.5rem / Oswald / 700 / tracking-wide

UI 文字
├── body-lg: 1.125rem / Oswald / 500
├── body:    1rem / Oswald / 500
├── body-sm: 0.875rem / Oswald / 500
└── caption: 0.75rem / Oswald / 500

Mono 數據
├── data-lg: 1.25rem / Courier New / bold
├── data:    0.875rem / Courier New / bold
└── data-sm: 0.75rem / Courier New / bold
```

### 4.4 文字樣式 Class

```css
/* Display 標題：帶紅色 text-shadow */
.ui-text {
  font-family: var(--font-display);
  text-shadow: 2px 2px 0px #000, -1px -1px 0 var(--color-blood-red);
}

/* Mono 數據標籤：玩家 ID 風格 */
.data-label {
  font-family: var(--font-mono);
  font-weight: bold;
  color: var(--color-text-primary);
  background: rgba(0, 0, 0, 0.7);
  padding: 0 var(--space-1);
  border-radius: var(--radius-sm);
  text-shadow: 0 0 5px var(--color-blood-red);
}

/* Cyan 強調副標 */
.subtitle-cyber {
  font-family: var(--font-mono);
  letter-spacing: var(--tracking-ultra);
  color: var(--color-cyber-cyan);
}
```

---

## 5. 間距與網格

### 5.1 Base Grid

所有間距基於 **4px 單位**，常用倍數遵循 8px grid：

```
4px  (--space-1)  → 極小內邊距
8px  (--space-2)  → 元件內部間距
12px (--space-3)  → 緊湊排列
16px (--space-4)  → 標準間距 ★
24px (--space-6)  → 區塊間隔
32px (--space-8)  → 大段落間距
48px (--space-12) → 區段間距
```

### 5.2 頁面佈局間距

```
┌───────────────────────────────────┐
│  padding: var(--space-4)          │  ← 頁面水平邊距 16px
│  ┌─────────────────────────────┐  │
│  │  Section                    │  │
│  │  margin-bottom: var(--space-8) │
│  └─────────────────────────────┘  │
│  ┌─────────────────────────────┐  │
│  │  Section                    │  │
│  └─────────────────────────────┘  │
│                                   │
│  ← padding-bottom: nav-height →  │
├───────────────────────────────────┤
│  Nav Bar (56px)                   │
└───────────────────────────────────┘
```

### 5.3 矩陣網格（Matrix Grid）

直接沿用 `index 2.html` 的網格系統：

```css
.matrix-grid {
  position: absolute;
  inset: 6% 4%;               /* 上下 6%，左右 4% 留白 */
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 0.5vh;                 /* 約 3-5px 視視窗高度 */
}
```

---

## 6. 圖像處理

### 6.1 矩陣頭像濾鏡

所有矩陣格中的頭像套用末日紅色濾鏡，源自 `index 2.html`：

```css
.avatar-matrix {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) sepia(100%) hue-rotate(-50deg) saturate(500%) contrast(1.2);
  opacity: 0.8;
  mix-blend-mode: hard-light;
}
```

**效果說明**：原始彩色照片 → 灰階 → 棕褐色 → 色相旋轉至血紅 → 高飽和 → 高對比。
整體呈現暗紅色調的末日風格頭像。

### 6.2 Hover 時還原

```css
.cell.active-player:hover .avatar-matrix {
  filter: none;          /* 還原真實彩色 */
  opacity: 1;
  mix-blend-mode: normal;
}
```

### 6.3 個人頁頭像

個人頁的頭像 **不** 套用末日濾鏡，使用圓形裁切：

```css
.avatar-profile {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border-active);
  box-shadow: var(--shadow-glow-red);
}
```

### 6.4 格子光澤覆蓋

每個矩陣格子帶有 135 度光澤漸層（`::before`），增加立體感：

```css
.cell::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  z-index: 5;
  pointer-events: none;
}
```

---

## 7. 特效系統

所有特效從 `index 2.html` 精確提取，作為全域可複用的效果 class。

### 7.1 CRT 掃描線覆蓋

```css
.fx-crt {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: var(--z-crt);
  box-shadow: var(--shadow-inset-dark);
}
```

**使用場景**: 矩陣登入牆全域覆蓋層。

### 7.2 文字 Glitch 效果

雙層 `::before`（cyan）+ `::after`（red）偏移 + clip-path 動畫：

```css
.fx-text-glitch {
  position: relative;
}

.fx-text-glitch::before,
.fx-text-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  pointer-events: none;
}

.fx-text-glitch::before {
  color: var(--color-cyber-cyan);
  z-index: -1;
  transform: translate(-2px, 2px);
  animation: glitch-text-cyan 2s infinite linear alternate-reverse;
}

.fx-text-glitch::after {
  color: var(--color-blood-red);
  z-index: -2;
  transform: translate(2px, -2px);
  animation: glitch-text-red 3s infinite linear alternate-reverse;
}

@keyframes glitch-text-cyan {
  0%   { clip-path: inset(20% 0 80% 0); }
  20%  { clip-path: inset(60% 0 10% 0); transform: translate(-4px, 1px); }
  40%  { clip-path: inset(40% 0 50% 0); }
  60%  { clip-path: inset(80% 0 5% 0);  transform: translate(2px, -2px); }
  80%  { clip-path: inset(10% 0 70% 0); }
  100% { clip-path: inset(30% 0 20% 0); transform: translate(-2px, 2px); }
}

@keyframes glitch-text-red {
  0%   { clip-path: inset(10% 0 60% 0); }
  20%  { clip-path: inset(30% 0 20% 0); transform: translate(2px, -2px); }
  40%  { clip-path: inset(70% 0 10% 0); }
  60%  { clip-path: inset(20% 0 50% 0); transform: translate(-2px, 2px); }
  80%  { clip-path: inset(50% 0 30% 0); }
  100% { clip-path: inset(5% 0 80% 0);  transform: translate(4px, -1px); }
}
```

**使用方式**:
```html
<h1 class="ui-text fx-text-glitch" data-text="AI末日議會">AI末日議會</h1>
```

### 7.3 死寂雜訊（Static Noise）

用純 CSS gradient 產生的電視雜訊效果：

```css
.fx-noise {
  background:
    repeating-radial-gradient(#000 0 0.0001%, #fff 0 0.0002%) 50% 0 / 2500px 2500px,
    repeating-conic-gradient(#000 0 0.0001%, #fff 0 0.0002%) 60% 60% / 2500px 2500px;
  background-blend-mode: difference;
  animation: noise-shift 0.2s infinite alternate;
  opacity: 0.15;
}

@keyframes noise-shift {
  100% { background-position: 50% 0, 60% 50%; }
}
```

**使用場景**: 空格子、離線玩家、淘汰後的殘留。

### 7.4 呼吸燈脈衝

```css
.fx-pulse {
  animation: pulse-breathe 1.5s infinite alternate;
}

@keyframes pulse-breathe {
  from {
    opacity: 0.1;
  }
  to {
    opacity: 0.3;
    border-color: var(--color-border-strong);
  }
}

/* 綠色在線呼吸燈（個人頁用） */
.fx-pulse-green {
  animation: pulse-green 1.2s infinite alternate;
}

@keyframes pulse-green {
  from {
    box-shadow: 0 0 5px rgba(0, 255, 102, 0.3);
    opacity: 0.7;
  }
  to {
    box-shadow: 0 0 20px rgba(0, 255, 102, 0.8);
    opacity: 1;
  }
}
```

### 7.5 RGB 分裂（Glitch Flash）

```css
.fx-rgb-split {
  animation: rgb-split 0.2s steps(2) infinite;
}

@keyframes rgb-split {
  0% {
    transform: translate(0);
    filter: drop-shadow(-3px 0 var(--color-cyber-cyan))
            drop-shadow(3px 0 var(--color-cyber-magenta));
  }
  50% {
    transform: translate(-2px, 2px);
    filter: drop-shadow(3px 0 var(--color-cyber-cyan))
            drop-shadow(-3px 0 var(--color-cyber-magenta));
  }
  100% {
    transform: translate(2px, -2px);
    filter: drop-shadow(-3px 0 var(--color-cyber-cyan))
            drop-shadow(3px 0 var(--color-cyber-magenta));
  }
}
```

**使用場景**: 矩陣中隨機觸發的短暫閃爍。

### 7.6 崩潰淘汰動畫

```css
.fx-crash {
  animation:
    crash-shake 0.4s var(--ease-crash) both,
    crash-color 0.4s linear both;
}

@keyframes crash-shake {
  10%, 90% { transform: translate3d(-2px, 0, 0) scale(1.1); }
  20%, 80% { transform: translate3d(4px, 0, 0) scale(1.1) skewX(10deg); }
  30%, 50%, 70% { transform: translate3d(-6px, 0, 0) scale(1.1) skewX(-10deg); }
  40%, 60% { transform: translate3d(6px, 0, 0) scale(1.1); }
}

@keyframes crash-color {
  0%   { filter: invert(1) hue-rotate(90deg) brightness(2); }
  100% { filter: invert(0) brightness(0); }
}
```

### 7.7 警告 Banner

全螢幕寬度的紅色閃現 Banner：

```css
.fx-warning-banner {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  background: rgba(255, 0, 60, 0.8);
  color: white;
  font-family: var(--font-display);
  font-size: 8vh;
  text-align: center;
  letter-spacing: var(--tracking-widest);
  padding: 1vh 0;
  transform: translateY(-50%) scaleY(0);
  z-index: var(--z-banner);
  mix-blend-mode: hard-light;
  pointer-events: none;
  transition: transform 0.1s;
}
```

### 7.8 四角標記（Corner Marks）

螢幕四角的紅色直角標記，增加監控畫面感：

```css
.fx-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: var(--z-corner);
}
.fx-corner--tl { top: 16px; left: 16px; border-top: 2px solid #991b1b; border-left: 2px solid #991b1b; }
.fx-corner--tr { top: 16px; right: 16px; border-top: 2px solid #991b1b; border-right: 2px solid #991b1b; }
.fx-corner--bl { bottom: 16px; left: 16px; border-bottom: 2px solid #991b1b; border-left: 2px solid #991b1b; }
.fx-corner--br { bottom: 16px; right: 16px; border-bottom: 2px solid #991b1b; border-right: 2px solid #991b1b; }
```

### 7.9 特效使用指南

| 特效 Class | 效能成本 | 建議限制 | 頁面 |
|-----------|---------|---------|------|
| `fx-crt` | 低 | 1 個 per 頁面 | 矩陣頁 |
| `fx-text-glitch` | 中 | 最多 2-3 個標題 | 全域標題 |
| `fx-noise` | 高 | 靜態展示用 | 矩陣空格 |
| `fx-pulse` | 低 | 無限制 | 待機格、狀態燈 |
| `fx-rgb-split` | 高 | 同時最多 1-2 個 | 矩陣隨機閃爍 |
| `fx-crash` | 高 | 一次 1 個 | 矩陣淘汰 |
| `fx-warning-banner` | 低 | 1 個 | 矩陣頁 |

---

## 8. 元件庫 — Atomic Design

### 8.1 Atoms（原子）

#### Button

三種變體，所有按鈕統一使用 `--font-ui`（Oswald）：

```css
/* ── 基礎按鈕 ── */
.btn {
  font-family: var(--font-ui);
  font-weight: var(--weight-bold);
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-2) var(--space-6);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
  position: relative;
  overflow: hidden;
}

/* 主要按鈕 — 血紅底 */
.btn--primary {
  background: var(--color-blood-red);
  color: var(--color-text-primary);
  border-color: var(--color-blood-red);
  box-shadow: var(--shadow-glow-red);
}
.btn--primary:hover {
  background: #e60036;
  box-shadow: 0 0 30px rgba(255, 0, 60, 0.5);
}
.btn--primary:active {
  transform: scale(0.97);
}

/* 次要按鈕 — 透明底 + 紅邊框 */
.btn--secondary {
  background: transparent;
  color: var(--color-blood-red);
  border-color: var(--color-border-active);
}
.btn--secondary:hover {
  background: rgba(255, 0, 60, 0.1);
  box-shadow: var(--shadow-glow-red);
}

/* 幽靈按鈕 — 純文字 */
.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
  padding: var(--space-2) var(--space-4);
}
.btn--ghost:hover {
  color: var(--color-cyber-cyan);
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
}

/* 禁用狀態 */
.btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  box-shadow: none;
}

/* 尺寸變體 */
.btn--sm { font-size: var(--text-xs); padding: var(--space-1) var(--space-4); }
.btn--lg { font-size: var(--text-base); padding: var(--space-3) var(--space-8); }
```

#### Input

```css
.input {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  background: var(--color-bg-input);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  width: 100%;
  outline: none;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input:focus {
  border-color: var(--color-blood-red);
  box-shadow: var(--shadow-glow-red);
}

.input--error {
  border-color: var(--color-error);
}
```

#### Textarea

```css
.textarea {
  /* 繼承 .input 所有樣式 */
  font-family: var(--font-ui);    /* textarea 用 UI 字體更好讀 */
  min-height: 100px;
  resize: vertical;
}
```

#### Avatar

```css
/* 矩陣三角形頭像 */
.avatar--triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  overflow: hidden;
  position: relative;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
}

/* 圓形頭像（個人頁、投票、排行） */
.avatar--circle {
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 2px solid var(--color-border-active);
}

/* 尺寸 */
.avatar--xs { width: 24px; height: 24px; }
.avatar--sm { width: 32px; height: 32px; }
.avatar--md { width: 48px; height: 48px; }
.avatar--lg { width: 80px; height: 80px; }
.avatar--xl { width: 120px; height: 120px; }
```

#### Badge

```css
.badge {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.badge--online  { background: rgba(0,255,102,0.15); color: var(--color-online-green); border: 1px solid rgba(0,255,102,0.3); }
.badge--offline { background: rgba(255,255,255,0.05); color: var(--color-text-muted); border: 1px solid rgba(255,255,255,0.1); }
.badge--voted   { background: rgba(0,243,255,0.1); color: var(--color-cyber-cyan); border: 1px solid rgba(0,243,255,0.2); }
.badge--locked  { background: rgba(255,0,60,0.15); color: var(--color-blood-red); border: 1px solid rgba(255,0,60,0.3); }
```

#### Divider

```css
.divider {
  border: none;
  height: 1px;
  background: var(--color-border-default);
  margin: var(--space-6) 0;
}
```

---

### 8.2 Molecules（分子）

#### PlayerCard

```
┌─────────────────────┐
│  ▲ (三角形頭像)      │
│  023                 │  ← Mono 編號
│  ● ONLINE            │  ← Badge
└─────────────────────┘
```

#### VoteChip

```
┌──────────────────────────────┐
│  ○ 頭像  顯示名稱   [投票]   │  ← 水平排列
│          #023                │
└──────────────────────────────┘
```

#### QuestionCard

```
┌──────────────────────────────┐
│  第 03 區                    │  ← Mono 編號
│  ─────────────────           │
│  題目預覽文字...              │  ← UI 字體
│                  🔒 已鎖定    │  ← Badge
└──────────────────────────────┘
```

#### FormField

```
┌──────────────────────────────┐
│  顯示名稱                     │  ← Label (Mono, muted)
│  ┌────────────────────────┐  │
│  │  輸入內容               │  │  ← Input
│  └────────────────────────┘  │
│  ⚠ 名稱不可為空             │  ← Error (red, text-xs)
└──────────────────────────────┘
```

#### StatusLight

```
┌──────────────────┐
│  ◉ 已登入         │  ← 綠色圓點 + fx-pulse-green + 文字
│  ◯ 未登入         │  ← 灰色圓點 + 文字
└──────────────────┘
```

```css
.status-light {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.status-light__dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
}

.status-light__dot--online {
  background: var(--color-online-green);
  box-shadow: 0 0 8px var(--color-online-green);
  animation: pulse-green 1.2s infinite alternate;
}

.status-light__dot--offline {
  background: var(--color-text-muted);
}
```

#### RankItem

```
┌──────────────────────────────────────┐
│  #1   ○ 頭像   顯示名稱      42 票   │
│  ──   ──────   ────────      ─────   │
│  Mono  Avatar   UI           Mono    │
│  gold-glow                   cyan    │
└──────────────────────────────────────┘
```

前三名特殊光效：

```css
.rank-item--1st { border-left: 3px solid #ffd700; box-shadow: inset 4px 0 15px rgba(255,215,0,0.15); }
.rank-item--2nd { border-left: 3px solid #c0c0c0; box-shadow: inset 4px 0 15px rgba(192,192,192,0.1); }
.rank-item--3rd { border-left: 3px solid #cd7f32; box-shadow: inset 4px 0 15px rgba(205,127,50,0.1); }
```

---

### 8.3 Organisms（組織）

#### MatrixGrid

沿用 `index 2.html` 完整結構：

```
┌──────────────────────────────────────────────────┐
│  ┌┐                                          ┌┐  │  ← Corner Marks
│                                                   │
│   AI末日議會              19:00-24:00               │  ← UI Overlay
│   MATRIX_MONITORING     SESSION: 3/28             │
│                                                   │
│   ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲             │
│   ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲             │  ← 16×7 Grid
│   ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲             │
│   ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲             │  ← ▲ = cell (三角形)
│   ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲             │
│   ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲             │
│   ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲             │
│                                                   │
│  ███████ SYSTEM SINGULARITY DETECTED ███████      │  ← Warning Banner
│                                                   │
│  └┘                                          └┘  │
│  ═══════════ CRT Scanline Overlay ═══════════    │
└──────────────────────────────────────────────────┘
```

#### NavBar（底部導覽列）

```
┌──────────────────────────────────────┐
│                                      │
│   ◇ 個人      ◆ 矩陣      ◇ 題區    │  ← 3 Tab
│   個人       矩陣       題區        │
│                                      │
└──────────────────────────────────────┘
```

```css
.nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: rgba(0, 0, 0, 0.95);
  border-top: 1px solid var(--color-border-default);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: var(--z-nav);
  padding-bottom: env(safe-area-inset-bottom);  /* iPhone 底部安全區 */
}

.nav-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  cursor: pointer;
  padding: var(--space-2);
  transition: color var(--duration-fast);
}

.nav-bar__item--active {
  color: var(--color-blood-red);
  text-shadow: 0 0 10px rgba(255, 0, 60, 0.5);
}

.nav-bar__item:hover {
  color: var(--color-cyber-cyan);
}
```

#### BusinessCard（名片展示）

```
┌──────────────────────────────┐
│          ┌──────┐            │
│          │ 頭像  │            │  ← 圓形，真實色彩
│          └──────┘            │
│          #023                │  ← Mono 編號，cyan
│       PLAYER NAME            │  ← Display 字體
│  ─────────────────────       │
│  自我介紹文字...              │  ← UI 字體，muted
│                              │
│  ◉ 已登入                    │  ← StatusLight
│         ─────────            │
│  [編輯個人資料]               │  ← btn--secondary
└──────────────────────────────┘

背景: --color-bg-surface
邊框: --color-border-default
四角: Corner Marks (小型版)
```

---

## 9. 佈局模板

### 9.1 MobileLayout（手機主佈局）

```
┌──────────────────────────────┐
│  頂部狀態列 (optional)        │  ← 頁面標題 + 返回按鈕
│  height: 48px                │
├──────────────────────────────┤
│                              │
│                              │
│       滾動內容區域             │  ← overflow-y: auto
│       max-width: 480px       │
│       padding: 0 16px        │
│                              │
│                              │
├──────────────────────────────┤
│  底部導覽列 (NavBar)          │  ← 固定 56px
│  height: 56px                │
└──────────────────────────────┘
```

```css
.layout-mobile {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;  /* 動態視窗高度，避免手機底部工具列問題 */
  background: var(--color-bg-void);
}

.layout-mobile__content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-4);
  padding-bottom: calc(var(--nav-height) + var(--space-4));
  max-width: var(--content-max-width);
  margin: 0 auto;
  width: 100%;
}
```

### 9.2 MatrixLayout（矩陣頁專用）

矩陣頁使用全屏佈局，不受 `max-width` 限制：

```css
.layout-matrix {
  position: relative;
  width: 100%;
  height: calc(100vh - var(--nav-height));
  height: calc(100dvh - var(--nav-height));
  overflow: hidden;
}
```

### 9.3 iPadLockLayout（iPad 鎖定模式）

```
┌──────────────────────────────────────────┐
│                                          │
│              第 03 區                    │
│          ──────────────                  │
│          題目內容文字                     │
│                                          │
│          ┌──────────────┐                │
│          │              │                │
│          │   QR CODE    │                │
│          │              │                │
│          └──────────────┘                │
│                                          │
│       掃描作答                            │
│                                          │
│              [🔓 解鎖]                   │  ← 需管理員密碼
│                                          │
└──────────────────────────────────────────┘

全螢幕，無導覽列，無法返回
背景: 純黑 + CRT 特效
```

### 9.4 AuthLayout（登入頁）

```
┌──────────────────────────────┐
│                              │
│      AI末日議會                │  ← Display + fx-text-glitch
│      末日議會                 │  ← Mono, cyan, pulse
│                              │
│   ┌────────────────────┐     │
│   │  電子信箱           │     │
│   └────────────────────┘     │
│   ┌────────────────────┐     │
│   │  密碼               │     │
│   └────────────────────┘     │
│                              │
│   [ 登 入 ]                  │  ← btn--primary, full-width
│    沒有帳號？註冊             │  ← btn--ghost
│                              │
└──────────────────────────────┘

背景: --color-bg-void + 網格紋理
居中: flex center
```

---

## 10. 動態與互動

### 10.1 互動狀態

所有可互動元素遵循以下狀態：

| 狀態 | 視覺變化 |
|------|---------|
| Default | 基礎樣式 |
| Hover | 亮度提升 / 色彩變化 / glow 增強 |
| Active | scale(0.97) 微縮 |
| Focus | blood-red 邊框 + glow |
| Disabled | opacity: 0.3, cursor: not-allowed |

### 10.2 矩陣格互動（from index 2.html）

```
Default:     三角形裁切 + 紅色濾鏡頭像
                ▲
               / \
              /   \
             /─────\

Hover:       取消裁切 + 放大 2.5x + 真實色彩 + 白色邊框
             ┌─────────────┐
             │             │
             │   真實頭像   │  scale(2.5)
             │             │  z-index: 999
             │    023      │  白色 glow
             └─────────────┘

Click:       跳轉至投票頁（預選此玩家）
```

### 10.3 頁面轉場

```css
/* 頁面進入 */
.page-enter {
  animation: page-fade-in var(--duration-normal) var(--ease-out);
}

@keyframes page-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 10.4 數據流降落動畫（矩陣頁專用）

保留 `index 2.html` 的兩階段 Web Animations API 動畫：

```
Phase 1 (800ms):  螢幕右側外 → 中央放大 4.5x + 紅色 glow
                  方形完整顯示，讓觀眾辨識

Phase 2 (延遲 1200ms 後, 800ms):
                  中央 → 目標格子位置
                  方形 → 三角形 clip-path 漸變
                  放大 → 縮小至 1x
                  opacity 淡出嵌入
```

---

## 11. 響應式策略

### 11.1 斷點

```css
/* Mobile First */
/* 預設: 0 - 767px  → 手機 */
@media (min-width: 768px)  { /* → iPad / 平板 */ }
@media (min-width: 1024px) { /* → 桌面 / 大螢幕投影 */ }
```

### 11.2 各裝置適配

| 裝置 | 矩陣頁 | 其他頁面 | 導覽 |
|------|--------|---------|------|
| 手機 (< 768px) | 橫向滾動或自適應縮放 | max-width: 480px 居中 | 底部 Tab |
| iPad (768-1023px) | 16:9 等比縮放 | max-width: 600px | 底部 Tab |
| 桌面 (≥ 1024px) | 16:9 容器居中 | max-width: 480px | 底部 Tab |

### 11.3 矩陣頁響應式

矩陣頁需維持 16:9 比例，使用 `index 2.html` 的容器策略：

```css
.matrix-container {
  width: 100vw;
  max-width: 177.78vh;   /* 16:9 = 寬 ≤ 高×1.7778 */
  aspect-ratio: 16 / 9;
  margin: 0 auto;
}
```

---

## 12. 無障礙考量

儘管末日風格偏暗，仍需確保基本可用性：

| 項目 | 要求 |
|------|------|
| 對比度 | 主要文字 `#fff` on `#020002` → 對比度 21:1 (AAA) |
| Focus 可見 | 所有可互動元素有明顯 focus 樣式 (red glow) |
| 觸控目標 | 最小 44×44px（按鈕、Tab、可點擊元素） |
| 動畫減量 | `prefers-reduced-motion` 時關閉 glitch/noise 動畫 |
| 語義 HTML | 使用 `<nav>`, `<main>`, `<button>`, `<input>` 等語意標籤 |

```css
@media (prefers-reduced-motion: reduce) {
  .fx-text-glitch::before,
  .fx-text-glitch::after,
  .fx-noise,
  .fx-pulse,
  .fx-pulse-green,
  .fx-rgb-split,
  .fx-crash {
    animation: none !important;
  }
}
```

---

## 13. CSS 檔案架構

```
css/
├── tokens.css          ← Design Tokens（本文件第 2 節完整內容）
├── base.css            ← Reset + body 基礎樣式 + 背景紋理
├── atoms.css           ← Button, Input, Textarea, Avatar, Badge, Divider
├── molecules.css       ← PlayerCard, VoteChip, QuestionCard, FormField,
│                          QRDisplay, StatusLight, RankItem
├── organisms.css       ← MatrixGrid, NavBar, BusinessCard, VotingPanel,
│                          LeaderBoard, ZoneOverview, QuestionGenerator,
│                          AnswerForm, AdminPanel
├── effects.css         ← 所有 fx-* 特效 class 與 @keyframes
├── layouts.css         ← MobileLayout, MatrixLayout, iPadLockLayout, AuthLayout
└── utilities.css       ← 通用輔助 class（hidden, sr-only, truncate 等）
```

**載入順序**（index.html 中）：

```html
<!-- 1. 外部依賴 -->
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@500;700&display=swap" rel="stylesheet">

<!-- 2. Design System（順序重要） -->
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/atoms.css">
<link rel="stylesheet" href="css/molecules.css">
<link rel="stylesheet" href="css/organisms.css">
<link rel="stylesheet" href="css/effects.css">
<link rel="stylesheet" href="css/layouts.css">
<link rel="stylesheet" href="css/utilities.css">
```

---

> **文件結束**
> 本 Style Guide 為AI末日議會 WebApp 的唯一視覺規範來源。
> 所有 UI 開發必須引用本文件的 Design Tokens 與元件規範。
> 如需新增元件或修改 Token，請先更新本文件再實作。
