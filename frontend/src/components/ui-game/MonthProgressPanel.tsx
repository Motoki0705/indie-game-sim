import { uiGameAssets } from '../../assets/ui-game'
import type { RunState } from '../../types/game'

type Props = {
  run: RunState
}

function ageMonth(run: RunState): string {
  const y = 30 + Math.floor(run.month_index / 12)
  const m = (run.month_index % 12) + 1
  return `${y}歳 ${m}月`
}

export function MonthProgressPanel({ run }: Props) {
  const dots = 60
  const filled = Math.min(dots, run.month_index)

  return (
    <section className="month-panel">
      <img className="month-panel-bg" src={uiGameAssets.panels.monthProgressPanel} alt="month panel" />
      <div className="month-label">{ageMonth(run)} 進行中</div>
      <div className="month-dots">
        {Array.from({ length: dots }).map((_, i) => (
          <img
            key={i}
            src={i < filled ? uiGameAssets.calendar.dotFilled : uiGameAssets.calendar.dotEmpty}
            alt={i < filled ? 'done' : 'pending'}
          />
        ))}
      </div>
    </section>
  )
}
