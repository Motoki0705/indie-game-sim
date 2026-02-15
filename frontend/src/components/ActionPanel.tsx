import type { ActionDefinition, RunState } from '../types/game'

type Props = {
  run: RunState
  actions: ActionDefinition[]
  busy: boolean
  onAction: (actionId: string) => void
  onNextMonth: () => void
}

export function ActionPanel({ run, actions, busy, onAction, onNextMonth }: Props) {
  return (
    <section className="panel">
      <h2>Actions</h2>
      <div className="actions-grid">
        {actions.map((action) => {
          const disabled = busy || run.finished || run.time_left < action.time_cost
          return (
            <button key={action.action_id} disabled={disabled} onClick={() => onAction(action.action_id)}>
              {action.title}
              <br />
              t-{action.time_cost} / ${action.money_delta >= 0 ? `+${action.money_delta}` : action.money_delta}
            </button>
          )
        })}
      </div>
      <button className="next-month" disabled={busy || run.finished} onClick={onNextMonth}>
        Next Month
      </button>
    </section>
  )
}
