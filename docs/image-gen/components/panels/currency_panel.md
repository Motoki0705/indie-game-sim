# panels/currency_panel

component_id: panels.currency_panel
target_path: frontend/src/assets/ui-game/panels/currency_panel.png
size_hint: 220x64

## intent
所持金表示エリア。右上に配置し増減演出の基準点になる。

## shape_rules
左にアイコン窓、右に数値窓。数値窓は最低120px幅。

## must_not
桁区切り文字の描き込み、背景透けすぎ

## acceptance
大きな金額テキストを置いても読みやすい。
