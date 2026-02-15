import { uiGameAssets } from '../../assets/ui-game'
import type { RunState } from '../../types/game'
import { StatBar } from './StatBar'

type Props = {
  run: RunState
}

function ageLabel(monthIndex: number): string {
  const years = 30 + Math.floor(monthIndex / 12)
  return `${years}歳`
}

function moraleFromStress(stress: number): number {
  return 100 - stress
}

function wellnessFromRun(run: RunState): number {
  const moneyFactor = Math.max(0, Math.min(100, run.money / 120))
  return (run.health * 0.65 + moneyFactor * 0.35)
}

export function TopStatusPanel({ run }: Props) {
  return (
    <section className="top-status">
      <img className="top-status-frame" src={uiGameAssets.panels.headerFrame} alt="header frame" />

      <div className="name-plate">
        <img src={uiGameAssets.panels.namePlate} alt="name plate" />
        <div className="name-text">kan.kikuchi {ageLabel(run.month_index)}</div>
      </div>

      <div className="bars-stack">
        <StatBar label="体力" value={run.health} fill="hp" />
        <StatBar label="健康" value={wellnessFromRun(run)} fill="health" />
        <StatBar label="モラル" value={moraleFromStress(run.stress)} fill="morale" />
      </div>

      <div className="money-box">
        <img src={uiGameAssets.panels.currencyPanel} alt="money panel" />
        <img className="money-icon" src={uiGameAssets.icons.currencyCoin} alt="coin" />
        <div className="money-value">{run.money.toLocaleString()}円</div>
      </div>
    </section>
  )
}
