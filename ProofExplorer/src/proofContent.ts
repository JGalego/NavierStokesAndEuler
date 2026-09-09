import type { ProofAction, ProofStage, StepLesson } from './types'

export const proofStages: ProofStage[] = [
  {
    id: 'candidate',
    number: '01',
    label: 'Construction',
    title: 'Choose the unstable flow',
    range: [0, 0],
    summary: 'Start from the compactly supported solution engineered to become singular at time one.',
    story:
      'The difficult construction is already packaged as a candidate velocity u, pressure p, and force f. Its properties say that it solves viscosity-one Navier–Stokes before time one, stays spatially compact, and cannot agree with any globally smooth velocity all the way to the singular time.',
    bridge:
      'The proof does not unfold thousands of construction lemmas here. It selects their certified output and keeps the end-to-end argument readable.',
    leanFocus: ['obtain', 'existential witnesses', 'structure projections'],
    concepts: ['compact support', 'blow-up candidate', 'viscosity one'],
    question: 'What new mathematical objects should appear in the local context?',
    answer: 'A velocity u, pressure p, force f, and a bundle h containing all properties of the constructed candidate.',
  },
  {
    id: 'admissible-data',
    number: '02',
    label: 'Admissible data',
    title: 'Package the force correctly',
    range: [1, 3],
    summary: 'Turn compact spatial support and smoothness into the exact decay assumptions required by the challenge statement.',
    story:
      'The final theorem quantifies over every positive viscosity ν. The viscosity-one force is rescaled by ν², while zero initial velocity is retained. Compact support plus smoothness supplies rapid spatial decay, so these are legitimate Comparator inputs.',
    bridge:
      'This is where the constructed PDE object meets the public theorem interface: analytical support facts become the formal decay predicate expected by Comparator.',
    leanFocus: ['obtain', 'have', 'refine'],
    concepts: ['force decay', 'rescaling', 'theorem witnesses'],
    question: 'Why can compact support prove a decay condition?',
    answer: 'Outside one compact set the force vanishes, so every weighted decay estimate is eventually trivial; smoothness handles behavior inside the set.',
  },
  {
    id: 'normalization',
    number: '03',
    label: 'Contradiction & scaling',
    title: 'Normalize the imagined solution',
    range: [4, 22],
    summary: 'Assume a global viscosity-ν solution exists, then rescale it into a viscosity-one global solution.',
    story:
      'To prove non-existence, suppose the requested global solution v and pressure q exist. Space, time, velocity, and pressure are rescaled so that viscosity ν becomes viscosity one. The proof then verifies every field of the GlobalSolutionRn structure: smoothness, initial data, divergence, the equation, integrability, and a uniform energy bound.',
    bridge:
      'Scaling is the conceptual hinge. It lets one fixed singular candidate defeat a hypothetical solution at every positive viscosity.',
    leanFocus: ['rintro', 'let', 'refine', 'record goals', 'simp'],
    concepts: ['proof by contradiction', 'scaling symmetry', 'record construction'],
    question: 'Why does one refine command create five goals?',
    answer: 'GlobalSolutionRn is a structure. After smoothness is supplied, Lean asks separately for its initial-value, divergence, equation, integrability, and energy fields.',
  },
  {
    id: 'comparison',
    number: '04',
    label: 'Comparison setup',
    title: 'Prepare uniqueness on every safe interval',
    range: [23, 42],
    summary: 'Fix any time before the singularity and assemble the hypotheses needed by whole-space uniqueness.',
    story:
      'At time zero both velocities vanish. For a positive time t < 1, both solutions live on the slab [0,t]. The candidate retains compact support there, while the normalized global solution supplies finite energy. These are precisely the hypotheses of the comparison theorem.',
    bridge:
      'The proof deliberately works on each compact interval before time one. It never assumes regularity at the singular endpoint.',
    leanFocus: ['apply', 'by_cases', 'subset goals', 'closure_minimal'],
    concepts: ['time slab', 'support closure', 'finite energy'],
    question: 'Why split the case t = 0 from t > 0?',
    answer: 'The uniqueness theorem requires a strictly positive interval length. At t = 0, equality follows directly from the two initial conditions.',
  },
  {
    id: 'contradiction',
    number: '05',
    label: 'Uniqueness',
    title: 'Agreement becomes a contradiction',
    range: [43, 45],
    summary: 'Uniqueness identifies both velocities before time one, contradicting the candidate’s blow-up property.',
    story:
      'Whole-space finite-energy uniqueness forces the singular candidate u and normalized global velocity v₁ to agree at every point of every interval [0,t] with t < 1. But the candidate property says no globally smooth field can agree with u throughout that pre-singular region. The hypothetical global solution is impossible.',
    bridge:
      'The last line closes the remaining equality goal. Lean then propagates that equality back through not_global_agreement and discharges False.',
    leanFocus: ['uniqueness theorem', 'simpa', 'exact'],
    concepts: ['classical uniqueness', 'global exclusion', 'contradiction'],
    question: 'Where is the final contradiction in the Lean text?',
    answer: 'It was set up by apply h.not_global_agreement. Once exact proves the requested pointwise agreement, the outer application closes False automatically.',
  },
]

const exactLessons: Record<number, StepLesson> = {
  0: {
    label: 'Unpack the construction',
    summary: 'Select the velocity, pressure, force, and certificate produced by the compact-candidate construction.',
    detail: 'The angled-bracket pattern destructures one existential package into four named local objects.',
    concept: 'existential elimination',
  },
  2: {
    label: 'Derive force decay',
    summary: 'Combine compact support, smoothness, and scaling lemmas into the public force-decay condition.',
    detail: 'The new fact hForceDecay is inferred from the result type of forceConditionDecay.',
    concept: 'local lemma',
  },
  3: {
    label: 'Choose the theorem witnesses',
    summary: 'Provide zero initial velocity and the viscosity-rescaled force, leaving only non-existence to prove.',
    detail: 'Question marks in refine become new goals; all earlier tuple fields are solved immediately.',
    concept: 'refinement',
  },
  4: {
    label: 'Assume the forbidden solution',
    summary: 'Introduce a hypothetical global velocity, pressure, and their solution certificate.',
    detail: 'Because the goal is a negated existential, rintro turns its witnesses into hypotheses and changes the target to False.',
    concept: 'contradiction',
  },
  5: {
    label: 'Rescale velocity',
    summary: 'Define the normalized velocity by scaling space, time, and amplitude with ν⁻¹.',
    detail: 'A let binding records a local definition without expanding it everywhere in the proof state.',
    concept: 'local definition',
  },
  6: {
    label: 'Rescale pressure',
    summary: 'Define pressure with the matching ν⁻² amplitude and ν⁻¹ spacetime scale.',
    detail: 'The pressure scaling is chosen so every term in the normalized equation has the same coefficient.',
    concept: 'PDE scaling',
  },
  7: {
    label: 'Open a subsidiary proof',
    summary: 'Ask Lean to establish that the normalized fields form a global viscosity-one solution.',
    detail: 'This tactic creates a new focused goal and preserves the original contradiction goal for afterward.',
    concept: 'have with a hole',
  },
  11: {
    label: 'Split the solution structure',
    summary: 'Supply smoothness and expose five remaining obligations encoded by GlobalSolutionRn.',
    detail: 'Lean creates goals for initial data, incompressibility, the equation, spatial L² integrability, and uniform energy.',
    concept: 'structure constructor',
  },
  14: {
    label: 'Preserve incompressibility',
    summary: 'Show the velocity rescaling carries zero divergence to zero divergence.',
    detail: 'The atomic wrapper keeps this calculation as one readable animation step even though several rewrites occur inside.',
    concept: 'equational rewriting',
  },
  15: {
    label: 'Preserve the equation',
    summary: 'Rewrite every term of Navier–Stokes under scaling and cancel the viscosity factors.',
    detail: 'This is the algebraic heart of normalization: temporal, advective, Laplacian, pressure, and force terms all transform coherently.',
    concept: 'scaling covariance',
  },
  18: {
    label: 'Extract the energy bound',
    summary: 'Take the uniform kinetic-energy constant from the hypothetical global solution.',
    detail: 'The existential energy constant E and its bound hE become available in the local context.',
    concept: 'witness extraction',
  },
  22: {
    label: 'Transfer bounded energy',
    summary: 'Finish the scaled energy estimate using positivity of ν⁻².',
    detail: 'The original strict inequality remains strict after multiplication by a positive scaling factor.',
    concept: 'ordered multiplication',
  },
  23: {
    label: 'Invoke the blow-up certificate',
    summary: 'Reduce False to proving that the candidate and normalized solution agree before time one.',
    detail: 'apply works backward: the no-global-agreement theorem becomes the plan for reaching the contradiction.',
    concept: 'backward reasoning',
  },
  26: {
    label: 'Split time zero from positive time',
    summary: 'Handle the endpoint directly and reserve uniqueness for genuinely positive intervals.',
    detail: 'by_cases creates one branch with t = 0 and another carrying t ≠ 0.',
    concept: 'case split',
  },
  30: {
    label: 'Restrict the candidate domain',
    summary: 'Show the comparison slab [0,t] remains strictly before the singular time.',
    detail: 'The upper bound t < 1 lets every point of the closed slab inhabit preSingularDomain.',
    concept: 'set inclusion',
  },
  36: {
    label: 'Keep support uniformly compact',
    summary: 'Promote pointwise vanishing outside K to containment of the topological support.',
    detail: 'closure_minimal is the bridge from ordinary support information to tsupport, which is defined using closure.',
    concept: 'topological support',
  },
  42: {
    label: 'Restrict global energy',
    summary: 'Obtain the finite-energy hypothesis on the current compact time interval.',
    detail: 'A global uniform bound immediately restricts to the slab required by uniqueness.',
    concept: 'hypothesis specialization',
  },
  43: {
    label: 'Apply whole-space uniqueness',
    summary: 'Use smoothness, support, energy, divergence, equations, and common initial data to identify the two flows.',
    detail: 'The long theorem application records the complete analytical interface of the uniqueness argument.',
    concept: 'major theorem application',
  },
  44: {
    label: 'Match the two equation conventions',
    summary: 'Normalize notation so the candidate and global solution have the same Navier–Stokes residual.',
    detail: 'simpa removes wrapper definitions and the harmless coefficient 1 before composing the two equation equalities.',
    concept: 'definitional alignment',
  },
  45: {
    label: 'Close pointwise agreement',
    summary: 'Specialize uniqueness at the chosen time and point; no goals remain.',
    detail: 'exact supplies precisely the requested equality. The earlier blow-up certificate then turns agreement into the final contradiction.',
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
      detail: 'obtain combines a theorem application with pattern matching on its result.',
      concept: 'obtain',
    },
  },
  {
    test: (tactic) => tactic.startsWith('have'),
    lesson: {
      label: 'Record an intermediate fact',
      summary: 'Prove or name a fact that will be consumed by a later theorem.',
      detail: 'have grows the local context while preserving the current main goal.',
      concept: 'have',
    },
  },
  {
    test: (tactic) => tactic.startsWith('intro'),
    lesson: {
      label: 'Introduce assumptions',
      summary: 'Move universally quantified values or implications into the local context.',
      detail: 'intro replaces binders at the front of the goal with local variables and hypotheses.',
      concept: 'intro',
    },
  },
  {
    test: (tactic) => tactic.startsWith('refine'),
    lesson: {
      label: 'Refine the target',
      summary: 'Provide the known part of a construction and leave explicit holes as new goals.',
      detail: 'refine is useful when the outer shape of the proof term is clear but some fields still need proofs.',
      concept: 'refine',
    },
  },
  {
    test: (tactic) => tactic.startsWith('simp') || tactic.startsWith('simpa'),
    lesson: {
      label: 'Normalize the expression',
      summary: 'Simplify definitions and rewrite routine identities until the target matches a known fact.',
      detail: 'simpa also closes the goal when the simplified target and supplied expression agree.',
      concept: 'simplification',
    },
  },
  {
    test: (tactic) => tactic.startsWith('rw'),
    lesson: {
      label: 'Rewrite with equalities',
      summary: 'Replace expressions using named equations.',
      detail: 'rw transforms the current goal in the direction of the listed equalities.',
      concept: 'rewriting',
    },
  },
  {
    test: (tactic) => tactic.startsWith('exact'),
    lesson: {
      label: 'Supply the exact proof',
      summary: 'Close the current goal with a term whose type already matches it.',
      detail: 'exact asks Lean to check one proof term against the complete target.',
      concept: 'exact',
    },
  },
  {
    test: (tactic) => tactic.startsWith('apply'),
    lesson: {
      label: 'Reason backward',
      summary: 'Replace the target by the hypotheses needed by a theorem that would prove it.',
      detail: 'apply turns a known implication into a new, usually more concrete goal.',
      concept: 'apply',
    },
  },
  {
    test: (tactic) => tactic.startsWith('let'),
    lesson: {
      label: 'Name a local construction',
      summary: 'Introduce a definition that keeps later expressions readable.',
      detail: 'Lean remembers both the name and its defining value in the local context.',
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
    summary: 'Transform the current proof state using a certified Lean step.',
    detail: 'Compare the goal before and after to see what this tactic contributed.',
    concept: 'tactic step',
  }
}

export function stageForStep(step: number): ProofStage {
  return proofStages.find(({ range }) => step >= range[0] && step <= range[1]) ?? proofStages[0]
}
