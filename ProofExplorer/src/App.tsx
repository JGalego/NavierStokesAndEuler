import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Braces,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Code2,
  ExternalLink,
  GitFork,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Waves,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { CorePreview } from './CoreExplorer'
import { InlineMath, MathText } from './MathText'
import { lessonFor, proofStages, stageForStep } from './proofContent'
import ReferenceLibrary from './ReferenceLibrary'
import type { GoalSnapshot, Lens, ProofAction, ProofData, ProofStage } from './types'

const repositoryUrl = 'https://github.com/JGalego/NavierStokesAndEuler'
const sourceUrl = `${repositoryUrl}/blob/feat/proof-animation/NavierStokes/ComparatorProofAnimation.lean`
const paperUrl = 'https://cdn.openai.com/pdf/32d9f210-8b73-45e0-91bc-82a30aef8a9a/navier-stokes.pdf'

const stageBeats: Record<string, string[]> = {
  candidate: ['unpack $u$, $p$, and $f$', 'read the certificate $h$', 'keep the construction folded'],
  'admissible-data': ['use compact support', 'replace $f$ by $\\nu^2 f$', 'prove the decay condition'],
  normalization: ['suppose $v$ and $q$ exist', 'rescale by $\\nu^{-1}$', 'verify the new solution'],
  comparison: ['fix $0 \\le t < 1$', 'work on $[0,t]$', 'apply uniqueness'],
  contradiction: ['obtain $u = v_1$', 'use smoothness of $v_1$', 'contradict $h$'],
}

function initialStepFromHash() {
  const match = window.location.hash.match(/^#step-(\d+)$/)
  return match ? Number(match[1]) - 1 : 0
}

function StageRail({
  activeStage,
  isPlaying,
  playbackDisabled,
  onSelect,
  onTogglePlayback,
}: {
  activeStage: ProofStage
  isPlaying: boolean
  playbackDisabled: boolean
  onSelect: (stage: ProofStage) => void
  onTogglePlayback: () => void
}) {
  return (
    <aside className="stage-rail" aria-label="Proof stages">
      <div className="rail-heading">
        <span className="section-kicker">Proof outline</span>
        <button
          type="button"
          className="rail-playback"
          onClick={onTogglePlayback}
          disabled={playbackDisabled}
          aria-label={isPlaying ? 'Pause proof' : 'Play proof'}
          title={isPlaying ? 'Pause proof' : 'Play proof'}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
      </div>
      <div className="stage-list">
        {proofStages.map((stage) => {
          const active = stage.id === activeStage.id
          const completed = stage.range[1] < activeStage.range[0]
          return (
            <button
              type="button"
              className={`stage-button${active ? ' active' : ''}${completed ? ' completed' : ''}`}
              key={stage.id}
              onClick={() => onSelect(stage)}
              aria-current={active ? 'step' : undefined}
            >
              <span className="stage-node">{completed ? <Check size={14} strokeWidth={3} /> : stage.number}</span>
              <span className="stage-copy">
                <span>{stage.label}</span>
                <strong>{stage.title}</strong>
              </span>
              <ChevronRight className="stage-chevron" size={16} />
            </button>
          )
        })}
      </div>
      <div className="rail-note">
        <Waves size={18} />
        <p>Most construction lemmas stay folded away here. The full Lean source remains close at hand.</p>
      </div>
    </aside>
  )
}

function StoryPanel({ stage }: { stage: ProofStage }) {
  return (
    <div className="story-panel">
      <div className="story-copy">
        <div className="story-label"><BookOpen size={16} /> Mathematical argument</div>
        <p className="story-lead"><MathText>{stage.story}</MathText></p>
      </div>
      <div className="concept-flow" aria-label={`Outline for ${stage.title}`}>
        {stageBeats[stage.id].map((beat, index) => (
          <div className="concept-beat" key={beat}>
            <span>{index + 1}</span>
            <strong><MathText>{beat}</MathText></strong>
            {index < stageBeats[stage.id].length - 1 && <ArrowRight size={15} aria-hidden="true" />}
          </div>
        ))}
      </div>
      <details className="checkpoint">
        <summary><CircleHelp size={17} /> Pause and check</summary>
        <p className="checkpoint-question"><MathText>{stage.question}</MathText></p>
        <p className="checkpoint-answer"><Lightbulb size={16} /> <span><MathText>{stage.answer}</MathText></span></p>
      </details>
    </div>
  )
}

interface ParsedGoal {
  caseName?: string
  context: string[]
  target: string
}

function parseGoalState(state: string): ParsedGoal {
  const lines = state.split('\n')
  const caseName = lines[0]?.startsWith('case ') ? lines.shift() : undefined
  const targetIndex = lines.findIndex((line) => line.startsWith('⊢'))
  if (targetIndex === -1) return { caseName, context: lines, target: 'No displayed target' }

  return {
    caseName,
    context: lines.slice(0, targetIndex),
    target: lines.slice(targetIndex).join('\n'),
  }
}

function GoalState({
  snapshot,
  compareTo,
  kind,
}: {
  snapshot?: GoalSnapshot
  compareTo?: GoalSnapshot
  kind: 'before' | 'after'
}) {
  if (!snapshot) {
    return (
      <div className="goal-state goal-complete">
        <div className="goal-state-heading"><CheckCircle2 size={17} /> After</div>
        <div className="complete-mark"><Check size={26} /></div>
        <strong>No goals remain</strong>
        <p>The theorem is complete.</p>
      </div>
    )
  }

  const parsed = parseGoalState(snapshot.state)
  const comparisonLines = new Set(compareTo ? parseGoalState(compareTo.state).context : [])

  return (
    <div className={`goal-state goal-${kind}`}>
      <div className="goal-state-heading">
        {kind === 'before' ? <RotateCcw size={15} /> : <Sparkles size={15} />}
        {kind === 'before' ? 'Before' : 'After'}
        {parsed.caseName && <span className="case-name">{parsed.caseName}</span>}
      </div>
      <div className="goal-context" aria-label={`${kind} local context`}>
        {parsed.context.length === 0 ? (
          <span className="empty-context">No local hypotheses</span>
        ) : parsed.context.map((line, index) => (
          <code
            className={kind === 'after' && !comparisonLines.has(line) ? 'line-added' : undefined}
            key={`${line}-${index}`}
          >
            {line || ' '}
          </code>
        ))}
      </div>
      <pre className="goal-target">{parsed.target}</pre>
    </div>
  )
}

function ProofWorkbench({
  action,
  total,
  onPrevious,
  onNext,
  onRestart,
}: {
  action: ProofAction
  total: number
  onPrevious: () => void
  onNext: () => void
  onRestart: () => void
}) {
  const [selectedGoal, setSelectedGoal] = useState(0)
  const lesson = lessonFor(action)
  const beforeSnapshot: GoalSnapshot = { state: action.startState, goalId: action.startGoalId }
  const afterSnapshot = action.nextGoals[selectedGoal]

  return (
    <div className="workbench">
      <div className="workbench-bar">
        <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
        <a className="file-label" href={sourceUrl} target="_blank" rel="noreferrer">
          ComparatorProofAnimation.lean <ExternalLink size={11} />
        </a>
        <span className="step-counter">move {action.index + 1} / {total}</span>
      </div>

      <div className="tactic-section">
        <div className="tactic-meta">
          <h3><MathText>{lesson.label}</MathText></h3>
          <span className="concept-pill"><Braces size={14} /> {lesson.concept}</span>
        </div>
        <pre className="tactic-code"><span className="prompt">by</span> {action.tacticText}</pre>
        <div className="lesson-grid">
          <p><MathText>{lesson.summary}</MathText></p>
          <p className="lean-detail"><Lightbulb size={16} /> <span><MathText>{lesson.detail}</MathText></span></p>
        </div>
      </div>

      {action.nextGoals.length > 1 && (
        <div className="subgoal-tabs" aria-label="Goals created by this tactic">
          <span>{action.nextGoals.length} goals created</span>
          {action.nextGoals.map((goal, index) => (
            <button
              type="button"
              className={selectedGoal === index ? 'active' : ''}
              onClick={() => setSelectedGoal(index)}
              key={goal.goalId || index}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      <div className="goal-grid" aria-live="polite">
        <GoalState snapshot={beforeSnapshot} kind="before" />
        <div className="state-arrow" aria-hidden="true"><ArrowRight size={18} /></div>
        <GoalState snapshot={afterSnapshot} compareTo={beforeSnapshot} kind="after" />
      </div>

      <div className="playback">
        <button type="button" className="icon-button" onClick={onRestart} aria-label="Restart proof">
          <RotateCcw size={17} />
        </button>
        <button type="button" className="icon-button" onClick={onPrevious} disabled={action.index === 0} aria-label="Previous proof move">
          <ArrowLeft size={18} />
        </button>
        <button type="button" className="icon-button" onClick={onNext} disabled={action.index === total - 1} aria-label="Next proof move">
          <ArrowRight size={18} />
        </button>
        <div className="keyboard-hint"><kbd>←</kbd><kbd>→</kbd><span>section</span></div>
      </div>
    </div>
  )
}

function LoadingWorkbench({ error }: { error?: string }) {
  return (
    <div className="workbench loading-workbench" role={error ? 'alert' : 'status'}>
      <Waves className="loading-wave" size={30} />
      <strong>{error ? 'The proof data could not be loaded.' : 'Loading 46 proof steps…'}</strong>
      <p>{error ?? 'Reading tactics and goal states.'}</p>
    </div>
  )
}

function App() {
  const [proof, setProof] = useState<ProofData>()
  const [loadError, setLoadError] = useState<string>()
  const [step, setStep] = useState(initialStepFromHash)
  const [lens, setLens] = useState<Lens>('both')
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}data/navier-stokes-proof.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<ProofData>
      })
      .then((data) => {
        if (data.schemaVersion !== 1 || data.actions.length === 0) throw new Error('Unsupported proof data')
        setProof(data)
        setStep((current) => Math.min(Math.max(current, 0), data.actions.length - 1))
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLoadError(error instanceof Error ? error.message : 'Unknown error')
      })
    return () => controller.abort()
  }, [])

  const goToStep = useCallback((nextStep: number) => {
    if (!proof) return
    setStep(Math.min(Math.max(nextStep, 0), proof.actions.length - 1))
  }, [proof])

  useEffect(() => {
    if (!proof) return
    window.history.replaceState(null, '', `#step-${step + 1}`)
  }, [proof, step])

  useEffect(() => {
    if (!isPlaying || !proof) return
    const timer = window.setInterval(() => {
      setStep((current) => {
        if (current >= proof.actions.length - 1) {
          setIsPlaying(false)
          return current
        }
        return current + 1
      })
    }, 2800)
    return () => window.clearInterval(timer)
  }, [isPlaying, proof])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]')) return
        const currentStage = stageForStep(step)
        const currentStageIndex = proofStages.findIndex(({ id }) => id === currentStage.id)
        const direction = event.key === 'ArrowLeft' ? -1 : 1
        const nextStage = proofStages[currentStageIndex + direction]
        if (nextStage) {
          event.preventDefault()
          goToStep(nextStage.range[0])
        }
      }
      if (event.key === ' ' && !event.repeat) {
        if (target instanceof HTMLElement && target.closest('button, a, input, textarea, select, summary, [contenteditable="true"]')) return
        event.preventDefault()
        setIsPlaying((playing) => !playing)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goToStep, step])

  const activeStage = stageForStep(step)
  const activeAction = proof?.actions[step]
  const stageIndex = proofStages.findIndex(({ id }) => id === activeStage.id)
  const stageProgress = useMemo(() => {
    const [start, end] = activeStage.range
    return end === start ? 1 : (step - start) / (end - start)
  }, [activeStage, step])

  const toggleProofPlayback = useCallback(() => {
    if (!proof) return
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    if (step >= proof.actions.length - 1) setStep(0)
    setIsPlaying(true)
  }, [isPlaying, proof, step])

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Blow-Up Lab home">
          <span className="brand-mark"><Waves size={20} /></span>
          <span>BLOW·UP <strong>LAB</strong></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#singularity">Singularity</a>
          <a href="#journey">Proof</a>
          <a href="#references">References</a>
        </nav>
        <a className="github-link" href={repositoryUrl} target="_blank" rel="noreferrer">
          <GitFork size={17} /> <span>Repository</span>
        </a>
      </header>

      <main id="top">
        <div className="hero-chapter">
          <section className="hero-section">
            <div className="hero-copy">
              <h1>OpenAI’s Navier–Stokes blowup proof <em>meets Lean 4</em></h1>
              <div className="hero-actions">
                <a className="primary-action" href="#journey">Explore the proof <ArrowDown size={17} /></a>
                <a className="secondary-action" href={paperUrl} target="_blank" rel="noreferrer">Read the paper <ExternalLink size={15} /></a>
              </div>
            </div>

            <div className="hero-visual" id="singularity">
              <CorePreview />
              <div className="theorem-card">
                <div className="theorem-card-top">
                  <span><Target size={15} /> Formal target</span>
                  <span className="verified"><CheckCircle2 size={14} /> checked</span>
                </div>
                <code>navier_stokes_breakdown_R3</code>
                <p>For every positive viscosity <InlineMath>{String.raw`\nu > 0`}</InlineMath>, there are smooth data for which no globally smooth finite-energy solution exists.</p>
                <div className="theorem-card-footer">
                  <span><InlineMath>{String.raw`\mathbb{R}^3`}</InlineMath></span>
                  <span><InlineMath>{String.raw`\nu > 0`}</InlineMath></span>
                  <span>finite-time blow-up</span>
                </div>
              </div>
            </div>
          </section>

          <section className="validation-ribbon" aria-label="Validation status">
            <span className="ribbon-intro"><ShieldCheck size={18} /> Checked by</span>
            <span>Lean kernel</span><i />
            <span>Comparator</span><i />
            <span>Nanoda</span><i />
            <span>standard axioms only</span>
          </section>
        </div>

        <section className="journey-section" id="journey">
          <div className="section-heading">
            <div>
              <h2>See the proof unfold in Lean.</h2>
              <p>Follow the singular candidate through scaling and uniqueness to the final <code>exact</code>.</p>
            </div>
            <div className="lens-switcher" aria-label="Reading mode">
              {([
                ['story', BookOpen, 'Mathematics'],
                ['both', Sparkles, 'Together'],
                ['lean', Code2, 'Lean'],
              ] as const).map(([value, Icon, label]) => (
                <button type="button" key={value} className={lens === value ? 'active' : ''} onClick={() => setLens(value)} aria-pressed={lens === value}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="explorer-grid">
            <StageRail
              activeStage={activeStage}
              isPlaying={isPlaying}
              playbackDisabled={!proof}
              onSelect={(stage) => goToStep(stage.range[0])}
              onTogglePlayback={toggleProofPlayback}
            />

            <article className="stage-content" id="lean-replay">
              <header className="stage-header">
                <div className="stage-index">{activeStage.number}</div>
                <div>
                  <span className="stage-label">{activeStage.label}</span>
                  <h2>{activeStage.title}</h2>
                  <p><MathText>{activeStage.summary}</MathText></p>
                </div>
              </header>

              <div className="stage-progress" aria-label={`Stage ${stageIndex + 1} progress`}>
                <span style={{ width: `${Math.max(4, stageProgress * 100)}%` }} />
              </div>

              {lens !== 'lean' && <StoryPanel stage={activeStage} />}

              {lens !== 'story' && (
                <section className="replay-section" aria-label="Lean proof replay">
                  {activeAction && proof ? (
                    <ProofWorkbench
                      key={activeAction.index}
                      action={activeAction}
                      total={proof.actions.length}
                      onPrevious={() => goToStep(step - 1)}
                      onNext={() => goToStep(step + 1)}
                      onRestart={() => goToStep(0)}
                    />
                  ) : <LoadingWorkbench error={loadError} />}

                  {proof && (
                    <div className="proof-timeline" aria-label="All proof moves">
                      {proof.actions.map((action) => {
                        const actionStage = stageForStep(action.index)
                        return (
                          <button
                            type="button"
                            key={action.index}
                            className={`${action.index === step ? 'active' : ''}${actionStage.id !== activeStage.id ? ' other-stage' : ''}`}
                            onClick={() => goToStep(action.index)}
                            aria-label={`Go to proof move ${action.index + 1}`}
                            title={`${action.index + 1}. ${lessonFor(action).label}`}
                          />
                        )
                      })}
                    </div>
                  )}
                </section>
              )}

              <div className="stage-concepts">
                <span>Used here</span>
                {activeStage.concepts.map((concept) => <span className="tag" key={concept}>{concept}</span>)}
                {activeStage.leanFocus.map((concept) => <span className="tag lean-tag" key={concept}>{concept}</span>)}
              </div>
            </article>
          </div>

          <aside className="verification-band" id="verification" aria-label="Proof verification">
            <div className="verification-grid">
              <article>
                <span className="verification-icon"><CheckCircle2 size={21} /></span>
                <h3>Lean kernel</h3>
                <p><code>navier_stokes_breakdown_R3</code> type-checks with no <code>sorry</code>. Its only axioms are <code>propext</code>, <code>Classical.choice</code>, and <code>Quot.sound</code>.</p>
              </article>
              <article>
                <span className="verification-icon"><Braces size={21} /></span>
                <h3>Comparator</h3>
                <p>A separately compiled challenge module checks that the exported theorem has the formal statement expected by Comparator.</p>
              </article>
              <article>
                <span className="verification-icon"><ShieldCheck size={21} /></span>
                <h3>Independent kernel</h3>
                <p>Nanoda also accepts the exported proof term. Its checker is independent of Lean’s kernel implementation.</p>
              </article>
              <article className="boundary-card">
                <span className="verification-icon"><CircleHelp size={21} /></span>
                <h3>Scope of the checks</h3>
                <p>The checks certify the formal proof. Whether the definitions and hypotheses faithfully express the intended PDE theorem still requires mathematical review.</p>
              </article>
            </div>
            <a className="text-link" href={`${repositoryUrl}#validation-status`} target="_blank" rel="noreferrer">
              Read the repository’s validation statement <ArrowRight size={15} />
            </a>
          </aside>
        </section>

        <ReferenceLibrary paperUrl={paperUrl} />
      </main>

      <footer>
        <div className="footer-brand"><span className="brand-mark"><Waves size={18} /></span><strong>Blow-Up Lab</strong></div>
        <p>A close reading of the Navier–Stokes and Euler formalizations.</p>
        <div className="footer-links">
          <a href={paperUrl} target="_blank" rel="noreferrer"><BookOpen size={15} /> Paper</a>
          <a href={repositoryUrl} target="_blank" rel="noreferrer"><GitFork size={15} /> Source</a>
        </div>
      </footer>
    </div>
  )
}

export default App
