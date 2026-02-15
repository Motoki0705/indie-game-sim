import { uiGameAssets } from '../../assets/ui-game'
import type { ActionDefinition, RunState } from '../../types/game'

type Props = {
  run: RunState
  actions: ActionDefinition[]
  busy: boolean
  onAction: (actionId: string) => void
  onNextMonth: () => void
}

function iconForAction(actionId: string): string {
  if (actionId === 'work') return uiGameAssets.icons.actionGuitar
  if (actionId.startsWith('study')) return uiGameAssets.icons.actionBook
  if (actionId === 'invest') return uiGameAssets.icons.actionInvest
  if (actionId === 'rest') return uiGameAssets.icons.resourceHeart
  return uiGameAssets.icons.actionPalette
}

export function RightControlPanel({ run, actions, busy, onAction, onNextMonth }: Props) {
  return (
    <aside className="right-control">
      <img className="right-control-bg" src={uiGameAssets.panels.rightControlPanel} alt="control panel" />

      <div className="action-buttons">
        {actions.map((action) => {
          const disabled = busy || run.finished || run.time_left < action.time_cost
          return (
            <button
              key={action.action_id}
              className="image-button"
              disabled={disabled}
              onClick={() => onAction(action.action_id)}
              title={`${action.title}: 時間-${action.time_cost}`}
            >
              <img src={uiGameAssets.buttons.idle} alt="button background" />
              <img className="action-icon" src={iconForAction(action.action_id)} alt="action icon" />
              <span>{action.title}</span>
            </button>
          )
        })}

        <button className="image-button next-action" disabled={busy || run.finished} onClick={onNextMonth}>
          <img src={uiGameAssets.buttons.idle} alt="button background" />
          <img className="action-icon" src={uiGameAssets.overlays.arrowNext} alt="next month" />
          <span>次月へ</span>
        </button>
      </div>
    </aside>
  )
}
