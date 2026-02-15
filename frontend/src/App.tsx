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
import { ActionPanel } from './components/ActionPanel'
import { LogPanel } from './components/LogPanel'
import { MetaPanel } from './components/MetaPanel'
import { StatusPanel } from './components/StatusPanel'
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
      <header className="hero">
        <h1>30 to 35 - Local MVP</h1>
        <p>Monthly life sim loop with reincarnation upgrades.</p>
      </header>

      <section className="panel controls">
        <button disabled={busy} onClick={onCreateRun}>
          Start New Run
        </button>
        <button disabled={busy || !canResume} onClick={onResumeRun}>
          Refresh Current Run
        </button>
        {error ? <p className="danger">{error}</p> : null}
      </section>

      {meta ? <MetaPanel meta={meta} upgrades={upgrades} busy={busy} onUpgrade={onUpgrade} /> : null}
      {run ? (
        <>
          <StatusPanel run={run} />
          <ActionPanel run={run} actions={actions} busy={busy} onAction={onAction} onNextMonth={onNextMonth} />
          <LogPanel run={run} />
        </>
      ) : (
        <section className="panel">
          <h2>No active run</h2>
          <p>Press "Start New Run" to begin.</p>
        </section>
      )}
    </main>
  )
}

export default App
