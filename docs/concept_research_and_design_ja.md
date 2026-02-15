# Steam対象ゲームのコンセプト調査とローカル実装向け詳細設計

更新日: 2026-02-15
対象: https://store.steampowered.com/app/3139290/_/

## 0. スコープ
- 目的: 対象ゲームの公開情報からコンセプトを整理し、同系統ゲームを `Python + Web` でローカルプレイ可能にするための詳細設計を作る。
- 注意: 以下は「Steam公開情報ベースの要件抽出」であり、内部仕様は不明。公開文言から推定した部分は明示する。

## 1. コンセプト調査（公開情報）

### 1.1 確定で読み取れる要素
Steamページ本文/概要から、次が明確。
- ジャンル: シミュレーション、ライフマネジメント、インディー。
- 主題: 30歳から35歳までの人生再設計。
- 中核リソース: `時間` と `お金`。
- プレイヤー行動: 仕事、投資、スキル学習、休息、嗜好品購入などの選択。
- 制約: 寿命(35歳)がある。時間を使い切ると即終了に近い制約がある。
- 目的: 次の人生に備えるための資産形成・能力形成。
- メタ進行: 転生/次周への持ち越し(「来世システム」)がある。

### 1.2 公開情報からの推定要素（実装時に再定義）
以下は本文からの自然な推定。厳密仕様ではない。
- 1プレイは短めの周回型（ローグライト的ライフシム）。
- 終了時に評価値をポイント化し、恒久強化へ変換する構造。
- 資産と能力のトレードオフ最適化がコア。

### 1.3 デモ情報からの補足
- 体験版は30歳〜35歳のプレイをベースにしている。
- 一部要素（職種、イベント、高難度報酬等）が制限されている旨の記載あり。
- 基本ゲームループ自体は体験版でも把握可能。

## 2. ローカル実装する同系ゲームの設計方針

## 2.1 デザインゴール
- 1周を短時間で回せる（10〜20分）。
- 選択ごとに`時間/お金/体力/能力`が明確に動く。
- 死亡/寿命終了後のメタ進行で次周が有利になる。
- 完全シングルプレイ、ローカルブラウザ動作。

## 2.2 MVP定義（最初に作る範囲）
- 期間: 30歳0か月〜35歳0か月（全60ターン、1ターン=1か月）。
- 初期ステータス: `money`, `time_budget`, `health`, `stress`, `skills`。
- 行動カテゴリ: `Work`, `Study`, `Invest`, `Rest`, `Leisure`。
- 毎ターン処理: 行動選択 -> リソース更新 -> ランダムイベント -> 月次清算 -> 終了判定。
- エンディング: 35歳到達 or health/time破綻。
- 転生ポイント: ラン結果をポイント化して恒久アップグレードに使用。

## 3. ゲームシステム詳細

### 3.1 状態モデル
- RunState
  - `age_year: int` (30..35)
  - `month_index: int` (0..59)
  - `money: int`
  - `time_left: int` (月内の残り時間)
  - `health: int` (0..100)
  - `stress: int` (0..100)
  - `skills: dict[str, int]` (例: dev, sales, finance)
  - `career_level: int`
  - `assets: dict[str, int]` (投資商品保有)
  - `flags: set[str]` (イベントフラグ)

- MetaState
  - `soul_points: int`
  - `upgrades: dict[str, int]` (例: start_money_bonus, study_efficiency)
  - `unlocked_jobs: list[str]`

### 3.2 ターン進行
1. 月初に `time_left = base_time + bonus` を設定（例: 160h）。
2. プレイヤーが行動カードを1〜3回選択（合計時間内）。
3. 行動ごとに `money/health/stress/skill` を即時反映。
4. 月末イベント抽選（確率はstressやskillで補正）。
5. 固定支出（生活費）と投資損益を計上。
6. 終了判定。

### 3.3 行動設計（MVP）
- Work
  - 消費: `time + health`
  - 獲得: `salary`
  - 条件: 職ごとにスキル閾値
- Study
  - 消費: `time + money(教材費)`
  - 獲得: 対応skill上昇
- Invest
  - 消費: `money`
  - 効果: 月末に期待値ベース損益（乱数あり）
- Rest
  - 消費: `time`
  - 効果: `health回復`, `stress減`
- Leisure
  - 消費: `time + money`
  - 効果: `stress大幅減`, 低確率で特別イベント

### 3.4 数式（初期バランス案）
- 給与: `salary = base_salary(job) * (1 + 0.05 * career_level)`
- 学習効率: `gain = floor(base_gain * (1 + 0.1 * upgrade_level))`
- ストレス自然増: `stress += 3 + overwork_penalty`
- 体力自然減: `health -= max(0, stress - 60) / 10`
- 転生ポイント:
  - `points = floor((money / 1000) + (sum(skills)/20) + (career_level*3) - bankruptcy_penalty)`
  - 下限0、上限は一旦なし

### 3.5 イベント設計
- イベント種別
  - `Opportunity`: 昇進、臨時収入、割安投資
  - `Risk`: 病気、失職、暴落
  - `Story`: 人間関係/価値観分岐（軽量テキスト）
- 実装方式
  - JSON定義駆動（条件式 + 重み + 効果）
  - 再現性確保のため乱数seedをRun開始時に保存

## 4. Webアプリ構成（Python + Web）

### 4.1 技術選定
- Backend: `FastAPI`
- Frontend: `Jinja2 + HTMX + 軽量CSS`
- Storage:
  - MVP: `JSONファイル` 保存
  - 拡張: `SQLite` へ移行可能なRepository層
- 実行: ローカル `uvicorn` 起動

### 4.2 ディレクトリ案
- `app/main.py` ルーティング
- `app/domain/` ゲームロジック（純Python）
- `app/services/` ユースケース（turn進行/転生）
- `app/repos/` 保存I/F（JSON, SQLite）
- `app/templates/` 画面
- `app/static/` CSS/JS
- `data/` セーブデータ
- `tests/` ロジック単体テスト

### 4.3 画面遷移
- `/` タイトル
- `/run/new` 新規ラン開始
- `/run/{id}` メインプレイ画面（ステータス/行動ボタン/ログ）
- `/run/{id}/action` 行動適用(POST)
- `/run/{id}/next-month` 月次確定(POST)
- `/result/{id}` ラン結果
- `/meta` 転生強化画面

### 4.4 API/処理I/F
- `start_run(meta_state) -> run_id`
- `apply_action(run_id, action_id) -> RunState`
- `resolve_month(run_id) -> MonthlyReport`
- `finish_run(run_id) -> Result + granted_points`
- `purchase_upgrade(meta_state, upgrade_id) -> MetaState`

## 5. セーブ仕様
- `data/meta.json`
- `data/runs/{run_id}.json`
- 書き込み方式
  - 一時ファイルへ保存後にatomic rename
  - 破損時のため最新1世代バックアップ保持

## 6. テスト計画
- 単体テスト
  - 行動適用で各リソースが期待通り増減
  - 終了条件判定
  - 転生ポイント計算
- 性質テスト（簡易）
  - `health` `stress` が範囲外にならない
  - `time_left` が負にならない
- 統合テスト
  - 新規ラン開始 -> 3ターン進行 -> 結果画面表示

## 7. 実装タスク分解（次フェーズ）
1. ドメインモデルとターン進行ロジック実装
2. FastAPI最小ルーティング + テンプレート表示
3. 行動適用/次月処理のPOST接続
4. JSONセーブ実装
5. 転生画面とアップグレード適用
6. テスト追加とバランス係数調整

## 8. 既知リスクと対応
- リスク: 数値設計が単調化しやすい
  - 対応: イベント条件をステータス連動にして局面差を作る
- リスク: Web UIで情報過多になりやすい
  - 対応: 「今月の推奨行動」と「予測収支」を表示
- リスク: JSON保存競合
  - 対応: 単一ユーザー前提 + 原子的保存

## 9. 出典
- Steam Store page: https://store.steampowered.com/app/3139290/_/
- Steam Demo page: https://store.steampowered.com/app/3651650/_/
