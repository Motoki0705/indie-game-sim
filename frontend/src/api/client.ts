import type { ActionDefinition, MetaState, RunSnapshot, UpgradeDefinition } from '../types/game'

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return (await response.json()) as T
}

export async function fetchActions(): Promise<ActionDefinition[]> {
  const response = await fetch('/api/actions')
  return readJson<ActionDefinition[]>(response)
}

export async function fetchUpgrades(): Promise<UpgradeDefinition[]> {
  const response = await fetch('/api/upgrades')
  return readJson<UpgradeDefinition[]>(response)
}

export async function fetchMeta(): Promise<MetaState> {
  const response = await fetch('/api/meta')
  return readJson<MetaState>(response)
}

export async function createRun(): Promise<RunSnapshot> {
  const response = await fetch('/api/runs', { method: 'POST' })
  return readJson<RunSnapshot>(response)
}

export async function fetchRun(runId: string): Promise<RunSnapshot> {
  const response = await fetch(`/api/runs/${runId}`)
  return readJson<RunSnapshot>(response)
}

export async function applyAction(runId: string, actionId: string): Promise<RunSnapshot['run']> {
  const response = await fetch(`/api/runs/${runId}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action_id: actionId }),
  })
  const data = await readJson<{ run: RunSnapshot['run'] }>(response)
  return data.run
}

export async function nextMonth(runId: string): Promise<RunSnapshot['run']> {
  const response = await fetch(`/api/runs/${runId}/next-month`, {
    method: 'POST',
  })
  const data = await readJson<{ run: RunSnapshot['run'] }>(response)
  return data.run
}

export async function purchaseUpgrade(upgradeId: string): Promise<MetaState> {
  const response = await fetch('/api/meta/upgrades', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upgrade_id: upgradeId }),
  })
  const data = await readJson<{ meta: MetaState }>(response)
  return data.meta
}
