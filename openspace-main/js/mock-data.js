/* ================================================================
   mock-data.js — 假資料（UI 開發用，替代 Supabase）
   ================================================================ */

const MOCK_USER = {
  id: 'mock-uuid-001',
  player_number: 23,
  email: 'player23@doomsday.parliament',
  display_name: '末日倖存者',
  bio: '在這個崩壞的世界中，我選擇相信人類最後的議會。每一次投票都是對未來的宣言。',
  avatar_url: 'https://api.dicebear.com/7.x/cyberpunk/svg?seed=player23&backgroundColor=1a0005',
  is_online: true,
  role: 'user',
  created_at: '2026-03-20T10:30:00Z'
};

const MOCK_ANSWERS = [
  {
    id: 'ans-001',
    zone_name: 'ZONE 03 — 能源危機',
    question_content: '如果你只能保留一種能源來源，你會選擇什麼？為什麼？',
    content: '太陽能。因為即使在末日之後，太陽依然會升起。',
    created_at: '2026-03-28T19:45:00Z'
  },
  {
    id: 'ans-002',
    zone_name: 'ZONE 07 — 人類存亡',
    question_content: '你認為人類最大的威脅是什麼？',
    content: '不是外在的災難，而是我們對彼此的冷漠。',
    created_at: '2026-03-28T20:12:00Z'
  },
  {
    id: 'ans-003',
    zone_name: 'ZONE 11 — 最終審判',
    question_content: '如果AI末日議會只能通過一項決議，你會提案什麼？',
    content: '所有資源共享，不分階級、不分區域。',
    created_at: '2026-03-28T21:30:00Z'
  }
];
