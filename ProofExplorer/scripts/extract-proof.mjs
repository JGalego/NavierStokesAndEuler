#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectDirectory = resolve(scriptDirectory, '..')
const defaultInput = resolve(projectDirectory, '../ProofAnimation/build/navier-stokes-proof.json')
const defaultOutput = resolve(projectDirectory, 'public/data/navier-stokes-proof.json')
const inputPath = resolve(process.argv[2] ?? defaultInput)
const outputPath = resolve(process.argv[3] ?? defaultOutput)

const raw = JSON.parse(await readFile(inputPath, 'utf8'))

if (!Array.isArray(raw.actions) || typeof raw.theoremName !== 'string') {
  throw new Error(`Unexpected animate-lean-proofs data in ${inputPath}`)
}

const actions = raw.actions.map((action, index) => {
  const goalActions = Array.isArray(action.goalActions) ? action.goalActions : []
  const startState = goalActions.find((goalAction) => typeof goalAction.startState === 'string')?.startState ?? ''
  const startGoalId = goalActions.find((goalAction) => typeof goalAction.startGoalId === 'string')?.startGoalId ?? ''
  const nextGoals = goalActions.flatMap((goalAction) =>
    (Array.isArray(goalAction.results) ? goalAction.results : [])
      .map((result) => result.goal)
      .filter((goal) => goal && typeof goal.state === 'string')
      .map((goal) => ({ state: goal.state, goalId: goal.goalId ?? '' })),
  )

  return {
    index,
    tacticText: String(action.tacticText ?? ''),
    startState,
    startGoalId,
    nextGoals,
  }
})

if (actions.length === 0 || actions.some((action) => !action.tacticText || !action.startState)) {
  throw new Error('Proof extraction produced an empty or incomplete action list')
}

const compact = {
  schemaVersion: 1,
  theoremName: raw.theoremName,
  sourcePath: 'NavierStokes/ComparatorProofAnimation.lean',
  startGoal: raw.startGoal,
  actions,
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(compact, null, 2)}\n`)

const inputBytes = Buffer.byteLength(JSON.stringify(raw))
const outputBytes = Buffer.byteLength(JSON.stringify(compact))
const reduction = Math.round((1 - outputBytes / inputBytes) * 100)
console.log(`Extracted ${actions.length} proof actions to ${outputPath}`)
console.log(`Reduced ${inputBytes.toLocaleString()} bytes to ${outputBytes.toLocaleString()} bytes (${reduction}% smaller)`)
