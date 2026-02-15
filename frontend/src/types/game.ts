export type MetaState = {
  soul_points: number
  upgrades: Record<string, number>
}

export type RunState = {
  run_id: string
  month_index: number
  time_left: number
  money: number
  health: number
  stress: number
  career_level: number
  skills: Record<string, number>
  investments: number
  log: string[]
  finished: boolean
  finish_reason: string | null
  points_granted: boolean
}

export type RunSnapshot = {
  run: RunState
  meta: MetaState
}

export type ActionDefinition = {
  action_id: string
  title: string
  time_cost: number
  money_delta: number
  health_delta: number
  stress_delta: number
  skill_delta: Record<string, number>
}

export type UpgradeDefinition = {
  upgrade_id: string
  title: string
  max_level: number
  cost_base: number
}
