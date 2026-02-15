import type { RunState } from '../types/game'

type Props = {
  run: RunState
}

export function LogPanel({ run }: Props) {
  const lines = run.log.slice(-8).reverse()
  return (
    <section className="panel">
      <h2>Recent Log</h2>
      <ul className="log-list">
        {lines.map((line, index) => (
          <li key={`${line}-${index}`}>{line}</li>
        ))}
      </ul>
    </section>
  )
}
