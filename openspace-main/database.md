# AI末日議會 — 資料庫架構文件

> **版本**: v1.0
> **日期**: 2026-03-09
> **技術**: Supabase (PostgreSQL 15 + Auth + Storage + Realtime)

---

## 1. 架構總覽

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase 專案                         │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   Auth   │  │ Database │  │ Storage  │  │Realtime│ │
│  │ (Email)  │  │ (Pg 15)  │  │(Buckets) │  │  (WS)  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │             │             │             │      │
│       │  auth.users │  6 tables   │  avatars/   │ 3 訂閱│
│       │  (內建)     │  (自定義)   │  bucket     │ 頻道  │
│       └──────┬──────┘             │             │      │
│              │ FK(id)             │             │      │
│              ▼                    │             │      │
│         public.users ─────────────┘             │      │
│              │                                  │      │
│              ├── votes ─────────────────────────┘      │
│              ├── answers ── questions ── zones          │
│              └── app_settings                          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. ER 關係圖

```
                          ┌──────────────┐
                          │ app_settings │
                          │──────────────│
                          │ key (PK)     │
                          │ value        │
                          └──────────────┘

┌──────────────────┐
│      users       │
│──────────────────│
│ id (PK, uuid)    │──────────────┐
│ player_number    │              │
│ email            │         1:N (voter_id)
│ display_name     │              │
│ bio              │              ▼
│ avatar_url       │      ┌──────────────────┐
│ is_online        │      │      votes       │
│ role             │      │──────────────────│
│ created_at       │      │ id (PK, uuid)    │
│                  │──┐   │ voter_id (FK)    │
└──────────────────┘  │   │ target_id (FK)   │◄── 1:N (target_id)
        │             │   │ created_at       │         │
        │             │   └──────────────────┘         │
        │             │                                │
        │             └────────────────────────────────┘
        │
        │ 1:N (user_id)          1:N (created_by)
        │                              │
        ▼                              ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│     answers      │      │    questions     │      │      zones       │
│──────────────────│      │──────────────────│      │──────────────────│
│ id (PK, uuid)    │      │ id (PK, uuid)    │      │ id (PK, int)     │
│ question_id (FK) │─────►│ zone_id (FK)     │─────►│ zone_name        │
│ user_id (FK)     │ N:1  │ content          │ N:1  │ current_question │
│ content          │      │ source_type      │◄─────│   _id (FK)       │
│ created_at       │      │ qr_code_url      │      │ is_locked        │
│ updated_at       │      │ created_by (FK)  │      └──────────────────┘
└──────────────────┘      │ created_at       │
                          └──────────────────┘
```

**關係摘要：**

| 關係 | 類型 | 說明 |
|------|------|------|
| users → votes | 1:N | 一個用戶可投多票（最多 5 票） |
| users → votes (target) | 1:N | 一個用戶可被多人投票 |
| users → answers | 1:N | 一個用戶可作答多題 |
| users → questions | 1:N | 一個用戶可出多題 |
| questions → answers | 1:N | 一題可有多人作答 |
| zones → questions | 1:N | 一區可有多道題目 |
| zones → questions (current) | 1:1 | 一區當前只顯示一道題 |

---

## 3. 資料表詳細定義

### 3.1 `users` — 玩家資料

> 與 Supabase `auth.users` 透過 `id` 同步，註冊時自動建立。

| 欄位 | 類型 | 約束 | 預設值 | 說明 |
|------|------|------|--------|------|
| `id` | `uuid` | PK, FK → auth.users | — | Supabase Auth UID |
| `player_number` | `int` | UNIQUE, NOT NULL | 自動遞增 | 玩家編號 1–100 |
| `email` | `text` | UNIQUE, NOT NULL | — | 登入信箱 |
| `display_name` | `text` | NOT NULL | — | 顯示名稱 |
| `bio` | `text` | NULLABLE | `NULL` | 自我介紹 |
| `avatar_url` | `text` | NULLABLE | `NULL` | 頭像圖片 URL |
| `is_online` | `boolean` | NOT NULL | `false` | 活動當天登入狀態 |
| `role` | `text` | NOT NULL | `'user'` | 角色：`user` / `admin` |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 建立時間 |

**索引：**
- `idx_users_player_number` — 矩陣牆按編號查詢
- `idx_users_is_online` — 在線人數統計

**觸發器：**
- `on_auth_user_created` → 自動在 `public.users` 建立對應記錄，分配下一個可用的 `player_number`

---

### 3.2 `votes` — 投票紀錄

| 欄位 | 類型 | 約束 | 預設值 | 說明 |
|------|------|------|--------|------|
| `id` | `uuid` | PK | `gen_random_uuid()` | 主鍵 |
| `voter_id` | `uuid` | FK → users, NOT NULL | — | 投票者 |
| `target_id` | `uuid` | FK → users, NOT NULL | — | 被投票者 |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 投票時間 |

**約束：**
- `UNIQUE(voter_id, target_id)` — 不可重複投同一人
- `CHECK(voter_id != target_id)` — 不可投給自己

**索引：**
- `idx_votes_voter` ON `voter_id` — 查詢「我投了誰」
- `idx_votes_target` ON `target_id` — 統計「誰被投了幾票」

**商業規則（透過 RLS 或 Function 實現）：**
- 每個 `voter_id` 最多 5 筆記錄（5 票分散制）
- 可取消已投出的票（DELETE）

---

### 3.3 `zones` — 11 個區域

| 欄位 | 類型 | 約束 | 預設值 | 說明 |
|------|------|------|--------|------|
| `id` | `int` | PK | — | 區域編號 1–11 |
| `zone_name` | `text` | NOT NULL | — | 區域名稱 |
| `current_question_id` | `uuid` | FK → questions, NULLABLE | `NULL` | 當前顯示的題目 |
| `is_locked` | `boolean` | NOT NULL | `false` | iPad 是否已鎖定 |

**預設資料（Seed）：**

| id | zone_name |
|----|-----------|
| 1 | ZONE 01 |
| 2 | ZONE 02 |
| 3 | ZONE 03 |
| 4 | ZONE 04 |
| 5 | ZONE 05 |
| 6 | ZONE 06 |
| 7 | ZONE 07 |
| 8 | ZONE 08 |
| 9 | ZONE 09 |
| 10 | ZONE 10 |
| 11 | ZONE 11 |

---

### 3.4 `questions` — 題目

| 欄位 | 類型 | 約束 | 預設值 | 說明 |
|------|------|------|--------|------|
| `id` | `uuid` | PK | `gen_random_uuid()` | 主鍵 |
| `zone_id` | `int` | FK → zones, NOT NULL | — | 所屬區域 |
| `content` | `text` | NOT NULL | — | 題目內容 |
| `source_type` | `text` | NOT NULL | — | `'ai'` / `'manual'` |
| `qr_code_url` | `text` | NULLABLE | `NULL` | QR Code 對應 URL |
| `created_by` | `uuid` | FK → users, NOT NULL | — | 出題者 |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 建立時間 |

**索引：**
- `idx_questions_zone` ON `zone_id` — 按區域查詢題目

---

### 3.5 `answers` — 作答紀錄

| 欄位 | 類型 | 約束 | 預設值 | 說明 |
|------|------|------|--------|------|
| `id` | `uuid` | PK | `gen_random_uuid()` | 主鍵 |
| `question_id` | `uuid` | FK → questions, NOT NULL | — | 對應題目 |
| `user_id` | `uuid` | FK → users, NOT NULL | — | 作答者 |
| `content` | `text` | NOT NULL | — | 答案內容 |
| `created_at` | `timestamptz` | NOT NULL | `now()` | 建立時間 |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | 最後修改時間 |

**約束：**
- `UNIQUE(question_id, user_id)` — 每人每題只能有一筆答案

**觸發器：**
- `on_answer_update` → 自動更新 `updated_at` 為 `now()`

---

### 3.6 `app_settings` — 系統設定

| 欄位 | 類型 | 約束 | 預設值 | 說明 |
|------|------|------|--------|------|
| `key` | `text` | PK | — | 設定鍵名 |
| `value` | `text` | NOT NULL | — | 設定值 |

**預設資料（Seed）：**

| key | value | 說明 |
|-----|-------|------|
| `event_password` | `''` | 活動密碼（管理員設定） |
| `force_offline` | `'false'` | 是否強制全體離線 |

---

## 4. Row Level Security (RLS)

所有表皆啟用 RLS。以下為各表的存取策略：

### 4.1 `users`

| 策略名稱 | 操作 | 條件 | 說明 |
|----------|------|------|------|
| `users_select_all` | SELECT | `auth.role() = 'authenticated'` | 所有登入者可讀所有人的公開資料 |
| `users_update_own` | UPDATE | `auth.uid() = id` | 只能修改自己的資料 |
| `users_insert_own` | INSERT | `auth.uid() = id` | 只能新增自己的記錄（配合觸發器） |

### 4.2 `votes`

| 策略名稱 | 操作 | 條件 | 說明 |
|----------|------|------|------|
| `votes_select_all` | SELECT | `auth.role() = 'authenticated'` | 所有人可讀（排行榜） |
| `votes_insert_own` | INSERT | `auth.uid() = voter_id` | 只能以自己身分投票 |
| `votes_delete_own` | DELETE | `auth.uid() = voter_id` | 只能取消自己投出的票 |

**額外限制（透過 Database Function）：**
```sql
-- 投票前檢查：同一 voter_id 不可超過 5 筆
CREATE OR REPLACE FUNCTION check_vote_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM votes WHERE voter_id = NEW.voter_id) >= 5 THEN
    RAISE EXCEPTION '已達投票上限（5 票）';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_vote_insert
  BEFORE INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION check_vote_limit();
```

### 4.3 `questions`

| 策略名稱 | 操作 | 條件 | 說明 |
|----------|------|------|------|
| `questions_select_all` | SELECT | `auth.role() = 'authenticated'` | 所有登入者可讀 |
| `questions_insert_auth` | INSERT | `auth.role() = 'authenticated'` | 所有登入者可出題 |
| `questions_update_owner` | UPDATE | `auth.uid() = created_by OR 用戶是 admin` | 創建者或管理員可修改 |
| `questions_delete_owner` | DELETE | `auth.uid() = created_by OR 用戶是 admin` | 創建者或管理員可刪除 |

### 4.4 `answers`

| 策略名稱 | 操作 | 條件 | 說明 |
|----------|------|------|------|
| `answers_select_own` | SELECT | `auth.uid() = user_id OR 用戶是 admin` | 自己看自己的，admin 看全部 |
| `answers_insert_own` | INSERT | `auth.uid() = user_id` | 只能以自己身分作答 |
| `answers_update_own` | UPDATE | `auth.uid() = user_id` | 只能修改自己的答案 |

### 4.5 `app_settings`

| 策略名稱 | 操作 | 條件 | 說明 |
|----------|------|------|------|
| `settings_select_all` | SELECT | `auth.role() = 'authenticated'` | 所有登入者可讀（驗證密碼用） |
| `settings_update_admin` | UPDATE | 用戶是 admin | 只有管理員可修改 |

### 4.6 `zones`

| 策略名稱 | 操作 | 條件 | 說明 |
|----------|------|------|------|
| `zones_select_all` | SELECT | `auth.role() = 'authenticated'` | 所有登入者可讀 |
| `zones_update_auth` | UPDATE | `auth.role() = 'authenticated'` | 登入者可更新（鎖定/解鎖邏輯另控） |

---

## 5. Realtime 訂閱

Supabase Realtime 透過 WebSocket 推送資料變更，以下為需要訂閱的頻道：

| 頻道 | 訂閱表 | 事件 | 使用頁面 | 說明 |
|------|--------|------|----------|------|
| `online-status` | `users` | UPDATE (`is_online`) | 矩陣頁 | 即時同步在線/離線狀態 |
| `vote-changes` | `votes` | INSERT, DELETE | 投票結果頁 | 即時更新排行榜 |
| `zone-lock` | `zones` | UPDATE (`is_locked`) | 題目總覽 | 同步鎖定狀態 |

**前端訂閱範例：**
```javascript
// 矩陣頁：監聽在線狀態
supabase
  .channel('online-status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'users',
    filter: 'is_online=eq.true'  // 或監聽所有變更
  }, (payload) => {
    updateMatrixCell(payload.new);
  })
  .subscribe();
```

---

## 6. Storage

| Bucket | 路徑格式 | 存取規則 | 檔案限制 |
|--------|----------|----------|----------|
| `avatars` | `avatars/{user_id}.jpg` | 公開讀取；登入者只能寫入自己的路徑 | JPG/PNG/WebP, ≤ 2MB |

**Storage Policy：**
```sql
-- 公開讀取
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 登入者寫入自己的頭像
CREATE POLICY "avatars_owner_write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 7. 資料流圖

### 7.1 註冊流程
```
用戶輸入 Email + 密碼
        │
        ▼
  Supabase Auth ──► auth.users 建立記錄
        │
        ▼ (觸發器)
  public.users 自動建立
  ├── id = auth.uid()
  ├── player_number = next_available (1–100)
  ├── email = 輸入的 email
  ├── display_name = email 前綴
  └── is_online = false
```

### 7.2 活動當天登入流程
```
用戶在個人頁輸入活動密碼
        │
        ▼
  前端查詢 app_settings (key='event_password')
        │
        ▼ 密碼比對
  ┌─ 正確 ──► UPDATE users SET is_online = true
  │            │
  │            ▼ (Realtime)
  │           矩陣牆收到變更 → 顯示該玩家頭像
  │
  └─ 錯誤 ──► 顯示錯誤訊息
```

### 7.3 投票流程
```
用戶點擊投票
     │
     ▼
  檢查剩餘票數 (SELECT COUNT WHERE voter_id = me)
     │
     ├── < 5 票 ──► INSERT votes
     │               │
     │               ▼ (Realtime)
     │              排行榜頁面收到變更 → 重新排序
     │
     └── = 5 票 ──► 提示「已用完所有票數」
```

### 7.4 出題 → 作答流程
```
iPad 出題者                              手機作答者
     │                                        │
     ▼                                        │
  建立題目 (INSERT questions)                 │
     │                                        │
     ▼                                        │
  更新區域 (UPDATE zones                      │
    SET current_question_id = 新題目)         │
     │                                        │
     ▼                                        │
  鎖定 iPad (UPDATE zones                     │
    SET is_locked = true)                     │
     │                                        │
     ▼                                        │
  顯示 QR Code ◄─── 手機掃碼 ──────────────►│
     │              (#/answer/{question_id})   │
     │                                        ▼
     │                               顯示題目 (SELECT questions)
     │                                        │
     │                                        ▼
     │                               提交答案 (UPSERT answers)
     │                                        │
     │                                        ▼
     │                               個人頁顯示作答紀錄
```

---

## 8. SQL 建表腳本

> 以下為完整建表 SQL，可直接在 Supabase SQL Editor 執行。

```sql
-- ============================================================
-- AI末日議會 — Database Schema
-- ============================================================

-- 1. users 表
CREATE TABLE public.users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  player_number int UNIQUE NOT NULL,
  email         text UNIQUE NOT NULL,
  display_name  text NOT NULL,
  bio           text,
  avatar_url    text,
  is_online     boolean NOT NULL DEFAULT false,
  role          text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_player_number ON public.users(player_number);
CREATE INDEX idx_users_is_online ON public.users(is_online);

-- 2. zones 表
CREATE TABLE public.zones (
  id                  int PRIMARY KEY,
  zone_name           text NOT NULL,
  current_question_id uuid,  -- FK 在 questions 建立後再加
  is_locked           boolean NOT NULL DEFAULT false
);

-- 預設 11 區
INSERT INTO public.zones (id, zone_name) VALUES
  (1, 'ZONE 01'), (2, 'ZONE 02'), (3, 'ZONE 03'),
  (4, 'ZONE 04'), (5, 'ZONE 05'), (6, 'ZONE 06'),
  (7, 'ZONE 07'), (8, 'ZONE 08'), (9, 'ZONE 09'),
  (10, 'ZONE 10'), (11, 'ZONE 11');

-- 3. questions 表
CREATE TABLE public.questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id     int NOT NULL REFERENCES public.zones(id),
  content     text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('ai', 'manual')),
  qr_code_url text,
  created_by  uuid NOT NULL REFERENCES public.users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_zone ON public.questions(zone_id);

-- 補上 zones 的 FK
ALTER TABLE public.zones
  ADD CONSTRAINT fk_zones_current_question
  FOREIGN KEY (current_question_id) REFERENCES public.questions(id)
  ON DELETE SET NULL;

-- 4. answers 表
CREATE TABLE public.answers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.users(id),
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_answers_updated_at
  BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. votes 表
CREATE TABLE public.votes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id   uuid NOT NULL REFERENCES public.users(id),
  target_id  uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(voter_id, target_id),
  CHECK(voter_id != target_id)
);

CREATE INDEX idx_votes_voter ON public.votes(voter_id);
CREATE INDEX idx_votes_target ON public.votes(target_id);

-- 投票上限 5 票
CREATE OR REPLACE FUNCTION check_vote_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.votes WHERE voter_id = NEW.voter_id) >= 5 THEN
    RAISE EXCEPTION '已達投票上限（5 票）';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vote_limit
  BEFORE INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION check_vote_limit();

-- 6. app_settings 表
CREATE TABLE public.app_settings (
  key   text PRIMARY KEY,
  value text NOT NULL
);

INSERT INTO public.app_settings (key, value) VALUES
  ('event_password', ''),
  ('force_offline', 'false');

-- ============================================================
-- 7. 自動建立用戶記錄（Auth 觸發器）
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  next_number int;
BEGIN
  SELECT COALESCE(MAX(player_number), 0) + 1 INTO next_number FROM public.users;

  INSERT INTO public.users (id, player_number, email, display_name)
  VALUES (
    NEW.id,
    next_number,
    NEW.email,
    split_part(NEW.email, '@', 1)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. RLS 策略
-- ============================================================

-- users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_select_all" ON public.votes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "votes_insert_own" ON public.votes FOR INSERT WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "votes_delete_own" ON public.votes FOR DELETE USING (auth.uid() = voter_id);

-- questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_select_all" ON public.questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "questions_insert_auth" ON public.questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "questions_update_owner" ON public.questions FOR UPDATE USING (
  auth.uid() = created_by
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "questions_delete_owner" ON public.questions FOR DELETE USING (
  auth.uid() = created_by
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- answers
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "answers_select_own" ON public.answers FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "answers_insert_own" ON public.answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "answers_update_own" ON public.answers FOR UPDATE USING (auth.uid() = user_id);

-- app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_select_all" ON public.app_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "settings_update_admin" ON public.app_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- zones
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "zones_select_all" ON public.zones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "zones_update_auth" ON public.zones FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- 9. Realtime 啟用
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.zones;
```

---

## 9. 常用查詢

### 取得在線人數
```sql
SELECT COUNT(*) AS online_count FROM users WHERE is_online = true;
```

### 取得投票排行榜
```sql
SELECT
  u.player_number,
  u.display_name,
  u.avatar_url,
  COUNT(v.id) AS vote_count
FROM users u
LEFT JOIN votes v ON v.target_id = u.id
GROUP BY u.id
ORDER BY vote_count DESC, u.player_number ASC;
```

### 取得某玩家的剩餘票數
```sql
SELECT 5 - COUNT(*) AS remaining_votes
FROM votes
WHERE voter_id = '{user_id}';
```

### 取得某區域的當前題目
```sql
SELECT q.*
FROM zones z
JOIN questions q ON q.id = z.current_question_id
WHERE z.id = {zone_id};
```

### 取得某玩家的所有作答紀錄
```sql
SELECT
  z.zone_name,
  q.content AS question_content,
  a.content AS answer_content,
  a.created_at
FROM answers a
JOIN questions q ON q.id = a.question_id
JOIN zones z ON z.id = q.zone_id
WHERE a.user_id = '{user_id}'
ORDER BY a.created_at DESC;
```

---

> **文件結束**
> 連接 Supabase 時，將第 8 節的 SQL 整段貼入 SQL Editor 執行即可完成建表。
