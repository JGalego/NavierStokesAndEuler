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
import { lessonFor, proofStages, stageForStep } from './proofContent'
import type { GoalSnapshot, Lens, ProofAction, ProofData, ProofStage } from './types'

const repositoryUrl = 'https://github.com/JGalego/NavierStokesAndEuler'
const sourceUrl = `${repositoryUrl}/blob/feat/proof-animation/NavierStokes/ComparatorProofAnimation.lean`

const stageBeats: Record<string, string[]> = {
  candidate: ['unpack u, p, and f', 'read the certificate h', 'keep the construction folded'],
  'admissible-data': ['use compact support', 'replace f by ν²f', 'prove the decay condition'],
  normalization: ['suppose v and q exist', 'rescale by ν⁻¹', 'verify the new solution'],
  comparison: ['fix 0 ≤ t < 1', 'work on [0,t]', 'apply uniqueness'],
  contradiction: ['obtain u = v₁', 'use smoothness of v₁', 'contradict h'],
}

function initialStepFromHash() {
  const match = window.location.hash.match(/^#step-(\d+)$/)
  return match ? Number(match[1]) - 1 : 0
}

function FlowField() {
  return (
    <svg className="flow-field" viewBox="0 0 720 540" aria-hidden="true">
      <defs>
        <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#78e8d0" />
          <stop offset="0.48" stopColor="#66a8ff" />
          <stop offset="1" stopColor="#b486ff" />
        </linearGradient>
        <radialGradient id="vortexGlow">
          <stop offset="0" stopColor="#7cebd5" stopOpacity="0.52" />
          <stop offset="1" stopColor="#7cebd5" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <circle cx="470" cy="250" r="180" fill="url(#vortexGlow)" filter="url(#softGlow)" />
      {[
        'M-30 134 C 142 58, 220 225, 385 173 S 596 30, 772 119',
        'M-34 185 C 140 98, 255 276, 417 200 S 610 76, 762 163',
        'M-44 239 C 131 139, 268 327, 448 226 S 625 129, 770 214',
        'M-22 301 C 152 184, 290 376, 485 257 S 646 193, 759 278',
        'M20 365 C 182 235, 323 424, 520 294 S 654 262, 737 350',
        'M92 428 C 228 302, 374 462, 557 338 S 649 340, 695 433',
      ].map((path, index) => (
        <path key={path} d={path} className={`stream stream-${index + 1}`} />
      ))}
      <path
        d="M386 220 C430 169 520 174 546 234 C575 301 508 363 443 340 C382 318 365 262 403 225 C444 185 509 211 506 258 C503 296 464 311 438 288 C417 269 426 239 450 233"
        className="vortex-line"
      />
      <circle cx="450" cy="256" r="6" fill="#c9fff3" className="vortex-core" />
      <circle cx="450" cy="256" r="23" className="vortex-ring" />
    </svg>
  )
}

function StageRail({ activeStage, onSelect }: { activeStage: ProofStage; onSelect: (stage: ProofStage) => void }) {
  return (
    <aside className="stage-rail" aria-label="Proof stages">
      <div className="rail-heading">
        <span className="section-kicker">Proof outline</span>
        <span className="rail-count">5 parts</span>
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
        <p className="story-lead">{stage.story}</p>
        <p className="bridge-note"><span>In Lean</span>{stage.bridge}</p>
      </div>
      <div className="concept-flow" aria-label={`Outline for ${stage.title}`}>
        {stageBeats[stage.id].map((beat, index) => (
          <div className="concept-beat" key={beat}>
            <span>{index + 1}</span>
            <strong>{beat}</strong>
            {index < stageBeats[stage.id].length - 1 && <ArrowRight size={15} aria-hidden="true" />}
          </div>
        ))}
      </div>
      <details className="checkpoint">
        <summary><CircleHelp size={17} /> Pause and check</summary>
        <p className="checkpoint-question">{stage.question}</p>
        <p className="checkpoint-answer"><Lightbulb size={16} /> {stage.answer}</p>
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
  isPlaying,
  onPlayingChange,
  onPrevious,
  onNext,
  onRestart,
}: {
  action: ProofAction
  total: number
  isPlaying: boolean
  onPlayingChange: (playing: boolean) => void
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
        <span className="file-label">ComparatorProofAnimation.lean</span>
        <span className="step-counter">move {action.index + 1} / {total}</span>
      </div>

      <div className="tactic-section">
        <div className="tactic-meta">
          <div>
            <span className="section-kicker">Lean move</span>
            <h3>{lesson.label}</h3>
          </div>
          <span className="concept-pill"><Braces size={14} /> {lesson.concept}</span>
        </div>
        <pre className="tactic-code"><span className="prompt">by</span> {action.tacticText}</pre>
        <div className="lesson-grid">
          <p>{lesson.summary}</p>
          <p className="lean-detail"><Lightbulb size={16} /> {lesson.detail}</p>
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
        <button
          type="button"
          className="play-button"
          onClick={() => onPlayingChange(!isPlaying)}
          aria-label={isPlaying ? 'Pause proof playback' : 'Play proof'}
        >
          {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
          {isPlaying ? 'Pause' : 'Play proof'}
        </button>
        <button type="button" className="icon-button" onClick={onNext} disabled={action.index === total - 1} aria-label="Next proof move">
          <ArrowRight size={18} />
        </button>
        <div className="keyboard-hint"><kbd>←</kbd><kbd>→</kbd><span>move</span></div>
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
      if (target instanceof HTMLElement && target.closest('button, a, input, textarea, summary')) return
      if (event.key === 'ArrowLeft') goToStep(step - 1)
      if (event.key === 'ArrowRight') goToStep(step + 1)
      if (event.key === ' ' && !event.repeat) {
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

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Blow-Up Lab home">
          <span className="brand-mark"><Waves size={20} /></span>
          <span>BLOW·UP <strong>LAB</strong></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#journey">Argument</a>
          <a href="#lean-replay">Lean proof</a>
          <a href="#verification">Checks</a>
        </nav>
        <a className="github-link" href={repositoryUrl} target="_blank" rel="noreferrer">
          <GitFork size={17} /> <span>Repository</span>
        </a>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span /> Navier–Stokes in Lean 4</div>
            <h1>The breakdown proof, with every <em>Lean goal</em> left in view.</h1>
            <p className="hero-lead">
              The argument starts with a compactly supported solution and ends in a contradiction at time one.
              Read the mathematics, inspect the proof state, or keep both on screen.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#journey">Read the argument <ArrowDown size={17} /></a>
              <a className="secondary-action" href={sourceUrl} target="_blank" rel="noreferrer">Open the source <ExternalLink size={15} /></a>
            </div>
            <div className="hero-metrics" aria-label="Proof summary">
              <div><strong>46</strong><span>tactics</span></div>
              <div><strong>5</strong><span>parts</span></div>
              <div><strong>0</strong><span>open goals</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <FlowField />
            <div className="theorem-card">
              <div className="theorem-card-top">
                <span><Target size={15} /> Target theorem</span>
                <span className="verified"><CheckCircle2 size={14} /> checked</span>
              </div>
              <code>navier_stokes_breakdown_R3</code>
              <p><span>∀</span> positive viscosity <strong>ν</strong>, there are smooth data for which no globally smooth finite-energy solution exists.</p>
              <div className="theorem-card-footer">
                <span>ℝ³</span>
                <span>ν &gt; 0</span>
                <span>finite-time blow-up</span>
              </div>
            </div>
            <div className="floating-proof-pill pill-one"><Code2 size={14} /> Lean 4.34</div>
            <div className="floating-proof-pill pill-two"><ShieldCheck size={14} /> Comparator</div>
          </div>
        </section>

        <section className="validation-ribbon" aria-label="Validation status">
          <span className="ribbon-intro"><ShieldCheck size={18} /> Checked by</span>
          <span>Lean kernel</span><i />
          <span>Comparator</span><i />
          <span>Nanoda</span><i />
          <span>3 standard axioms</span>
        </section>

        <section className="journey-section" id="journey">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Read the proof</span>
              <h2>The argument stays beside the goal state.</h2>
              <p>Five parts carry the proof from the singular candidate to the final <code>exact</code>.</p>
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
            <StageRail activeStage={activeStage} onSelect={(stage) => goToStep(stage.range[0])} />

            <article className="stage-content" id="lean-replay">
              <header className="stage-header">
                <div className="stage-index">{activeStage.number}</div>
                <div>
                  <span className="stage-label">{activeStage.label}</span>
                  <h2>{activeStage.title}</h2>
                  <p>{activeStage.summary}</p>
                </div>
              </header>

              <div className="stage-progress" aria-label={`Stage ${stageIndex + 1} progress`}>
                <span style={{ width: `${Math.max(4, stageProgress * 100)}%` }} />
              </div>

              {lens !== 'lean' && <StoryPanel stage={activeStage} />}

              {lens !== 'story' && (
                <section className="replay-section">
                  <div className="replay-heading">
                    <div>
                      <span className="section-kicker">Inside the Lean proof</span>
                      <h2>See what each tactic does to the goal</h2>
                    </div>
                    <a href={sourceUrl} target="_blank" rel="noreferrer">source <ExternalLink size={14} /></a>
                  </div>
                  {activeAction && proof ? (
                    <ProofWorkbench
                      key={activeAction.index}
                      action={activeAction}
                      total={proof.actions.length}
                      isPlaying={isPlaying}
                      onPlayingChange={setIsPlaying}
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
        </section>

        <section className="verification-section" id="verification">
          <div className="verification-heading">
            <span className="section-kicker">Proof checks</span>
            <h2>What has actually been checked</h2>
          </div>
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
        </section>
      </main>

      <footer>
        <div className="footer-brand"><span className="brand-mark"><Waves size={18} /></span><strong>Blow-Up Lab</strong></div>
        <p>A close reading of the Navier–Stokes and Euler formalizations.</p>
        <div className="footer-links">
          <a href={repositoryUrl} target="_blank" rel="noreferrer"><GitFork size={15} /> Source</a>
          <a href={sourceUrl} target="_blank" rel="noreferrer"><Code2 size={15} /> Animated theorem</a>
        </div>
      </footer>
    </div>
  )
}

export default App
