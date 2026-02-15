# stage/room_background

component_id: stage.room_background
target_path: frontend/src/assets/ui-game/stage/room_background.png
size_hint: 640x360

## intent
中央ステージの部屋背景。

## shape_rules
上から見下ろし寄りの2D室内、床タイルと壁境界を明確化。

## must_not
人物、UI文字、強パース

## acceptance
家具を重ねても破綻しない平面領域がある。
