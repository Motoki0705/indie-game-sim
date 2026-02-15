import type { MetaState, UpgradeDefinition } from '../types/game'

type Props = {
  meta: MetaState
  upgrades: UpgradeDefinition[]
  busy: boolean
  onUpgrade: (upgradeId: string) => void
}

export function MetaPanel({ meta, upgrades, busy, onUpgrade }: Props) {
  return (
    <section className="panel">
      <h2>Reincarnation</h2>
      <p>Soul Points: {meta.soul_points}</p>
      <div className="actions-grid">
        {upgrades.map((upgrade) => {
          const current = meta.upgrades[upgrade.upgrade_id] ?? 0
          const cost = upgrade.cost_base * (current + 1)
          const disabled = busy || current >= upgrade.max_level || meta.soul_points < cost
          return (
            <button key={upgrade.upgrade_id} disabled={disabled} onClick={() => onUpgrade(upgrade.upgrade_id)}>
              {upgrade.title}
              <br />
              Lv.{current}/{upgrade.max_level} Cost:{cost}
            </button>
          )
        })}
      </div>
    </section>
  )
}
