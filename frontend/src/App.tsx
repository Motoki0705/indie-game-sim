import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  applyAction,
  createRun,
  fetchActions,
  fetchMeta,
  fetchRun,
  fetchUpgrades,
  nextMonth,
  purchaseUpgrade,
} from './api/client'
import { GameScreen } from './components/ui-game/GameScreen'
import type { ActionDefinition, MetaState, RunState, UpgradeDefinition } from './types/game'

function App() {
  const [actions, setActions] = useState<ActionDefinition[]>([])
  const [upgrades, setUpgrades] = useState<UpgradeDefinition[]>([])
  const [meta, setMeta] = useState<MetaState | null>(null)
  const [run, setRun] = useState<RunState | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        const [loadedActions, loadedUpgrades, loadedMeta] = await Promise.all([
          fetchActions(),
          fetchUpgrades(),
          fetchMeta(),
        ])
        setActions(loadedActions)
        setUpgrades(loadedUpgrades)
        setMeta(loadedMeta)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown bootstrap error')
      }
    }

    bootstrap()
  }, [])

  const runId = run?.run_id
  const canResume = useMemo(() => Boolean(runId), [runId])

  async function onCreateRun() {
    setBusy(true)
    setError(null)
    try {
      const snapshot = await createRun()
      setRun(snapshot.run)
      setMeta(snapshot.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create run')
    } finally {
      setBusy(false)
    }
  }

  async function onResumeRun() {
    if (!runId) return
    setBusy(true)
    setError(null)
    try {
      const snapshot = await fetchRun(runId)
      setRun(snapshot.run)
      setMeta(snapshot.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume run')
    } finally {
      setBusy(false)
    }
  }

  async function onAction(actionId: string) {
    if (!runId) return
    setBusy(true)
    setError(null)
    try {
      const nextRun = await applyAction(runId, actionId)
      setRun(nextRun)
      setMeta(await fetchMeta())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply action')
    } finally {
      setBusy(false)
    }
  }

  async function onNextMonth() {
    if (!runId) return
    setBusy(true)
    setError(null)
    try {
      const nextRunState = await nextMonth(runId)
      setRun(nextRunState)
      setMeta(await fetchMeta())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve month')
    } finally {
      setBusy(false)
    }
  }

  async function onUpgrade(upgradeId: string) {
    setBusy(true)
    setError(null)
    try {
      const nextMeta = await purchaseUpgrade(upgradeId)
      setMeta(nextMeta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase upgrade')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="app-root">
      <section className="toolbar">
        <button className="toolbar-btn" disabled={busy} onClick={onCreateRun}>
          New Run
        </button>
        <button className="toolbar-btn" disabled={busy || !canResume} onClick={onResumeRun}>
          Refresh
        </button>
        {error ? <p className="danger">{error}</p> : null}
      </section>

      {run ? (
        <GameScreen run={run} actions={actions} busy={busy} onAction={onAction} onNextMonth={onNextMonth} />
      ) : (
        <section className="empty-state">Start New Run to open the image-based game screen.</section>
      )}

      {meta ? (
        <section className="meta-strip">
          <span>Soul: {meta.soul_points}</span>
          {upgrades.map((u) => {
            const current = meta.upgrades[u.upgrade_id] ?? 0
            const cost = u.cost_base * (current + 1)
            const disabled = busy || current >= u.max_level || meta.soul_points < cost
            return (
              <button key={u.upgrade_id} className="toolbar-btn" disabled={disabled} onClick={() => onUpgrade(u.upgrade_id)}>
                {u.title} Lv.{current}
              </button>
            )
          })}
        </section>
      ) : null}
    </main>
  )
}

export default App
