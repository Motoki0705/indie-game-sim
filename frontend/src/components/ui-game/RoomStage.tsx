import { uiGameAssets } from '../../assets/ui-game'
import type { RunState } from '../../types/game'

type Props = {
  run: RunState
}

export function RoomStage({ run }: Props) {
  const character = run.finished
    ? uiGameAssets.stage.characterRest
    : run.stress > 70
      ? uiGameAssets.stage.characterRest
      : run.time_left < 80
        ? uiGameAssets.stage.characterWork
        : uiGameAssets.stage.characterIdle

  return (
    <section className="room-stage">
      <img className="room-bg" src={uiGameAssets.stage.roomBackground} alt="room background" />
      <img className="furniture" src={uiGameAssets.stage.furnitureSet} alt="furniture" />
      <img className="character" src={character} alt="character" />
    </section>
  )
}
