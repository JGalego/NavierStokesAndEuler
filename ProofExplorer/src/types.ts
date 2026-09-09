export type Lens = 'story' | 'lean' | 'both'

export interface GoalSnapshot {
  state: string
  goalId: string
}

export interface ProofAction {
  index: number
  tacticText: string
  startState: string
  startGoalId: string
  nextGoals: GoalSnapshot[]
}

export interface ProofData {
  schemaVersion: number
  theoremName: string
  sourcePath: string
  startGoal: GoalSnapshot
  actions: ProofAction[]
}

export interface ProofStage {
  id: string
  number: string
  label: string
  title: string
  range: readonly [number, number]
  summary: string
  story: string
  bridge: string
  leanFocus: string[]
  concepts: string[]
  question: string
  answer: string
}

export interface StepLesson {
  label: string
  summary: string
  detail: string
  concept: string
}
