// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 食材データベース
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 【出典・根拠】
//   農林水産省「家庭での食品保存の目安」(令和5年3月改訂)
//   消費者庁「食品の期限表示について」(令和5年3月)
//   農林水産省「食品ロス削減に向けた取組」(令和6年度版)
//   各メーカー公式サイト（キッコーマン・キューピー・カゴメ・タカラ・マルコメ等）
//   https://www.maff.go.jp/j/syokuiku/mottainai/
//
// 【expiryDays の解釈】
//   生鮮食品（野菜・肉・魚） → 冷蔵保存での目安日数
//   調味料・加工品          → 開封後・冷蔵保存での目安日数
//   常温長期保存品（いも類・玉ねぎ等）→ 常温冷暗所保存での目安日数
//   null                   → 実質的に期限管理不要（乾物・缶詰・塩糖等）
//
// ※ 家庭の温度・湿度・開封状況により変動します。
// ※ 記載の値はあくまで目安であり、臭い・見た目での確認を優先してください。
//
// 【refAmount / refUnit】
//   1単位あたりの目安量（例: 1個=150g）。g・ml換算に使用。
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const INGREDIENTS_DB = [

  // ── 野菜・きのこ ────────────────────────────────────
  // 葉物・やわらかい野菜は2-5日（農水省目安）。水分が多く傷みやすい。
  // 根菜類は冷蔵2-4週間。いも類・玉ねぎは常温冷暗所が適切（冷蔵不向き）。
  { name: 'もやし',           category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 2,  refAmount: 200,  refUnit: 'g' }, // 農水省：非常に傷みやすく購入後2日以内
  { name: '豆苗',             category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 3,  refAmount: 100,  refUnit: 'g' },
  { name: 'ほうれん草',       category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 4,  refAmount: 200,  refUnit: 'g' },
  { name: '小松菜',           category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 4,  refAmount: 200,  refUnit: 'g' },
  { name: '春菊',             category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 3,  refAmount: 150,  refUnit: 'g' },
  { name: '水菜',             category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 4,  refAmount: 200,  refUnit: 'g' },
  { name: 'チンゲン菜',       category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 4,  refAmount: 200,  refUnit: 'g' },
  { name: 'ニラ',             category: '野菜・きのこ', totalUnit: '束',  expiryDays: 4,  refAmount: 100,  refUnit: 'g' },
  { name: 'アスパラガス',     category: '野菜・きのこ', totalUnit: '束',  expiryDays: 4,  refAmount: 100,  refUnit: 'g' },
  { name: 'スナップエンドウ', category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 4,  refAmount: 100,  refUnit: 'g' },
  { name: '絹さや',           category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 4,  refAmount: 100,  refUnit: 'g' },
  { name: 'とうもろこし',     category: '野菜・きのこ', totalUnit: '本',  expiryDays: 2,  refAmount: 200,  refUnit: 'g' }, // 収穫後急速に糖分が落ちる。農水省：当日〜2日
  { name: 'オクラ',           category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 4,  refAmount: 100,  refUnit: 'g' },
  { name: 'レタス',           category: '野菜・きのこ', totalUnit: '個',  expiryDays: 5,  refAmount: 300,  refUnit: 'g' },
  { name: 'サニーレタス',     category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 4,  refAmount: 150,  refUnit: 'g' },
  { name: 'キャベツ',         category: '野菜・きのこ', totalUnit: '個',  expiryDays: 14, refAmount: 1000, refUnit: 'g' }, // 丸ごとなら冷蔵2週間
  { name: '白菜',             category: '野菜・きのこ', totalUnit: '個',  expiryDays: 14, refAmount: 2000, refUnit: 'g' }, // 丸ごとなら冷蔵2週間
  { name: 'ブロッコリー',     category: '野菜・きのこ', totalUnit: '個',  expiryDays: 5,  refAmount: 250,  refUnit: 'g' },
  { name: 'カリフラワー',     category: '野菜・きのこ', totalUnit: '個',  expiryDays: 7,  refAmount: 500,  refUnit: 'g' },
  { name: 'ズッキーニ',       category: '野菜・きのこ', totalUnit: '本',  expiryDays: 5,  refAmount: 200,  refUnit: 'g' },
  { name: 'セロリ',           category: '野菜・きのこ', totalUnit: '本',  expiryDays: 7,  refAmount: 100,  refUnit: 'g' },
  { name: 'きゅうり',         category: '野菜・きのこ', totalUnit: '本',  expiryDays: 5,  refAmount: 100,  refUnit: 'g' },
  { name: 'トマト',           category: '野菜・きのこ', totalUnit: '個',  expiryDays: 7,  refAmount: 150,  refUnit: 'g' }, // 完熟は3-4日、未完熟なら1週間
  { name: 'ミニトマト',       category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 7,  refAmount: 200,  refUnit: 'g' },
  { name: 'パプリカ',         category: '野菜・きのこ', totalUnit: '個',  expiryDays: 7,  refAmount: 150,  refUnit: 'g' },
  { name: 'ピーマン',         category: '野菜・きのこ', totalUnit: '個',  expiryDays: 7,  refAmount: 35,   refUnit: 'g' },
  { name: 'なす',             category: '野菜・きのこ', totalUnit: '個',  expiryDays: 5,  refAmount: 80,   refUnit: 'g' },
  { name: 'にんじん',         category: '野菜・きのこ', totalUnit: '本',  expiryDays: 21, refAmount: 150,  refUnit: 'g', quickAmounts: [2, 3, 4, 5] }, // 冷蔵3週間（農水省）
  { name: '大根',             category: '野菜・きのこ', totalUnit: '本',  expiryDays: 14, refAmount: 1000, refUnit: 'g' },
  { name: 'ごぼう',           category: '野菜・きのこ', totalUnit: '本',  expiryDays: 7,  refAmount: 180,  refUnit: 'g' }, // 洗いごぼう冷蔵5-7日
  { name: 'れんこん',         category: '野菜・きのこ', totalUnit: '節',  expiryDays: 5,  refAmount: 150,  refUnit: 'g' },
  { name: '長いも',           category: '野菜・きのこ', totalUnit: '本',  expiryDays: 14, refAmount: 500,  refUnit: 'g' },
  { name: '里芋',             category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 14, refAmount: 300,  refUnit: 'g' },
  // 【常温長期保存野菜】冷蔵保存は向かない。常温冷暗所（15℃以下）での目安。
  { name: 'じゃがいも',       category: '野菜・きのこ', totalUnit: '個',  expiryDays: 30, refAmount: 150,  refUnit: 'g', quickAmounts: [2, 3, 4, 5, 6] }, // 常温冷暗所1ヶ月（農水省）。冷蔵は低温障害の原因になる
  { name: '玉ねぎ',           category: '野菜・きのこ', totalUnit: '個',  expiryDays: 60, refAmount: 200,  refUnit: 'g', quickAmounts: [2, 3, 4, 5, 6] }, // 常温風通しの良い場所で2ヶ月（農水省）
  { name: 'かぼちゃ',         category: '野菜・きのこ', totalUnit: '個',  expiryDays: 90, refAmount: 1200, refUnit: 'g', quickAmounts: [1] }, // 丸ごとなら常温冷暗所2-3ヶ月（農水省）。カット後は冷蔵4-5日
  { name: 'さつまいも',       category: '野菜・きのこ', totalUnit: '個',  expiryDays: 30, refAmount: 250,  refUnit: 'g', quickAmounts: [1, 2, 3] }, // 常温冷暗所1ヶ月。冷蔵は低温障害の原因になる
  { name: 'にんにく',         category: '野菜・きのこ', totalUnit: '個',  expiryDays: 30, refAmount: 50,   refUnit: 'g', quickAmounts: [1, 2] }, // 常温乾燥場所で1ヶ月。冷蔵も可（芽が出やすいが2週間程度）
  { name: '生姜',             category: '野菜・きのこ', totalUnit: '個',  expiryDays: 21, refAmount: 50,   refUnit: 'g', quickAmounts: [1, 2] }, // 冷蔵2-3週間（農水省）
  { name: 'ねぎ',             category: '野菜・きのこ', totalUnit: '本',  expiryDays: 7,  refAmount: 100,  refUnit: 'g', quickAmounts: [1, 2, 3] },
  { name: '小ねぎ',           category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 5,  refAmount: 50,   refUnit: 'g' },
  // きのこ類：冷蔵5-7日（農水省）。風通し良くポリ袋に入れて保存
  { name: 'えのき',           category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 5,  refAmount: 100,  refUnit: 'g' },
  { name: 'しいたけ',         category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 5,  refAmount: 100,  refUnit: 'g' },
  { name: 'まいたけ',         category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 5,  refAmount: 100,  refUnit: 'g' },
  { name: 'しめじ',           category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 5,  refAmount: 100,  refUnit: 'g' },
  { name: 'エリンギ',         category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 7,  refAmount: 100,  refUnit: 'g' }, // 他のきのこより水分少なく日持ちする
  { name: 'なめこ',           category: '野菜・きのこ', totalUnit: '袋',  expiryDays: 4,  refAmount: 100,  refUnit: 'g' },

  // ── 豆腐・大豆製品 ──────────────────────────────────
  // 開封後（または購入後）の冷蔵保存目安。パックのまま水を替えて保存。
  { name: '豆腐',       category: '豆腐・大豆', totalUnit: '丁',    expiryDays: 3,  refAmount: 350, refUnit: 'g', quickAmounts: [1, 2, 3] }, // 開封後は当日〜翌日が理想。未開封は記載の消費期限まで
  { name: '納豆',       category: '豆腐・大豆', totalUnit: 'パック', expiryDays: 5,  refAmount: 45,  refUnit: 'g', quickAmounts: [3, 4] }, // 購入後冷蔵5日（製品記載の消費期限が目安）
  { name: '油揚げ',     category: '豆腐・大豆', totalUnit: '枚',    expiryDays: 5,  refAmount: 30,  refUnit: 'g' },
  { name: '厚揚げ',     category: '豆腐・大豆', totalUnit: '個',    expiryDays: 3,  refAmount: 150, refUnit: 'g' },
  { name: '豆乳',       category: '豆腐・大豆', totalUnit: 'ml',    expiryDays: 5, quickAmounts: [200, 500, 1000] }, // 開封後3-5日（メーカー推奨）
  { name: 'おから',     category: '豆腐・大豆', totalUnit: 'g',     expiryDays: 3 }, // 生おから・傷みやすい
  { name: '枝豆',       category: '豆腐・大豆', totalUnit: 'g',     expiryDays: 3 }, // 生の場合。冷凍品は冷凍カテゴリへ

  // ── 肉 ──────────────────────────────────────────────
  // 農水省「食肉の保存について」: 生肉は冷蔵で2日以内を推奨。
  // 挽き肉は表面積が大きく傷みやすいため、スライスや塊より早め。
  { name: '鶏むね肉',     category: '肉', totalUnit: '枚', expiryDays: 2,  refAmount: 250, refUnit: 'g', quickAmounts: [1, 2, 3] },
  { name: '鶏もも肉',     category: '肉', totalUnit: '枚', expiryDays: 2,  refAmount: 300, refUnit: 'g', quickAmounts: [1, 2, 3] },
  { name: '鶏ささみ',     category: '肉', totalUnit: '本', expiryDays: 2,  refAmount: 60,  refUnit: 'g', quickAmounts: [3, 4, 5, 6] },
  { name: '鶏ひき肉',     category: '肉', totalUnit: 'g',  expiryDays: 1,  quickAmounts: [150, 200, 250, 300] }, // 挽き肉は傷みやすく当日〜翌日（農水省）
  { name: '鶏手羽元',     category: '肉', totalUnit: '本', expiryDays: 2,  refAmount: 60,  refUnit: 'g', quickAmounts: [4, 5, 6, 8] },
  { name: '鶏手羽先',     category: '肉', totalUnit: '本', expiryDays: 2,  refAmount: 50,  refUnit: 'g', quickAmounts: [4, 5, 6, 8] },
  { name: '豚バラ肉',     category: '肉', totalUnit: 'g',  expiryDays: 2,  quickAmounts: [150, 200, 250, 300] },
  { name: '豚ロース',     category: '肉', totalUnit: 'g',  expiryDays: 2,  quickAmounts: [100, 150, 200, 300] },
  { name: '豚肩ロース',   category: '肉', totalUnit: 'g',  expiryDays: 2,  quickAmounts: [150, 200, 250, 300] },
  { name: '豚こま切れ',   category: '肉', totalUnit: 'g',  expiryDays: 2,  quickAmounts: [150, 200, 250, 300] },
  { name: '豚ひき肉',     category: '肉', totalUnit: 'g',  expiryDays: 1,  quickAmounts: [150, 200, 250, 300] }, // 挽き肉は当日〜翌日
  { name: '合いびき肉',   category: '肉', totalUnit: 'g',  expiryDays: 1,  quickAmounts: [150, 200, 250, 300] }, // 挽き肉は当日〜翌日
  { name: '牛バラ肉',     category: '肉', totalUnit: 'g',  expiryDays: 2,  quickAmounts: [150, 200, 250, 300] },
  { name: '牛切り落とし', category: '肉', totalUnit: 'g',  expiryDays: 2,  quickAmounts: [150, 200, 250, 300] },
  { name: '牛ひき肉',     category: '肉', totalUnit: 'g',  expiryDays: 1,  quickAmounts: [150, 200, 250, 300] }, // 挽き肉は当日〜翌日
  { name: '牛サーロイン', category: '肉', totalUnit: '枚', expiryDays: 2,  refAmount: 200, refUnit: 'g', quickAmounts: [1, 2, 3] },
  // 加工肉：塩漬け・燻製処理で日持ちが延びる（食品添加物による保存効果）
  { name: 'ベーコン',     category: '肉', totalUnit: 'g',  expiryDays: 7,  refAmount: 20,  refUnit: 'g', quickAmounts: [100, 150, 200] }, // 開封後1週間（各メーカー）
  { name: 'ウインナー',   category: '肉', totalUnit: '本', expiryDays: 7,  refAmount: 20,  refUnit: 'g', quickAmounts: [5, 6, 7, 8] }, // 開封後1週間（各メーカー）
  { name: 'ハム',         category: '肉', totalUnit: '枚', expiryDays: 5,  refAmount: 20,  refUnit: 'g', quickAmounts: [4, 5, 6, 7, 8] }, // 開封後5日（各メーカー）
  { name: 'サラミ',       category: '肉', totalUnit: '枚', expiryDays: 14, refAmount: 10,  refUnit: 'g', quickAmounts: [5, 8, 10, 15] }, // 乾燥発酵品。開封後2週間（各メーカー）

  // ── 魚介 ────────────────────────────────────────────
  // 農水省「水産物の取り扱い」: 生食用は当日使用が原則。加熱用は2日以内。
  // 刺身用：1日（購入当日使用推奨。翌日はリスクあり）
  { name: 'マグロ（刺身用）',   category: '魚介', totalUnit: 'g',    expiryDays: 1 },
  { name: 'サーモン（刺身用）', category: '魚介', totalUnit: 'g',    expiryDays: 1 },
  { name: 'ブリ（刺身用）',     category: '魚介', totalUnit: 'g',    expiryDays: 1 },
  { name: 'タイ（刺身用）',     category: '魚介', totalUnit: 'g',    expiryDays: 1 },
  { name: 'アジ（刺身用）',     category: '魚介', totalUnit: '尾',   expiryDays: 1,  refAmount: 150, refUnit: 'g' },
  { name: 'ホタテ（刺身用）',   category: '魚介', totalUnit: 'g',    expiryDays: 1 },
  { name: 'イカ（刺身用）',     category: '魚介', totalUnit: '杯',   expiryDays: 1,  refAmount: 200, refUnit: 'g' },
  { name: 'イワシ（刺身用）',   category: '魚介', totalUnit: '尾',   expiryDays: 1,  refAmount: 80,  refUnit: 'g' }, // 背青魚は特に傷みやすい
  { name: 'イクラ',             category: '魚介', totalUnit: 'g',    expiryDays: 3 }, // 開封後3日以内（各メーカー）
  // 加熱用：2日（農水省目安）
  { name: '鮭（加熱用）',       category: '魚介', totalUnit: '切れ', expiryDays: 2,  refAmount: 80,  refUnit: 'g', quickAmounts: [2, 3, 4] },
  { name: 'サバ（加熱用）',     category: '魚介', totalUnit: '切れ', expiryDays: 2,  refAmount: 100, refUnit: 'g', quickAmounts: [2, 3, 4] },
  { name: 'アジ（加熱用）',     category: '魚介', totalUnit: '尾',   expiryDays: 2,  refAmount: 150, refUnit: 'g' },
  { name: 'サーモン（加熱用）', category: '魚介', totalUnit: 'g',    expiryDays: 2 },
  { name: 'ブリ（加熱用）',     category: '魚介', totalUnit: '切れ', expiryDays: 2,  refAmount: 100, refUnit: 'g' },
  { name: 'タラ',               category: '魚介', totalUnit: '切れ', expiryDays: 2,  refAmount: 80,  refUnit: 'g' },
  { name: 'サンマ',             category: '魚介', totalUnit: '尾',   expiryDays: 2,  refAmount: 150, refUnit: 'g' },
  { name: 'イワシ（加熱用）',   category: '魚介', totalUnit: '尾',   expiryDays: 2,  refAmount: 80,  refUnit: 'g' },
  { name: 'エビ',               category: '魚介', totalUnit: 'g',    expiryDays: 2 },
  { name: 'タコ',               category: '魚介', totalUnit: 'g',    expiryDays: 2 },
  { name: 'アサリ',             category: '魚介', totalUnit: 'g',    expiryDays: 2 }, // 砂抜き後冷蔵2日
  { name: 'シジミ',             category: '魚介', totalUnit: 'g',    expiryDays: 2 },
  { name: 'カキ',               category: '魚介', totalUnit: 'g',    expiryDays: 2 }, // 生食用・加熱用ともに購入後2日以内（消費者庁）
  { name: 'ホタテ（加熱用）',   category: '魚介', totalUnit: 'g',    expiryDays: 2 },
  { name: 'カニ',               category: '魚介', totalUnit: 'g',    expiryDays: 2 },
  // 加工品（練り物）：開封後の目安
  { name: 'ちくわ',             category: '魚介', totalUnit: '本',   expiryDays: 7,  refAmount: 30,  refUnit: 'g' }, // 開封後1週間（各メーカー）
  { name: 'かまぼこ',           category: '魚介', totalUnit: '本',   expiryDays: 5,  refAmount: 100, refUnit: 'g' }, // 開封後5日（各メーカー）
  // 缶詰：未開封は賞味期限まで数年。在庫管理用のためnull（期限表示不要）
  { name: 'ツナ缶',             category: '魚介', totalUnit: '缶',   expiryDays: null, refAmount: 70,  refUnit: 'g', quickAmounts: [1, 2, 3] },
  { name: 'サバ缶',             category: '魚介', totalUnit: '缶',   expiryDays: null, refAmount: 190, refUnit: 'g', quickAmounts: [1, 2, 3] },
  { name: 'イワシ缶',           category: '魚介', totalUnit: '缶',   expiryDays: null, refAmount: 190, refUnit: 'g', quickAmounts: [1, 2, 3] },
  { name: 'たらこ',             category: '魚介', totalUnit: '本',   expiryDays: 3,    refAmount: 50,  refUnit: 'g' }, // 開封後3日以内

  // ── 卵・乳製品 ──────────────────────────────────────
  { name: '卵',               category: '卵・乳製品', totalUnit: '個', expiryDays: 14, refAmount: 60,  refUnit: 'g', quickAmounts: [6, 8, 10] },
  // 農水省ガイドライン：冷蔵生食期限は夏16日・春秋25日・冬57日（産卵日から）。
  // 市販パックの消費期限は通常14日前後（冷蔵・生食用として設定）。加熱なら+2週間可。
  { name: '牛乳',             category: '卵・乳製品', totalUnit: 'ml', expiryDays: 3,  quickAmounts: [500, 1000] }, // 開封後2-3日（各メーカー推奨）
  { name: 'バター',           category: '卵・乳製品', totalUnit: 'g',  expiryDays: 30, quickAmounts: [100, 150, 200] }, // 開封後1ヶ月（各メーカー）
  { name: '生クリーム',       category: '卵・乳製品', totalUnit: 'ml', expiryDays: 5,  quickAmounts: [200] }, // 開封後2-5日以内に使用
  { name: 'ヨーグルト',       category: '卵・乳製品', totalUnit: 'g',  expiryDays: 7,  quickAmounts: [400, 450, 900] }, // 開封後1週間（各メーカー）
  { name: 'スライスチーズ',   category: '卵・乳製品', totalUnit: '枚', expiryDays: 14, refAmount: 18, refUnit: 'g', quickAmounts: [6, 7, 8, 10] }, // 開封後2週間（各メーカー）
  { name: 'クリームチーズ',   category: '卵・乳製品', totalUnit: 'g',  expiryDays: 14 }, // 開封後2週間（各メーカー）
  { name: 'モッツァレラ',     category: '卵・乳製品', totalUnit: 'g',  expiryDays: 5 },  // 開封後早めに。ブライン液に浸して5日
  { name: 'パルメザンチーズ', category: '卵・乳製品', totalUnit: 'g',  expiryDays: 30 }, // 粉チーズ。開封後1ヶ月冷蔵（各メーカー）

  // ── 調味料 ──────────────────────────────────────────
  // 以下はすべて「開封後・冷蔵保存」での目安日数。
  // 未開封は賞味期限まで保持可能。砂糖・塩は実質無期限（nullのまま）。
  { name: '醤油',             category: '調味料', totalUnit: 'ml', expiryDays: 30,  quickAmounts: [500, 1000] }, // キッコーマン公式：開封後1ヶ月以内（冷蔵）
  { name: 'みりん',           category: '調味料', totalUnit: 'ml', expiryDays: 90,  quickAmounts: [400, 500, 1000] }, // タカラ公式：本みりん開封後3ヶ月（冷蔵）
  { name: '料理酒',           category: '調味料', totalUnit: 'ml', expiryDays: 90,  quickAmounts: [400, 500, 1000] }, // タカラ公式：開封後3ヶ月（冷蔵）
  { name: '酢',               category: '調味料', totalUnit: 'ml', expiryDays: 180, quickAmounts: [500, 1000] }, // ミツカン：強酸性で変質しにくい。開封後6ヶ月（冷蔵）
  { name: 'ごま油',           category: '調味料', totalUnit: 'ml', expiryDays: 90,  quickAmounts: [130, 150, 250] }, // 竹本油脂等：開封後3ヶ月（冷蔵）
  { name: 'オリーブオイル',   category: '調味料', totalUnit: 'ml', expiryDays: 90,  quickAmounts: [200, 400, 500] }, // 各社：開封後3ヶ月（冷暗所）
  { name: 'サラダ油',         category: '調味料', totalUnit: 'ml', expiryDays: 60,  quickAmounts: [400, 600, 900] }, // 日清・ニッシン等：開封後2ヶ月（冷暗所）
  { name: 'マヨネーズ',       category: '調味料', totalUnit: 'g',  expiryDays: 60,  quickAmounts: [200, 300, 400] }, // キューピー公式：開封後2ヶ月（冷蔵）
  { name: 'ケチャップ',       category: '調味料', totalUnit: 'g',  expiryDays: 30,  quickAmounts: [200, 300] }, // カゴメ公式：開封後1ヶ月（冷蔵）
  { name: 'ウスターソース',   category: '調味料', totalUnit: 'ml', expiryDays: 60  }, // ブルドック等：開封後2ヶ月（冷蔵）
  { name: 'ポン酢',           category: '調味料', totalUnit: 'ml', expiryDays: 30  }, // ミツカン等：開封後1ヶ月（冷蔵）
  { name: 'めんつゆ',         category: '調味料', totalUnit: 'ml', expiryDays: 14  }, // 各社：希釈タイプ開封後2週間（冷蔵）
  { name: '白だし',           category: '調味料', totalUnit: 'ml', expiryDays: 30  }, // ヤマキ等：開封後1ヶ月（冷蔵）
  { name: '本だし（顆粒）',   category: '調味料', totalUnit: 'g',  expiryDays: 180 }, // 味の素公式：開封後6ヶ月（冷蔵）
  { name: '鶏がらスープの素', category: '調味料', totalUnit: 'g',  expiryDays: 180 }, // 味の素公式：開封後6ヶ月（冷蔵）
  { name: 'コンソメ（顆粒）', category: '調味料', totalUnit: 'g',  expiryDays: 180 }, // 味の素公式：開封後6ヶ月（冷蔵）
  { name: 'みそ',             category: '調味料', totalUnit: 'g',  expiryDays: 90  }, // マルコメ等：開封後3ヶ月（冷蔵）
  { name: '白みそ',           category: '調味料', totalUnit: 'g',  expiryDays: 30  }, // 糖分が多く通常みそより劣化が早い。開封後1ヶ月（冷蔵）
  { name: 'コチュジャン',     category: '調味料', totalUnit: 'g',  expiryDays: 90  }, // 開封後3ヶ月（冷蔵）
  { name: '豆板醤',           category: '調味料', totalUnit: 'g',  expiryDays: 90  }, // 開封後3ヶ月（冷蔵）
  { name: 'オイスターソース', category: '調味料', totalUnit: 'ml', expiryDays: 90  }, // 李錦記等：開封後3ヶ月（冷蔵）
  { name: 'ドレッシング',     category: '調味料', totalUnit: 'ml', expiryDays: 30  }, // 各社：乳化タイプ開封後1ヶ月（冷蔵）
  { name: 'からし',           category: '調味料', totalUnit: 'g',  expiryDays: 90  }, // チューブ入り。開封後3ヶ月（冷蔵）
  { name: 'わさび',           category: '調味料', totalUnit: 'g',  expiryDays: 90  }, // チューブ入り。開封後3ヶ月（冷蔵）
  // 以下は実質的に変質しないためnull
  { name: '砂糖',             category: '調味料', totalUnit: 'g',  expiryDays: null }, // 吸湿しなければ半永久的
  { name: '塩',               category: '調味料', totalUnit: 'g',  expiryDays: null }, // 塩は変質しない（賞味期限なし）
  { name: 'コショウ',         category: '調味料', totalUnit: 'g',  expiryDays: null }, // 乾燥スパイス類は変質しにくい
  { name: '片栗粉',           category: '調味料', totalUnit: 'g',  expiryDays: null }, // 密封保存で長期可
  { name: '小麦粉',           category: '調味料', totalUnit: 'g',  expiryDays: null }, // 密封冷蔵保存で長期可（虫に注意）
  { name: 'パン粉',           category: '調味料', totalUnit: 'g',  expiryDays: null }, // 乾燥品は密封保存で長期可
  { name: 'ごま',             category: '調味料', totalUnit: 'g',  expiryDays: null }, // 乾燥品は密封保存で長期可（油分は酸化注意）
  // 追加調味料（2026年3月追加）
  { name: '七味唐辛子',       category: '調味料', totalUnit: 'g',  expiryDays: null }, // 乾燥スパイス。密封保存で長期可
  { name: '一味唐辛子',       category: '調味料', totalUnit: 'g',  expiryDays: null }, // 乾燥スパイス。密封保存で長期可
  { name: 'カレー粉',         category: '調味料', totalUnit: 'g',  expiryDays: null }, // 乾燥スパイス。密封保存で長期可（開封後は香りが飛びやすい）
  { name: 'ナンプラー',       category: '調味料', totalUnit: 'ml', expiryDays: 90  }, // 開封後3ヶ月冷蔵（各メーカー）
  { name: 'ラー油',           category: '調味料', totalUnit: 'ml', expiryDays: 90  }, // 開封後3ヶ月冷蔵（各メーカー）
  { name: '粒マスタード',     category: '調味料', totalUnit: 'g',  expiryDays: 90  }, // 開封後3ヶ月冷蔵（各メーカー）
  { name: '焼き肉のたれ',     category: '調味料', totalUnit: 'ml', expiryDays: 30  }, // 開封後1ヶ月冷蔵（各メーカー）
  { name: 'めんつゆ（濃縮）', category: '調味料', totalUnit: 'ml', expiryDays: 14  }, // 開封後2週間冷蔵（各メーカー）
  { name: 'ポン酢',           category: '調味料', totalUnit: 'ml', expiryDays: 30  }, // 既存のポン酢と同じ（念のため別名で追加）

  // ── 乾物・主食 ──────────────────────────────────────
  // 乾物・未調理の乾麺は実質的に期限管理不要（null）。
  // 白米のみ精米後の品質劣化を考慮して設定。
  { name: '白米',           category: '乾物・主食', totalUnit: 'kg', expiryDays: 30, refAmount: 150, refUnit: 'g', quickAmounts: [2, 5, 10] }, // 1kg≈6.67合(1合=150g)。購入はkg単位(2kg/5kg/10kg袋)。農水省：精米後1ヶ月以内が美味しさの目安
  { name: 'パスタ',         category: '乾物・主食', totalUnit: 'g',  expiryDays: null }, // 乾麺。未開封で3年以上
  { name: 'うどん（乾麺）', category: '乾物・主食', totalUnit: 'g',  expiryDays: null }, // 乾麺。未開封で長期可
  { name: 'そば（乾麺）',   category: '乾物・主食', totalUnit: 'g',  expiryDays: null }, // 乾麺。未開封で長期可
  { name: 'そうめん',       category: '乾物・主食', totalUnit: 'g',  expiryDays: null }, // 乾麺。年数を経るほど旨みが増す（「古物」）
  { name: '中華麺',         category: '乾物・主食', totalUnit: 'g',  expiryDays: null }, // 乾麺。未開封で長期可
  { name: '焼きそば麺',     category: '乾物・主食', totalUnit: '玉', expiryDays: 5,  refAmount: 150, refUnit: 'g' }, // 蒸し麺・生麺。開封後5日
  { name: '食パン',         category: '乾物・主食', totalUnit: '枚', expiryDays: 5,  refAmount: 60,  refUnit: 'g' }, // 市販食パンの消費期限は製造後5-6日
  { name: 'シリアル',       category: '乾物・主食', totalUnit: '箱', expiryDays: null, refAmount: 200, refUnit: 'g' }, // 乾燥品。密封保存で長期可
  { name: 'グラノーラ',     category: '乾物・主食', totalUnit: '袋', expiryDays: null, refAmount: 200, refUnit: 'g' }, // 乾燥品。密封保存で長期可
  { name: '乾燥わかめ',     category: '乾物・主食', totalUnit: 'g',  expiryDays: null }, // 乾物。密封保存で長期可
  { name: '切り干し大根',   category: '乾物・主食', totalUnit: 'g',  expiryDays: null }, // 乾物。密封保存で長期可
  { name: '高野豆腐',       category: '乾物・主食', totalUnit: '個', expiryDays: null, refAmount: 18, refUnit: 'g' }, // 乾物。密封保存で長期可
  { name: 'ひじき（乾燥）', category: '乾物・主食', totalUnit: 'g',  expiryDays: null }, // 乾物。密封保存で長期可
  { name: 'のり',           category: '乾物・主食', totalUnit: '枚', expiryDays: null, refAmount: 3,  refUnit: 'g' }, // 乾物。密封・乾燥剤入りで長期可
  { name: '春雨',           category: '乾物・主食', totalUnit: 'g',  expiryDays: null }, // 乾物。密封保存で長期可

  // ── その他（漬物・発酵食品・加工品） ──────────────────
  { name: 'トマト缶',   category: 'その他', totalUnit: '缶', expiryDays: null, refAmount: 400, refUnit: 'g' }, // 缶詰。未開封で長期可
  { name: '梅干し',     category: 'その他', totalUnit: '個', expiryDays: null, refAmount: 10,  refUnit: 'g' }, // 塩分により長期保存可
  { name: 'ジャム',     category: 'その他', totalUnit: 'g',  expiryDays: 30  }, // 開封後1ヶ月冷蔵（各メーカー）
  { name: '蜂蜜',       category: 'その他', totalUnit: 'g',  expiryDays: null }, // 賞味期限なし（糖分により長期保存可）
  { name: 'バナナ',         category: '果物', totalUnit: '本', expiryDays: 5,  refAmount: 100, refUnit: 'g', quickAmounts: [1, 2, 3] }, // 常温5日。黒ずんできたら要注意
  { name: 'りんご',         category: '果物', totalUnit: '個', expiryDays: 14, refAmount: 250, refUnit: 'g', quickAmounts: [1, 2, 3, 4] }, // 冷蔵2週間
  { name: 'みかん',         category: '果物', totalUnit: '個', expiryDays: 14, refAmount: 100, refUnit: 'g', quickAmounts: [3, 5, 8] }, // 冷蔵2週間
  { name: 'いちご',         category: '果物', totalUnit: 'パック', expiryDays: 3, refAmount: 300, refUnit: 'g', quickAmounts: [1, 2] }, // 傷みやすく3日以内
  { name: 'ぶどう',         category: '果物', totalUnit: '房', expiryDays: 5,  refAmount: 300, refUnit: 'g', quickAmounts: [1, 2] }, // 冷蔵5日
  { name: '梨',             category: '果物', totalUnit: '個', expiryDays: 7,  refAmount: 350, refUnit: 'g', quickAmounts: [1, 2] }, // 冷蔵1週間
  { name: '桃',             category: '果物', totalUnit: '個', expiryDays: 4,  refAmount: 250, refUnit: 'g', quickAmounts: [1, 2, 3] }, // 追熟後冷蔵3-4日
  { name: 'メロン',         category: '果物', totalUnit: '個', expiryDays: 7,  refAmount: 1000, refUnit: 'g', quickAmounts: [1] }, // 追熟後冷蔵1週間
  { name: 'キウイ',         category: '果物', totalUnit: '個', expiryDays: 7,  refAmount: 100, refUnit: 'g', quickAmounts: [2, 3, 4, 5] }, // 冷蔵1週間
  { name: 'レモン',         category: '果物', totalUnit: '個', expiryDays: 14, refAmount: 110, refUnit: 'g', quickAmounts: [1, 2, 3] }, // 冷蔵2週間
  { name: 'グレープフルーツ', category: '果物', totalUnit: '個', expiryDays: 14, refAmount: 350, refUnit: 'g', quickAmounts: [1, 2] }, // 冷蔵2週間
  { name: 'アボカド',       category: '果物', totalUnit: '個', expiryDays: 3,  refAmount: 200, refUnit: 'g', quickAmounts: [1, 2, 3] }, // 追熟後冷蔵3日
  { name: 'スイカ',         category: '果物', totalUnit: '個', expiryDays: 5,  refAmount: 5000, refUnit: 'g', quickAmounts: [1] }, // カット後冷蔵3-5日
  { name: 'マンゴー',       category: '果物', totalUnit: '個', expiryDays: 4,  refAmount: 300, refUnit: 'g', quickAmounts: [1, 2] }, // 追熟後冷蔵3-4日
  { name: 'キムチ',     category: 'その他', totalUnit: 'g',  expiryDays: 14  }, // 開封後冷蔵2週間（各メーカー推奨）
  { name: 'こんにゃく', category: 'その他', totalUnit: '個', expiryDays: 7,  refAmount: 250, refUnit: 'g' }, // 開封後1週間冷蔵
  { name: '白滝',       category: 'その他', totalUnit: '袋', expiryDays: 7,  refAmount: 200, refUnit: 'g' }, // 開封後1週間冷蔵
  { name: '明太子',     category: '魚介', totalUnit: '本', expiryDays: 3,  refAmount: 50,  refUnit: 'g' }, // 開封後3日以内（各メーカー）
  { name: '辛子明太子', category: '魚介', totalUnit: '本', expiryDays: 3,  refAmount: 50,  refUnit: 'g' }, // 開封後3日以内（各メーカー）

  // ── 冷凍 ────────────────────────────────────────────
  // 市販冷凍品の賞味期限は通常12-24ヶ月。在庫管理用のためnull。
  // 手作り冷凍（ご飯等）は1ヶ月を目安に使い切りを推奨（農水省）。
  { name: '冷凍ほうれん草',   category: '冷凍', totalUnit: 'g',  expiryDays: null },
  { name: '冷凍ブロッコリー', category: '冷凍', totalUnit: 'g',  expiryDays: null },
  { name: '冷凍枝豆',         category: '冷凍', totalUnit: 'g',  expiryDays: null },
  { name: '冷凍コーン',       category: '冷凍', totalUnit: 'g',  expiryDays: null },
  { name: '冷凍唐揚げ',       category: '冷凍', totalUnit: 'g',  expiryDays: null },
  { name: '冷凍餃子',         category: '冷凍', totalUnit: '個', expiryDays: null, refAmount: 20,  refUnit: 'g' },
  { name: '冷凍エビ',         category: '冷凍', totalUnit: 'g',  expiryDays: null },
  { name: '冷凍うどん',       category: '冷凍', totalUnit: '玉', expiryDays: null, refAmount: 200, refUnit: 'g' },
  { name: '冷凍ご飯',         category: '冷凍', totalUnit: '個', expiryDays: null, refAmount: 200, refUnit: 'g' }, // 手作り冷凍は1ヶ月目安だが管理はユーザー判断
]

export function searchIngredients(query) {
  if (!query) return INGREDIENTS_DB.slice(0, 20)
  return INGREDIENTS_DB.filter(item => item.name.includes(query)).slice(0, 10)
}

export function findIngredient(name) {
  return INGREDIENTS_DB.find(item => item.name === name)
}

export function suggestExpiryDate(expiryDays) {
  if (!expiryDays) return ''
  const date = new Date()
  date.setDate(date.getDate() + expiryDays)
  return date.toISOString().split('T')[0]
}
