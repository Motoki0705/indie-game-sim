import { uiGameAssets } from '../../assets/ui-game'
import type { RunState } from '../../types/game'

type Props = {
  run: RunState
}

export function ResourceRail({ run }: Props) {
  const resources = [
    { icon: uiGameAssets.icons.currencyCoin, value: run.money },
    { icon: uiGameAssets.icons.resourceFolder, value: run.time_left },
    { icon: uiGameAssets.icons.resourcePc, value: run.skills.dev ?? 0 },
    { icon: uiGameAssets.icons.actionPalette, value: run.skills.sales ?? 0 },
    { icon: uiGameAssets.icons.actionGuitar, value: run.skills.finance ?? 0 },
    { icon: uiGameAssets.icons.actionInvest, value: run.investments },
  ]

  return (
    <aside className="resource-rail">
      {resources.map((res, idx) => (
        <div className="resource-slot" key={`${res.value}-${idx}`}>
          <img className="resource-slot-bg" src={uiGameAssets.rails.resourceSlotFrame} alt="resource slot" />
          <img className="resource-slot-icon" src={res.icon} alt="resource icon" />
          <span className="resource-slot-value">{Math.max(0, Math.floor(res.value)).toLocaleString()}</span>
        </div>
      ))}
    </aside>
  )
}
