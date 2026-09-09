import type { ProofAction, ProofStage, StepLesson } from './types'

export const proofStages: ProofStage[] = [
  {
    id: 'candidate',
    number: '01',
    label: 'Construction',
    title: 'Select the singular candidate',
    range: [0, 0],
    summary: 'Take the compactly supported solution that is smooth for t < 1 and singular at t = 1.',
    story:
      'Earlier files construct a velocity u, pressure p, and force f. The resulting theorem records the facts needed here: u solves viscosity-one Navier–Stokes for t < 1, has compact spatial support, and cannot coincide there with a globally smooth velocity through time 1.',
    bridge:
      'Lean opens the existential package returned by the construction. None of the lemmas used to build that package are unfolded here.',
    leanFocus: ['obtain', 'existential witnesses', 'structure projections'],
    concepts: ['compact support', 'blow-up candidate', 'viscosity one'],
    question: 'Which objects should now appear in the local context?',
    answer: 'The context gains u, p, f, and h. The hypothesis h contains the candidate’s equation, support, smoothness, and non-agreement properties.',
  },
  {
    id: 'admissible-data',
    number: '02',
    label: 'Admissible data',
    title: 'Fit the force to the theorem',
    range: [1, 3],
    summary: 'Use smooth compact support to prove the force-decay condition, then insert the ν-scaled force.',
    story:
      'The theorem takes any ν > 0. Its initial velocity is zero, and its forcing term is ν² times the viscosity-one force. Smooth compact support gives the weighted spatial decay required by Comparator.',
    bridge:
      'The support and scaling lemmas discharge the decay predicate in the theorem’s public statement.',
    leanFocus: ['obtain', 'have', 'refine'],
    concepts: ['force decay', 'rescaling', 'theorem witnesses'],
    question: 'Why can compact support prove a decay condition?',
    answer: 'The force vanishes outside one compact set. Weighted decay is therefore immediate there, while smoothness controls the force on the compact set.',
  },
  {
    id: 'normalization',
    number: '03',
    label: 'Contradiction & scaling',
    title: 'Scale a global solution to viscosity one',
    range: [4, 22],
    summary: 'Assume a global viscosity-ν solution exists and rescale it to viscosity one.',
    story:
      'Suppose for contradiction that v and q form a global solution at viscosity ν. Define v₁ and q₁ by rescaling space, time, and amplitude with powers of ν⁻¹. Lean then fills the GlobalSolutionRn fields for v₁ and q₁: smoothness, initial value, divergence, the equation, L² integrability, and uniform energy.',
    bridge:
      'After scaling, the hypothetical solution has the same viscosity and forcing as the singular candidate, so the uniqueness theorem can compare them.',
    leanFocus: ['rintro', 'let', 'refine', 'record goals', 'simp'],
    concepts: ['proof by contradiction', 'scaling symmetry', 'record construction'],
    question: 'Why does one refine command create five goals?',
    answer: 'GlobalSolutionRn is a structure. Once smoothness is supplied, its initial-value, divergence, equation, integrability, and energy fields remain as separate goals.',
  },
  {
    id: 'comparison',
    number: '04',
    label: 'Comparison setup',
    title: 'Set up uniqueness before t = 1',
    range: [23, 42],
    summary: 'Fix t < 1 and supply the hypotheses required by whole-space uniqueness on [0,t].',
    story:
      'Both velocities vanish at time zero. For 0 < t < 1, restrict them to [0,t]. The candidate is compactly supported on this slab; v₁ has finite energy there because its energy bound is global.',
    bridge:
      'Only compact subintervals of [0,1) enter the uniqueness argument. No regularity at t = 1 is assumed.',
    leanFocus: ['apply', 'by_cases', 'subset goals', 'closure_minimal'],
    concepts: ['time slab', 'support closure', 'finite energy'],
    question: 'Why split the case t = 0 from t > 0?',
    answer: 'The uniqueness theorem requires a strictly positive interval length. At t = 0, equality follows directly from the two initial conditions.',
  },
  {
    id: 'contradiction',
    number: '05',
    label: 'Uniqueness',
    title: 'Derive the contradiction from uniqueness',
    range: [43, 45],
    summary: 'Uniqueness gives u = v₁ before t = 1, which the candidate theorem forbids for any globally smooth v₁.',
    story:
      'For every t < 1, finite-energy uniqueness identifies u with v₁ on [0,t] × ℝ³. Since v₁ is globally smooth, this pointwise agreement violates h.not_global_agreement.',
    bridge:
      'apply h.not_global_agreement changes False into an agreement goal. The last exact proves that goal using uniqueness and closes the contradiction.',
    leanFocus: ['uniqueness theorem', 'simpa', 'exact'],
    concepts: ['classical uniqueness', 'global exclusion', 'contradiction'],
    question: 'Where is the final contradiction in the Lean text?',
    answer: 'apply h.not_global_agreement sets it up. The last exact supplies the requested pointwise agreement, so the outer application closes False.',
  },
]

const exactLessons: Record<number, StepLesson> = {
  0: {
    label: 'Unpack the construction',
    summary: 'Open the existential theorem and name its velocity, pressure, force, and proof bundle.',
    detail: 'The angle-bracket pattern matches the four fields returned by the theorem.',
    concept: 'existential elimination',
  },
  2: {
    label: 'Derive force decay',
    summary: 'Apply the compact-support and scaling lemmas to prove the force condition in the public theorem.',
    detail: 'Lean infers the type of hForceDecay from the result type of forceConditionDecay.',
    concept: 'local lemma',
  },
  3: {
    label: 'Choose the theorem witnesses',
    summary: 'Use zero for the initial velocity and ν²f for the force. Their non-existence claim remains to be proved.',
    detail: 'Each ?_ passed to refine becomes a new goal; the supplied tuple fields disappear.',
    concept: 'refinement',
  },
  4: {
    label: 'Assume the forbidden solution',
    summary: 'Introduce the supposed global velocity v, pressure q, and proof that they solve the equation.',
    detail: 'The target is a negated existential. rintro opens its witnesses and leaves False.',
    concept: 'contradiction',
  },
  5: {
    label: 'Rescale velocity',
    summary: 'Define v₁ by rescaling space, time, and velocity amplitude with ν⁻¹.',
    detail: 'let gives the expression a local name, so later goals can refer to v₁.',
    concept: 'local definition',
  },
  6: {
    label: 'Rescale pressure',
    summary: 'Define pressure with the matching ν⁻² amplitude and ν⁻¹ spacetime scale.',
    detail: 'These powers make the normalized pressure gradient match the other terms in the equation.',
    concept: 'PDE scaling',
  },
  7: {
    label: 'Prove the normalized fields solve the equation',
    summary: 'Start a local proof that v₁ and q₁ form a viscosity-one global solution.',
    detail: 'have preserves the contradiction as the main goal while Lean focuses on this claim.',
    concept: 'have with a hole',
  },
  11: {
    label: 'Split the solution structure',
    summary: 'Provide the smoothness field of GlobalSolutionRn, then display its five remaining fields.',
    detail: 'The goals cover initial data, incompressibility, the equation, spatial L² integrability, and uniform energy.',
    concept: 'structure constructor',
  },
  14: {
    label: 'Preserve incompressibility',
    summary: 'Show the velocity rescaling carries zero divergence to zero divergence.',
    detail: 'The atomic block groups several rewrites into one displayed replay step.',
    concept: 'equational rewriting',
  },
  15: {
    label: 'Preserve the equation',
    summary: 'Rewrite every term of Navier–Stokes under scaling and cancel the viscosity factors.',
    detail: 'The time derivative, nonlinear term, Laplacian, pressure gradient, and force acquire matching powers of ν.',
    concept: 'scaling covariance',
  },
  18: {
    label: 'Extract the energy bound',
    summary: 'Take an energy bound E and proof hE from the assumed global solution.',
    detail: 'The existential is now represented by E and hE in the local context.',
    concept: 'witness extraction',
  },
  22: {
    label: 'Transfer bounded energy',
    summary: 'Multiply the original strict bound by the positive factor ν⁻².',
    detail: 'Positivity preserves the direction and strictness of the inequality.',
    concept: 'ordered multiplication',
  },
  23: {
    label: 'Invoke the blow-up certificate',
    summary: 'To derive False, prove that the candidate and normalized solution agree before time one.',
    detail: 'apply h.not_global_agreement replaces the contradiction with the pointwise agreement expected by that theorem.',
    concept: 'backward reasoning',
  },
  26: {
    label: 'Split time zero from positive time',
    summary: 'Prove the t = 0 case from initial data; send t > 0 to uniqueness.',
    detail: 'by_cases supplies t = 0 and t ≠ 0 as hypotheses in separate goals.',
    concept: 'case split',
  },
  30: {
    label: 'Restrict the candidate domain',
    summary: 'Show that the comparison slab [0,t] lies before the singular time.',
    detail: 'The bound t < 1 puts every point of the closed slab in preSingularDomain.',
    concept: 'set inclusion',
  },
  36: {
    label: 'Keep support uniformly compact',
    summary: 'Deduce containment of the topological support from vanishing outside K.',
    detail: 'Because tsupport is a closure, closure_minimal needs ordinary support containment and closedness of K.',
    concept: 'topological support',
  },
  42: {
    label: 'Restrict global energy',
    summary: 'Specialize the global energy bound to the interval [0,t].',
    detail: 'The same constant bounds every time in the smaller slab.',
    concept: 'hypothesis specialization',
  },
  43: {
    label: 'Apply whole-space uniqueness',
    summary: 'Apply the whole-space finite-energy uniqueness theorem to u and v₁ on [0,t].',
    detail: 'Its arguments supply smoothness, support, energy, divergence, the two equations, and their common initial value.',
    concept: 'major theorem application',
  },
  44: {
    label: 'Match the two equation conventions',
    summary: 'Rewrite the two equation hypotheses into the convention expected by uniqueness.',
    detail: 'simpa unfolds wrappers and removes the coefficient 1 before transitivity combines the equalities.',
    concept: 'definitional rewriting',
  },
  45: {
    label: 'Close pointwise agreement',
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
      label: 'Extract witnesses',
      summary: 'Unpack an existential statement into named data and hypotheses.',
      detail: 'obtain applies a theorem and pattern-matches on the result.',
      concept: 'obtain',
    },
  },
  {
    test: (tactic) => tactic.startsWith('have'),
    lesson: {
      label: 'Record an intermediate fact',
      summary: 'Add a named fact for use later in the proof.',
      detail: 'have grows the local context while preserving the current main goal.',
      concept: 'have',
    },
  },
  {
    test: (tactic) => tactic.startsWith('intro'),
    lesson: {
      label: 'Introduce assumptions',
      summary: 'Move quantified values or assumptions into the local context.',
      detail: 'intro replaces binders at the front of the goal with local variables and hypotheses.',
      concept: 'intro',
    },
  },
  {
    test: (tactic) => tactic.startsWith('refine'),
    lesson: {
      label: 'Refine the target',
      summary: 'Fill the known pieces of a construction and leave explicit holes as new goals.',
      detail: 'refine accepts a partial proof term; each ?_ becomes an obligation.',
      concept: 'refine',
    },
  },
  {
    test: (tactic) => tactic.startsWith('simp') || tactic.startsWith('simpa'),
    lesson: {
      label: 'Normalize the expression',
      summary: 'Unfold definitions and rewrite routine identities.',
      detail: 'simpa closes the goal when the simplified target matches the supplied proof.',
      concept: 'simplification',
    },
  },
  {
    test: (tactic) => tactic.startsWith('rw'),
    lesson: {
      label: 'Rewrite with equalities',
      summary: 'Replace expressions using named equations.',
      detail: 'rw applies each listed equality to the current goal.',
      concept: 'rewriting',
    },
  },
  {
    test: (tactic) => tactic.startsWith('exact'),
    lesson: {
      label: 'Supply the exact proof',
      summary: 'Close the current goal with a term whose type already matches it.',
      detail: 'exact checks one proof term against the current target.',
      concept: 'exact',
    },
  },
  {
    test: (tactic) => tactic.startsWith('apply'),
    lesson: {
      label: 'Reason backward',
      summary: 'Replace the target with the premises of a theorem that proves it.',
      detail: 'apply turns those premises into new goals.',
      concept: 'apply',
    },
  },
  {
    test: (tactic) => tactic.startsWith('let'),
    lesson: {
      label: 'Name a local construction',
      summary: 'Introduce a definition that keeps later expressions readable.',
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
    label: 'Advance the argument',
    summary: 'Apply the displayed tactic to the current proof state.',
    detail: 'The before and after panes show the resulting change.',
    concept: 'tactic step',
  }
}

export function stageForStep(step: number): ProofStage {
  return proofStages.find(({ range }) => step >= range[0] && step <= range[1]) ?? proofStages[0]
}
