import type { ProofAction, ProofStage, StepLesson } from './types'

export const proofStages: ProofStage[] = [
  {
    id: 'candidate',
    number: '01',
    label: 'Construction',
    title: 'Bring in the singular flow',
    range: [0, 0],
    summary: 'The construction has already produced a compactly supported solution, smooth for t < 1 and singular at t = 1.',
    story:
      'We begin with the theorem that packages the candidate. It gives us a velocity u, pressure p, and force f, together with a record h of everything proved about them. The record says that u solves viscosity-one Navier–Stokes for t < 1, stays compactly supported in space, and cannot agree there with a globally smooth velocity through time 1.',
    bridge:
      'One obtain line brings u, p, f, and h into scope. From this point on, Lean uses the construction theorem as a black box.',
    leanFocus: ['obtain', 'existential witnesses', 'structure projections'],
    concepts: ['compact support', 'blow-up candidate', 'viscosity one'],
    question: 'What should be in the context after obtain?',
    answer: 'Four names: u, p, f, and h. The first three are the fields; h carries their equation, support, smoothness, and non-agreement properties.',
  },
  {
    id: 'admissible-data',
    number: '02',
    label: 'Admissible data',
    title: 'Make the force admissible',
    range: [1, 3],
    summary: 'Compact support supplies the decay condition; the factor ν² supplies the right scaling.',
    story:
      'Now fix ν > 0. The initial velocity is still zero, but the force becomes ν²f. Since f is smooth and compactly supported in space, the rescaled force satisfies Comparator’s weighted decay condition.',
    bridge:
      'A short lemma derives the required decay predicate from the support theorem. refine can then commit to zero initial data and the rescaled force.',
    leanFocus: ['obtain', 'have', 'refine'],
    concepts: ['force decay', 'rescaling', 'theorem witnesses'],
    question: 'Why can compact support prove a decay condition?',
    answer: 'Outside one compact set the force vanishes. On the compact set, smoothness bounds every weighted derivative that the condition asks for.',
  },
  {
    id: 'normalization',
    number: '03',
    label: 'Contradiction & scaling',
    title: 'Scale away the viscosity',
    range: [4, 22],
    summary: 'A supposed global solution at viscosity ν can be rescaled to viscosity one, where the singular candidate is waiting.',
    story:
      'Assume, for contradiction, that v and q solve the problem globally. We define v₁ and q₁ by rescaling space, time, and amplitude with powers of ν⁻¹. Most of this stage is bookkeeping: proving that the new fields are smooth and divergence-free, satisfy the normalized equation, remain in L², and carry a uniform energy bound.',
    bridge:
      'The scaling puts v₁ and the candidate u under the same viscosity-one equation and the same force. The uniqueness theorem now applies to both.',
    leanFocus: ['rintro', 'let', 'refine', 'record goals', 'simp'],
    concepts: ['proof by contradiction', 'scaling symmetry', 'record construction'],
    question: 'Why are there five goals after refine?',
    answer: 'GlobalSolutionRn is a structure. Smoothness was filled first; the initial-value, divergence, equation, integrability, and energy fields are still open.',
  },
  {
    id: 'comparison',
    number: '04',
    label: 'Comparison setup',
    title: 'Work below the singular time',
    range: [23, 42],
    summary: 'Fix t < 1. On [0,t], the candidate has compact support and the rescaled global solution has finite energy.',
    story:
      'At t = 0 the two velocities agree because both initial data are zero. For t > 0, we put both solutions on the closed slab [0,t]. The singular time is still ahead: u is smooth and compactly supported there, and v₁ inherits a global energy bound. Those are the hypotheses needed for whole-space uniqueness.',
    bridge:
      'The interval stops short of time 1. The proof asks for no regularity at the singular endpoint.',
    leanFocus: ['apply', 'by_cases', 'subset goals', 'closure_minimal'],
    concepts: ['time slab', 'support closure', 'finite energy'],
    question: 'Why split the case t = 0 from t > 0?',
    answer: 'The uniqueness theorem requires a strictly positive interval length. At t = 0, equality follows directly from the two initial conditions.',
  },
  {
    id: 'contradiction',
    number: '05',
    label: 'Uniqueness',
    title: 'Let uniqueness finish the proof',
    range: [43, 45],
    summary: 'Uniqueness forces u = v₁ before time one. The candidate theorem says that no globally smooth v₁ can do this.',
    story:
      'Take any t < 1. Finite-energy uniqueness identifies u and v₁ throughout [0,t] × ℝ³. Repeating the argument for every such t gives exactly the pointwise agreement ruled out by h.not_global_agreement. There is the contradiction.',
    bridge:
      'apply h.not_global_agreement turns the target False into the missing agreement statement. The final exact supplies it from uniqueness.',
    leanFocus: ['uniqueness theorem', 'simpa', 'exact'],
    concepts: ['classical uniqueness', 'global exclusion', 'contradiction'],
    question: 'Where is the final contradiction in the Lean text?',
    answer: 'apply h.not_global_agreement sets the trap. The final exact supplies the agreement it forbids, and the outer application closes False.',
  },
]

const exactLessons: Record<number, StepLesson> = {
  0: {
    label: 'Open the construction package',
    summary: 'The construction theorem returns u, p, f, and a proof record h. obtain gives each one a name.',
    detail: 'The angle-bracket pattern follows the nested existential returned by the theorem.',
    concept: 'existential elimination',
  },
  2: {
    label: 'Get decay from compact support',
    summary: 'The force vanishes outside a compact set, so its rescaled version meets Comparator’s decay condition.',
    detail: 'Lean infers the type of hForceDecay from the result type of forceConditionDecay.',
    concept: 'local lemma',
  },
  3: {
    label: 'Commit to the data',
    summary: 'The witnesses are zero initial velocity and ν²f. refine writes them down and leaves non-existence as the goal.',
    detail: 'Each ?_ passed to refine becomes a new goal; the supplied tuple fields disappear.',
    concept: 'refinement',
  },
  4: {
    label: 'Assume a global solution',
    summary: 'Suppose v and q solve the problem globally, and name the accompanying proof hGlobal.',
    detail: 'The target is a negated existential. rintro opens its witnesses and leaves False.',
    concept: 'contradiction',
  },
  5: {
    label: 'Name the scaled velocity',
    summary: 'Define v₁ by rescaling space, time, and velocity amplitude with ν⁻¹.',
    detail: 'let gives the expression a local name, so later goals can refer to v₁.',
    concept: 'local definition',
  },
  6: {
    label: 'Name the scaled pressure',
    summary: 'Define pressure with the matching ν⁻² amplitude and ν⁻¹ spacetime scale.',
    detail: 'These powers make the normalized pressure gradient match the other terms in the equation.',
    concept: 'PDE scaling',
  },
  7: {
    label: 'Build the normalized solution',
    summary: 'Prove locally that v₁ and q₁ form a viscosity-one global solution.',
    detail: 'have preserves the contradiction as the main goal while Lean focuses on this claim.',
    concept: 'have with a hole',
  },
  11: {
    label: 'Open the structure goals',
    summary: 'Provide smoothness first. Lean displays the five fields of GlobalSolutionRn that remain.',
    detail: 'The goals cover initial data, incompressibility, the equation, spatial L² integrability, and uniform energy.',
    concept: 'structure constructor',
  },
  14: {
    label: 'Check incompressibility',
    summary: 'The velocity rescaling carries zero divergence to zero divergence.',
    detail: 'The atomic block groups several rewrites into one displayed replay step.',
    concept: 'equational rewriting',
  },
  15: {
    label: 'Check the scaled equation',
    summary: 'Rewrite every term of Navier–Stokes under scaling and cancel the viscosity factors.',
    detail: 'Each term picks up the appropriate power of ν, and the factors cancel.',
    concept: 'scaling covariance',
  },
  18: {
    label: 'Take the energy bound',
    summary: 'Take an energy bound E and proof hE from the assumed global solution.',
    detail: 'The existential is now represented by E and hE in the local context.',
    concept: 'witness extraction',
  },
  22: {
    label: 'Scale the energy estimate',
    summary: 'Multiply the original strict bound by the positive factor ν⁻².',
    detail: 'Positivity preserves the direction and strictness of the inequality.',
    concept: 'ordered multiplication',
  },
  23: {
    label: 'Use the no-agreement theorem',
    summary: 'False now follows from agreement between the candidate and normalized solution before time one.',
    detail: 'apply h.not_global_agreement replaces the contradiction with the pointwise agreement expected by that theorem.',
    concept: 'backward reasoning',
  },
  26: {
    label: 'Separate t = 0',
    summary: 'Prove the t = 0 case from initial data; send t > 0 to uniqueness.',
    detail: 'by_cases supplies t = 0 and t ≠ 0 as hypotheses in separate goals.',
    concept: 'case split',
  },
  30: {
    label: 'Stay below time one',
    summary: 'Show that the comparison slab [0,t] lies before the singular time.',
    detail: 'The bound t < 1 puts every point of the closed slab in preSingularDomain.',
    concept: 'set inclusion',
  },
  36: {
    label: 'Pass to topological support',
    summary: 'Deduce containment of the topological support from vanishing outside K.',
    detail: 'Because tsupport is a closure, closure_minimal needs ordinary support containment and closedness of K.',
    concept: 'topological support',
  },
  42: {
    label: 'Reuse the global energy bound',
    summary: 'Specialize the global energy bound to the interval [0,t].',
    detail: 'The same constant bounds every time in the smaller slab.',
    concept: 'hypothesis specialization',
  },
  43: {
    label: 'Call whole-space uniqueness',
    summary: 'Apply the whole-space finite-energy uniqueness theorem to u and v₁ on [0,t].',
    detail: 'Its arguments supply smoothness, support, energy, divergence, the two equations, and their common initial value.',
    concept: 'major theorem application',
  },
  44: {
    label: 'Put both equations in the same form',
    summary: 'Rewrite the two equation hypotheses into the form required by the uniqueness theorem.',
    detail: 'simpa unfolds wrappers and removes the coefficient 1 before transitivity combines the equalities.',
    concept: 'definitional rewriting',
  },
  45: {
    label: 'Specialize and finish',
    summary: 'Evaluate uniqueness at the chosen time and point.',
    detail: 'exact fills the equality requested by h.not_global_agreement, so the proof ends.',
    concept: 'goal closure',
  },
}

const inferredLessons: Array<{
  test: (tactic: string) => boolean
  lesson: Omit<StepLesson, 'label'> & { label: string }
}> = [
  {
    test: (tactic) => tactic.startsWith('obtain'),
    lesson: {
      label: 'Name the witnesses',
      summary: 'The theorem returns data hidden behind ∃. obtain gives those values names.',
      detail: 'The pattern after obtain matches the shape of the theorem’s conclusion.',
      concept: 'obtain',
    },
  },
  {
    test: (tactic) => tactic.startsWith('have'),
    lesson: {
      label: 'Set aside a fact',
      summary: 'Prove one fact now and give it a name for later.',
      detail: 'have adds the fact to the local context without changing the main target.',
      concept: 'have',
    },
  },
  {
    test: (tactic) => tactic.startsWith('intro'),
    lesson: {
      label: 'Bring assumptions into scope',
      summary: 'Name the quantified values and assumptions at the front of the goal.',
      detail: 'intro replaces binders at the front of the goal with local variables and hypotheses.',
      concept: 'intro',
    },
  },
  {
    test: (tactic) => tactic.startsWith('refine'),
    lesson: {
      label: 'Fill what is already known',
      summary: 'Write the known pieces of the proof term and leave holes for the rest.',
      detail: 'refine accepts a partial proof term; each ?_ becomes an obligation.',
      concept: 'refine',
    },
  },
  {
    test: (tactic) => tactic.startsWith('simp') || tactic.startsWith('simpa'),
    lesson: {
      label: 'Clear the routine algebra',
      summary: 'Unfold definitions and apply the usual simplification rules.',
      detail: 'simpa closes the goal when the simplified target matches the supplied proof.',
      concept: 'simplification',
    },
  },
  {
    test: (tactic) => tactic.startsWith('rw'),
    lesson: {
      label: 'Rewrite the goal',
      summary: 'Replace expressions with equal terms from named equations.',
      detail: 'rw applies each listed equality to the current goal.',
      concept: 'rewriting',
    },
  },
  {
    test: (tactic) => tactic.startsWith('exact'),
    lesson: {
      label: 'Close the goal',
      summary: 'Give Lean a term whose type is the current target.',
      detail: 'exact checks one proof term against the current target.',
      concept: 'exact',
    },
  },
  {
    test: (tactic) => tactic.startsWith('apply'),
    lesson: {
      label: 'Work backward from a theorem',
      summary: 'Choose a theorem that proves the target once its premises are available.',
      detail: 'apply turns those premises into new goals.',
      concept: 'apply',
    },
  },
  {
    test: (tactic) => tactic.startsWith('let'),
    lesson: {
      label: 'Give the expression a name',
      summary: 'Introduce a local definition so later lines can use a short name.',
      detail: 'The local context records the name together with its defining value.',
      concept: 'let',
    },
  },
]

export function lessonFor(action: ProofAction): StepLesson {
  const exact = exactLessons[action.index]
  if (exact) return exact

  const inferred = inferredLessons.find(({ test }) => test(action.tacticText.trim()))
  if (inferred) return inferred.lesson

  return {
    label: 'Read the state change',
    summary: 'The displayed tactic turns the left-hand goal state into the right-hand one.',
    detail: 'New hypotheses are marked in green; a missing right-hand goal means the tactic closed it.',
    concept: 'tactic step',
  }
}

export function stageForStep(step: number): ProofStage {
  return proofStages.find(({ range }) => step >= range[0] && step <= range[1]) ?? proofStages[0]
}
