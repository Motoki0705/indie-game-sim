import type { ActionDefinition, RunState } from '../../types/game'
import { MonthProgressPanel } from './MonthProgressPanel'
import { ResourceRail } from './ResourceRail'
import { RightControlPanel } from './RightControlPanel'
import { RoomStage } from './RoomStage'
import { TopStatusPanel } from './TopStatusPanel'

type Props = {
  run: RunState
  actions: ActionDefinition[]
  busy: boolean
  onAction: (actionId: string) => void
  onNextMonth: () => void
}

export function GameScreen({ run, actions, busy, onAction, onNextMonth }: Props) {
  return (
    <section className="game-screen">
      <TopStatusPanel run={run} />

      <div className="game-main">
        <ResourceRail run={run} />
        <div className="game-center">
          <RoomStage run={run} />
          <MonthProgressPanel run={run} />
        </div>
        <RightControlPanel run={run} actions={actions} busy={busy} onAction={onAction} onNextMonth={onNextMonth} />
      </div>
    </section>
  )
}
