import { BookOpen, ExternalLink, GitFork } from 'lucide-react'
import { useState } from 'react'
import './ReferenceLibrary.css'
import { MathText } from './MathText'

type ReferenceThread = 'all' | 'problem' | 'regularity' | 'waves' | 'blowup'

interface ReferenceItem {
  year: string
  authors: string
  title: string
  mathTitle?: string
  venue: string
  href: string
  thread: Exclude<ReferenceThread, 'all'>
  note: string
}

const references: ReferenceItem[] = [
  {
    year: '2000',
    authors: 'Charles L. Fefferman',
    title: 'Existence and smoothness of the Navier–Stokes equation',
    venue: 'Clay Mathematics Institute · Millennium Prize Problem statement',
    href: 'https://www.claymath.org/wp-content/uploads/2022/06/navierstokes.pdf',
    thread: 'problem',
    note: 'The official problem statement. The whole-space breakdown result formalized here is alternative $(C)$.',
  },
  {
    year: '1934',
    authors: 'Jean Leray',
    title: 'Sur le mouvement d’un liquide visqueux emplissant l’espace',
    venue: 'Acta Mathematica 63, 193–248',
    href: 'https://doi.org/10.1007/BF02547354',
    thread: 'regularity',
    note: 'Introduced global finite-energy weak solutions in three dimensions and the energy inequality that still anchors the subject.',
  },
  {
    year: '1982',
    authors: 'Luis Caffarelli, Robert Kohn, and Louis Nirenberg',
    title: 'Partial regularity of suitable weak solutions of the Navier–Stokes equations',
    venue: 'Communications on Pure and Applied Mathematics 35',
    href: 'https://doi.org/10.1002/cpa.3160350604',
    thread: 'regularity',
    note: 'Proved that the singular set has zero one-dimensional parabolic Hausdorff measure. Isolated singularities are not excluded.',
  },
  {
    year: '2003',
    authors: 'Luis Escauriaza, Gregory Seregin, and Vladimír Šverák',
    title: 'L³,∞-solutions of the Navier–Stokes equations and backward uniqueness',
    mathTitle: '$L^{3,\\infty}$-solutions of the Navier–Stokes equations and backward uniqueness',
    venue: 'Russian Mathematical Surveys 58',
    href: 'https://doi.org/10.1070/RM2003v058n02ABEH000609',
    thread: 'regularity',
    note: 'Established regularity for the unforced Cauchy problem under the bounded scale-invariant $L^\\infty_t L^3_x$ condition.',
  },
  {
    year: '2016',
    authors: 'Terence Tao',
    title: 'Finite time blowup for an averaged three-dimensional Navier–Stokes equation',
    venue: 'Journal of the American Mathematical Society 29',
    href: 'https://doi.org/10.1090/jams/838',
    thread: 'blowup',
    note: 'Constructed blowup for an averaged equation that retains the energy cancellation of the Navier–Stokes nonlinearity.',
  },
  {
    year: '2019',
    authors: 'Tristan Buckmaster and Vlad Vicol',
    title: 'Nonuniqueness of weak solutions to the Navier–Stokes equation',
    venue: 'Annals of Mathematics 189',
    href: 'https://doi.org/10.4007/annals.2019.189.1.3',
    thread: 'blowup',
    note: 'Used convex integration to prove nonuniqueness among finite-energy weak solutions.',
  },
  {
    year: '2022',
    authors: 'Dallas Albritton, Elia Brué, and Maria Colombo',
    title: 'Non-uniqueness of Leray solutions of the forced Navier–Stokes equations',
    venue: 'Annals of Mathematics 196',
    href: 'https://doi.org/10.4007/annals.2022.196.1.3',
    thread: 'blowup',
    note: 'Produced distinct suitable Leray–Hopf solutions with zero initial velocity and the same force, using an unstable vortex in similarity variables.',
  },
  {
    year: '1991',
    authors: 'Alexander Lifschitz and Eliezer Hameiri',
    title: 'Local stability conditions in fluid dynamics',
    venue: 'Physics of Fluids A 3',
    href: 'https://doi.org/10.1063/1.858153',
    thread: 'waves',
    note: 'Described how wavevectors and velocity polarizations evolve along a background flow.',
  },
  {
    year: '1986',
    authors: 'A. D. D. Craik and W. O. Criminale',
    title: 'Evolution of wavelike disturbances in shear flows',
    venue: 'Proceedings of the Royal Society A 406',
    href: 'https://doi.org/10.1098/rspa.1986.0061',
    thread: 'waves',
    note: 'Constructed exact finite-amplitude waves on affine background flows whose quadratic self-interaction cancels.',
  },
  {
    year: '2017',
    authors: 'Sara Daneri and László Székelyhidi, Jr.',
    title: 'Non-uniqueness and h-principle for Hölder-continuous weak solutions of the Euler equations',
    venue: 'Archive for Rational Mechanics and Analysis 224',
    href: 'https://doi.org/10.1007/s00205-017-1081-8',
    thread: 'waves',
    note: 'A precedent for using oscillations to realize a prescribed stress, a role played here by localized pulse families.',
  },
  {
    year: '2023',
    authors: 'Diego Córdoba and Luis Martínez-Zoroa',
    title: 'Blow-up for the incompressible 3D Euler equations with force',
    venue: 'arXiv:2309.08495',
    href: 'https://arxiv.org/abs/2309.08495',
    thread: 'blowup',
    note: 'Built finite-time Euler singularities through successive amplification of increasingly concentrated vortex layers.',
  },
  {
    year: '2026',
    authors: 'Diego Córdoba, Luis Martínez-Zoroa, and Fan Zheng',
    title: 'Finite time blow-up for the hypodissipative Navier–Stokes equations',
    venue: 'Archive for Rational Mechanics and Analysis 250',
    href: 'https://doi.org/10.1007/s00205-026-02198-0',
    thread: 'blowup',
    note: 'Extended the amplification strategy to small positive dissipation orders with forcing in a local well-posedness class.',
  },
]

const threadLabels: Array<[ReferenceThread, string]> = [
  ['all', 'All'],
  ['problem', 'Problem statement'],
  ['regularity', 'Regularity'],
  ['waves', 'Wave mechanics'],
  ['blowup', 'Blowup routes'],
]

export default function ReferenceLibrary({ paperUrl }: { paperUrl: string }) {
  const [thread, setThread] = useState<ReferenceThread>('all')
  const visibleReferences = thread === 'all' ? references : references.filter((reference) => reference.thread === thread)

  return (
    <section className="references-section" id="references">
      <header className="references-heading">
        <div>
          <h2>Trace the proof to its sources.</h2>
        </div>
        <p>The manuscript draws on regularity theory, weak-solution constructions, geometric optics, and recent work on singularity formation.</p>
      </header>

      <article className="primary-reference">
        <div className="primary-reference-mark">OPENAI</div>
        <div>
          <span>Primary source · 2026</span>
          <h3>Finite Time Blowup for Navier–Stokes</h3>
          <p>The manuscript formalized by this repository, and the source of the inner-core geometry animated above.</p>
        </div>
        <div className="primary-reference-links">
          <a href={paperUrl} target="_blank" rel="noreferrer"><BookOpen size={16} /> Read the paper</a>
          <a href="https://github.com/openai/NavierStokesAndEuler" target="_blank" rel="noreferrer"><GitFork size={16} /> Canonical Lean repository</a>
        </div>
      </article>

      <div className="reference-filter" aria-label="Filter references by subject">
        {threadLabels.map(([value, label]) => (
          <button
            type="button"
            key={value}
            className={thread === value ? 'active' : ''}
            onClick={() => setThread(value)}
            aria-pressed={thread === value}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="reference-list" aria-live="polite">
        {visibleReferences.map((reference) => (
          <article className="reference-entry" key={`${reference.year}-${reference.title}`}>
            <div className="reference-year">{reference.year}</div>
            <div>
              <span>{reference.authors}</span>
              <h3><MathText>{reference.mathTitle ?? reference.title}</MathText></h3>
              <p><MathText>{reference.note}</MathText></p>
              <small>{reference.venue}</small>
            </div>
            <a href={reference.href} target="_blank" rel="noreferrer" aria-label={`Open ${reference.title}`}>
              <ExternalLink size={16} />
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
