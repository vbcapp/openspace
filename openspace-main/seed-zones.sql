-- ============================================================
-- AI末日議會 — 七宗罪 Zone 更新 + 題目內容清理
-- 在 Supabase SQL Editor 執行
-- ============================================================

-- 1. 更新 zone 名稱為七宗罪
UPDATE public.zones SET zone_name = 'PRIDE // 驕傲之塔' WHERE id = 1;
UPDATE public.zones SET zone_name = 'GREED // 全知之貪' WHERE id = 2;
UPDATE public.zones SET zone_name = 'LUST // 色慾之鏡' WHERE id = 3;
UPDATE public.zones SET zone_name = 'GLUTTONY // 暴食之腦' WHERE id = 4;
UPDATE public.zones SET zone_name = 'SLOTH // 存在之墓' WHERE id = 5;
UPDATE public.zones SET zone_name = 'WRATH // 全知之怒' WHERE id = 6;
UPDATE public.zones SET zone_name = 'ENVY // 完美之妒' WHERE id = 7;
UPDATE public.zones SET zone_name = 'CROSS-ZONE // 跨區極限' WHERE id = 8;
UPDATE public.zones SET zone_name = 'RESERVE // 備用區 09' WHERE id = 9;
UPDATE public.zones SET zone_name = 'RESERVE // 備用區 10' WHERE id = 10;
UPDATE public.zones SET zone_name = 'RESERVE // 備用區 11' WHERE id = 11;

-- 2. 清理題目內容：inline style → class-based span
--    將 <span style="background:#FF3F00;color:#000..."> 替換為 <span class="invert-hl">
UPDATE public.questions
SET content = REGEXP_REPLACE(
  content,
  '<span\s+style="[^"]*background[^"]*">',
  '<span class="invert-hl">',
  'gi'
)
WHERE content LIKE '%<span style="background%';

-- 3. 也處理可能的 class='invert-hl' 單引號格式 → 統一雙引號
UPDATE public.questions
SET content = REPLACE(content, 'class=''invert-hl''', 'class="invert-hl"')
WHERE content LIKE '%class=''invert-hl''%';

-- 驗證結果
SELECT id, zone_id,
  SUBSTRING(content, 1, 80) as preview,
  CASE WHEN content LIKE '%invert-hl%' THEN 'has-highlight' ELSE 'plain' END as format
FROM public.questions
WHERE created_at >= '2026-03-18'
ORDER BY zone_id, created_at
LIMIT 20;
