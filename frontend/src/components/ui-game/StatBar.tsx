import { uiGameAssets } from '../../assets/ui-game'

type Props = {
  label: string
  value: number
  fill: 'hp' | 'health' | 'morale'
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v))
}

export function StatBar({ label, value, fill }: Props) {
  const width = `${clamp(value)}%`
  const fillSrc =
    fill === 'hp'
      ? uiGameAssets.bars.fillHp
      : fill === 'health'
        ? uiGameAssets.bars.fillHealth
        : uiGameAssets.bars.fillMorale

  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-bar">
        <img className="stat-frame" src={uiGameAssets.bars.frame} alt="stat frame" />
        <div className="stat-fill-wrap" style={{ width }}>
          <img className="stat-fill" src={fillSrc} alt={`${label} fill`} />
        </div>
      </div>
    </div>
  )
}
