import type { RunState } from '../types/game'

type Props = {
  run: RunState
}

function ageLabel(monthIndex: number): string {
  const years = 30 + Math.floor(monthIndex / 12)
  const months = monthIndex % 12
  return `${years}y ${months}m`
}

export function StatusPanel({ run }: Props) {
  return (
    <section className="panel">
      <h2>Run Status</h2>
      <p>Age: {ageLabel(run.month_index)}</p>
      <p>Money: {run.money}</p>
      <p>Time Left: {run.time_left}</p>
      <p>Health: {run.health}</p>
      <p>Stress: {run.stress}</p>
      <p>Career: Lv.{run.career_level}</p>
      <p>
        Skills: Dev {run.skills.dev ?? 0} / Sales {run.skills.sales ?? 0} / Finance {run.skills.finance ?? 0}
      </p>
      {run.finished && <p className="danger">Finished: {run.finish_reason}</p>}
    </section>
  )
}
