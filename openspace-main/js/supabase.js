/* ================================================================
   supabase.js — Supabase 客戶端初始化 & API 封裝
   ================================================================ */

const SUPABASE_URL = 'https://fenjfpimdaaolvwdgnpg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbmpmcGltZGFhb2x2d2RnbnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDI0MDIsImV4cCI6MjA4ODYxODQwMn0.IN7u0q9q_SpJopRkI0CckzZNGoG0OqBrvq3DEK3gxXk';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── Users API ── */
const UsersAPI = {
  /** 取得當前登入用戶的 profile */
  async getCurrentProfile() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) { console.error('getCurrentProfile:', error); return null; }
    return data;
  },

  /** 用 display_name 查詢玩家資料 */
  async getProfileByName(displayName) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('display_name', displayName)
      .limit(1)
      .maybeSingle();
    if (error) { console.error('getProfileByName:', error); return null; }
    return data;
  },

  /** 用 player_number 查詢玩家資料 */
  async getProfileByNumber(playerNumber) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('player_number', playerNumber)
      .limit(1)
      .maybeSingle();
    if (error) { console.error('getProfileByNumber:', error); return null; }
    return data;
  },

  /** 用 player_number 查詢公開玩家資料（不需登入） */
  async getPublicProfileByNumber(playerNumber) {
    const { data, error } = await supabaseClient
      .from('public_profiles')
      .select('*')
      .eq('player_number', playerNumber)
      .limit(1)
      .maybeSingle();
    if (error) { console.error('getPublicProfileByNumber:', error); return null; }
    return data;
  },

  /** 更新個人資料 */
  async updateProfile({ display_name, bio, links }) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('未登入');
    const updates = { display_name, bio };
    if (links !== undefined) updates.links = links;
    const { data, error } = await supabaseClient
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** 設定上線狀態 */
  async setOnlineStatus(isOnline) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    const { error } = await supabaseClient
      .from('users')
      .update({ is_online: isOnline })
      .eq('id', user.id);
    if (error) console.error('setOnlineStatus:', error);
  },

  /** 取得所有用戶（矩陣牆用，僅議會代表） */
  async getAllUsers() {
    const { data, error } = await supabaseClient
      .from('users')
      .select('id, player_number, display_name, avatar_url, is_online')
      .not('player_number', 'is', null)
      .order('player_number', { ascending: true });
    if (error) { console.error('getAllUsers:', error); return []; }
    return data;
  },

  /** 標記升級通知已讀 */
  async markPromotionSeen() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    const { error } = await supabaseClient
      .from('users')
      .update({ promotion_seen: true })
      .eq('id', user.id);
    if (error) console.error('markPromotionSeen:', error);
  }
};

/* ── Avatar API ── */
const AvatarAPI = {
  /** 上傳頭像至 Storage，回傳公開 URL */
  async upload(file) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('未登入');

    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    // 上傳（upsert 覆蓋舊檔）
    const { error: uploadErr } = await supabaseClient.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadErr) throw uploadErr;

    // 取得公開 URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(path);

    // 加上 cache-busting 參數
    const url = publicUrl + '?t=' + Date.now();

    // 寫入 users 表
    const { error: updateErr } = await supabaseClient
      .from('users')
      .update({ avatar_url: url })
      .eq('id', user.id);
    if (updateErr) throw updateErr;

    return url;
  }
};

/* ── AppSettings API ── */
const AppSettingsAPI = {
  /** 取得活動密碼 */
  async getEventPassword() {
    const { data, error } = await supabaseClient
      .from('app_settings')
      .select('value')
      .eq('key', 'event_password')
      .single();
    if (error) { console.error('getEventPassword:', error); return ''; }
    return data.value;
  },

  /** 檢查是否需要活動密碼 */
  async isEventPasswordRequired() {
    const { data, error } = await supabaseClient
      .from('app_settings')
      .select('value')
      .eq('key', 'require_event_password')
      .single();
    if (error) { console.error('isEventPasswordRequired:', error); return false; }
    return data.value === 'true';
  },

  /** 更新活動密碼（管理員用） */
  async updateEventPassword(newPassword) {
    const { error } = await supabaseClient
      .from('app_settings')
      .update({ value: newPassword })
      .eq('key', 'event_password');
    if (error) throw error;
  }
};

/* ── Admin API ── */
const AdminAPI = {
  /** 全體離線：將所有在線用戶設為離線 */
  async setAllOffline() {
    const { data, error } = await supabaseClient
      .from('users')
      .update({ is_online: false })
      .eq('is_online', true)
      .select('id');
    if (error) throw error;
    return data ? data.length : 0;
  },

  /** 取得所有成員（管理員成員頁用） */
  async getAllMembers() {
    const { data, error } = await supabaseClient
      .from('users')
      .select('id, player_number, email, display_name, avatar_url, delegate_status, role, is_online, created_at')
      .order('created_at', { ascending: true });
    if (error) { console.error('getAllMembers:', error); return []; }
    return data;
  },

  /** 升級為議會代表 */
  async promoteToParliament(userId) {
    const { data, error } = await supabaseClient.rpc('promote_to_parliament', {
      target_user_id: userId
    });
    if (error) throw error;
    return data;
  },

  /** 降級為備選代表 */
  async demoteToAlternate(userId) {
    const { data, error } = await supabaseClient.rpc('demote_to_alternate', {
      target_user_id: userId
    });
    if (error) throw error;
    return data;
  }
};

/* ── AI Question API ── */
const AIQuestionAPI = {
  /** 呼叫 Edge Function 生成 AI 題目 */
  async generateQuestion(keyword, zoneName) {
    // 確保已登入且 session 有效
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) throw new Error('未登入，請重新登入後再試');

    const { data, error } = await supabaseClient.functions.invoke('generate-question', {
      body: { keyword, zone_name: zoneName }
    });
    if (error) throw error;
    return data;
  }
};

/* ── Votes API ── */
const VotesAPI = {
  /** 取得當前用戶已投出的所有票（含被投人資訊） */
  async getMyVotes() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabaseClient
      .from('votes')
      .select('id, target_id, created_at')
      .eq('voter_id', user.id)
      .order('created_at', { ascending: true });
    if (error) { console.error('getMyVotes:', error); return []; }
    if (data.length === 0) return [];

    // 取得被投人資料
    const targetIds = data.map(v => v.target_id);
    const { data: users, error: uErr } = await supabaseClient
      .from('users')
      .select('id, player_number, display_name, avatar_url')
      .in('id', targetIds);
    if (uErr) { console.error('getMyVotes users:', uErr); return data; }

    const userMap = {};
    users.forEach(u => userMap[u.id] = u);
    return data.map(v => ({ ...v, users: userMap[v.target_id] || null }));
  },

  /** 投票給某玩家 */
  async castVote(targetId) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('未登入');
    const { data, error } = await supabaseClient
      .from('votes')
      .insert({ voter_id: user.id, target_id: targetId })
      .select('id, target_id, created_at')
      .single();
    if (error) throw error;

    // 取得被投人資料
    const { data: target } = await supabaseClient
      .from('users')
      .select('id, player_number, display_name, avatar_url')
      .eq('id', targetId)
      .single();

    return { ...data, users: target || null };
  },

  /** 取消投票 */
  async cancelVote(voteId) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('未登入');
    const { error } = await supabaseClient
      .from('votes')
      .delete()
      .eq('id', voteId)
      .eq('voter_id', user.id);
    if (error) throw error;
  },

  /** 取得投票排行榜（聚合得票數，僅議會代表） */
  async getLeaderboard() {
    const { data, error } = await supabaseClient
      .from('users')
      .select('id, player_number, display_name, avatar_url')
      .eq('delegate_status', 'parliament');
    if (error) { console.error('getLeaderboard users:', error); return []; }

    const { data: votes, error: vErr } = await supabaseClient
      .from('votes')
      .select('target_id');
    if (vErr) { console.error('getLeaderboard votes:', vErr); return []; }

    // 統計每人得票數
    const countMap = {};
    votes.forEach(v => {
      countMap[v.target_id] = (countMap[v.target_id] || 0) + 1;
    });

    // 只回傳有得票的玩家，排序
    return data
      .map(u => ({ ...u, vote_count: countMap[u.id] || 0 }))
      .filter(u => u.vote_count > 0)
      .sort((a, b) => b.vote_count - a.vote_count);
  },

  /** 搜尋玩家（投票時用，僅議會代表） */
  async searchPlayers(query) {
    let q = supabaseClient
      .from('users')
      .select('id, player_number, display_name, avatar_url')
      .eq('delegate_status', 'parliament')
      .order('player_number', { ascending: true });

    // 若是數字，搜尋編號
    const num = parseInt(query, 10);
    if (!isNaN(num)) {
      q = q.eq('player_number', num);
    } else {
      q = q.ilike('display_name', `%${query}%`);
    }

    const { data, error } = await q.limit(20);
    if (error) { console.error('searchPlayers:', error); return []; }
    return data;
  }
};

/* ── Zones API ── */
const ZonesAPI = {
  /** 取得所有區域（含當前題目） */
  async getAllZones() {
    const { data, error } = await supabaseClient
      .from('zones')
      .select(`
        id,
        zone_name,
        current_question_id,
        is_locked,
        questions:current_question_id (
          id, content, source_type, created_by, created_at
        )
      `)
      .order('id', { ascending: true });
    if (error) { console.error('getAllZones:', error); return []; }
    return data;
  },

  /** 取得單一區域 */
  async getZone(zoneId) {
    const { data, error } = await supabaseClient
      .from('zones')
      .select(`
        id,
        zone_name,
        current_question_id,
        is_locked,
        questions:current_question_id (
          id, content, source_type, created_by, created_at
        )
      `)
      .eq('id', zoneId)
      .single();
    if (error) { console.error('getZone:', error); return null; }
    return data;
  },

  /** 設定當前題目 */
  async setCurrentQuestion(zoneId, questionId) {
    const { error } = await supabaseClient
      .from('zones')
      .update({ current_question_id: questionId })
      .eq('id', zoneId);
    if (error) throw error;
  },

  /** 鎖定區域 */
  async lockZone(zoneId) {
    const { error } = await supabaseClient
      .from('zones')
      .update({ is_locked: true })
      .eq('id', zoneId);
    if (error) throw error;
  },

  /** 解鎖區域 */
  async unlockZone(zoneId) {
    const { error } = await supabaseClient
      .from('zones')
      .update({ is_locked: false })
      .eq('id', zoneId);
    if (error) throw error;
  }
};

/* ── Questions API ── */
const QuestionsAPI = {
  /** 建立題目 */
  async createQuestion(zoneId, content, sourceType) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('未登入');
    const { data, error } = await supabaseClient
      .from('questions')
      .insert({
        zone_id: zoneId,
        content: content,
        source_type: sourceType || 'manual',
        created_by: user.id
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** 取得某區域所有題目 */
  async getQuestionsByZone(zoneId) {
    const { data, error } = await supabaseClient
      .from('questions')
      .select('id, zone_id, content, source_type, created_by, created_at')
      .eq('zone_id', zoneId)
      .order('created_at', { ascending: false });
    if (error) { console.error('getQuestionsByZone:', error); return []; }
    return data;
  },

  /** 取得單一題目 */
  async getQuestion(questionId) {
    const { data, error } = await supabaseClient
      .from('questions')
      .select(`
        id, zone_id, content, source_type, created_by, created_at,
        zones!questions_zone_id_fkey ( id, zone_name, is_locked )
      `)
      .eq('id', questionId)
      .single();
    if (error) { console.error('getQuestion:', error); return null; }
    return data;
  },

  /** 刪除題目 */
  async deleteQuestion(questionId) {
    const { error } = await supabaseClient
      .from('questions')
      .delete()
      .eq('id', questionId);
    if (error) throw error;
  }
};

/* ── Answers API ── */
const AnswersAPI = {
  /** 取得當前用戶的所有作答紀錄（含題目和區域資訊） */
  async getMyAnswers() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabaseClient
      .from('answers')
      .select(`
        id,
        question_id,
        content,
        created_at,
        updated_at,
        questions (
          id,
          content,
          zones!questions_zone_id_fkey ( zone_name )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { console.error('getMyAnswers:', error); return []; }
    return data;
  },

  /** 提交答案（UPSERT：每人每題一筆） */
  async submitAnswer(questionId, content) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('未登入');
    const { data, error } = await supabaseClient
      .from('answers')
      .upsert({
        question_id: questionId,
        user_id: user.id,
        content: content,
        updated_at: new Date().toISOString()
      }, { onConflict: 'question_id,user_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** 取得當前用戶對某題的答案 */
  async getMyAnswer(questionId) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabaseClient
      .from('answers')
      .select('id, content, created_at, updated_at')
      .eq('question_id', questionId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) { console.error('getMyAnswer:', error); return null; }
    return data;
  }
};
