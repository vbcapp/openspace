/* ================================================================
   auth.js — 認證邏輯（登入 / 註冊 / Session 檢查）
   ================================================================ */

const Auth = {
  /** 註冊新用戶 */
  async signUp(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  /** Email + 密碼登入 */
  async signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /** 登出 */
  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  /** 取得當前 session（不觸發網路請求） */
  async getSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  },

  /** Google OAuth 登入 */
  async signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login.html'
      }
    });
    if (error) throw error;
    return data;
  },

  /** 監聽 auth 狀態變更 */
  onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }
};
