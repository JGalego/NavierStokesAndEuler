import NavierStokes.ComparatorR3Theorem

/-!
# Animated proof of Navier–Stokes breakdown on ℝ³

This theorem has the same conclusion as
`NavierStokes.Comparator.navier_stokes_breakdown_R3`, but deliberately expands
the short public adapter into the main proof stages consumed by
`animate-lean-proofs`:

* select the constructed compact candidate;
* verify the rescaled force decay;
* normalize a hypothetical viscosity-`ν` global solution to viscosity one;
* apply whole-space uniqueness on every compact time interval; and
* contradict the candidate's speed blow-up at time one.

Imported construction and analysis lemmas remain named steps. The animation
therefore presents the complete end-to-end theorem argument rather than trying
to inline the repository's entire dependency graph into one unreadable goal.
-/

noncomputable section

syntax (name := atomicTac) "atomic" "(" tacticSeq ")" : tactic

elab_rules : tactic
  | `(tactic| atomic ($tac)) => Lean.Elab.Tactic.evalTactic tac

namespace NavierStokes.ProofAnimation

open Set MeasureTheory ProblemStatement
open ComparatorBridge
open scoped ContDiff

local notation "ℝ³" => EuclideanSpace ℝ (Fin 3)

/-- End-to-end proof script used to generate the Navier–Stokes animation. -/
theorem navier_stokes_breakdown_R3_full (ν : ℝ) (hν : ν > 0) :
    ∃ (u₀ : ℝ³ → ℝ³) (f : ℝ³ → ℝ → ℝ³),
      Comparator.InitialVelocityConditionDecay u₀ ∧ Comparator.ForceConditionDecay f ∧
      ¬ (∃ v p, Comparator.NavierStokesExistenceAndSmoothnessRn ν u₀ f v p) := by
  obtain ⟨u, p, f, h⟩ := R3CompactCandidate.selected_compact_candidate

  obtain ⟨Kf, hKf, hfs⟩ := h.force_support
  have hForceDecay := CompactSpatialForceDecay.forceConditionDecay hKf
    (rescale_smooth h.force_smooth (ν ^ 2) hν.le)
    (CompactSpatialForceDecay.rescale_supported hfs (ν ^ 2) hν.le)
    (rescale_support h.force_time_support (ν ^ 2) hν)

  refine ⟨fun _ => 0, toComparator (rescaledForce ν f),
    zero_initial_condition_decay, hForceDecay, ?_⟩
  rintro ⟨v, q, hv⟩

  let v₁ : VelocityField := rescale ν⁻¹ ν⁻¹ (fromComparator v)
  let q₁ : PressureField := rescale (ν⁻¹ ^ 2) ν⁻¹ (fromComparator q)

  have hGlobal : GlobalSolutionRn f v₁ q₁ := by
    have hc : 0 < ν⁻¹ := inv_pos.mpr hν
    have hsv := fromComparator_smooth hv.velocity_smooth
    have hsp := fromComparator_smooth hv.pressure_smooth
    refine ⟨rescale_smooth hsv _ hc.le, rescale_smooth hsp _ hc.le, ?_, ?_, ?_, ?_, ?_⟩
    · intro x
      simp [v₁, rescale, fromComparator, hv.initial_condition]
    · atomic (
        intro t ht x
        simp only [v₁]
        rw [rescale_divergence, divergence_eq]
        change ν⁻¹ * Comparator.divergence (v · (ν⁻¹ * t)) x = 0
        rw [hv.div_free x (ν⁻¹ * t) (mul_nonneg hc.le ht), mul_zero]
      )
    · atomic (
        intro t ht x
        simp only [v₁, q₁]
        rw [navierStokesResidual, rescale_temporalDerivative _ _ _ _ _
          (differentiable_time_slice hsv (mul_pos hc ht) x),
          rescale_advection, rescale_laplacian, rescale_gradient]
        have he := congrArg (fun z : Space => ν⁻¹ ^ 2 • z)
          (comparator_equation_Rn hv (mul_pos hc ht) x)
        have hcoef : ν⁻¹ ^ 2 * ν = ν⁻¹ := by
          field_simp
        have hforce : ν⁻¹ ^ 2 • toComparator (rescaledForce ν f) x (ν⁻¹ * t) = f (t, x) := by
          simp [toComparator, rescaledForce, rescale, smul_smul, hν.ne']
        rw [hforce] at he
        simp only [smul_add, smul_sub, smul_smul] at he
        rw [hcoef] at he
        simpa only [pow_two] using he
      )
    · intro t ht
      simpa only [v₁, rescale, fromComparator, norm_smul] using
        (hv.integrable (ν⁻¹ * t) (mul_nonneg hc.le ht)).const_mul ‖ν⁻¹‖
    · obtain ⟨E, hE⟩ := hv.globally_bounded_energy
      refine ⟨ν⁻¹ ^ 2 * E, ?_⟩
      intro t ht
      simp only [v₁, rescale, fromComparator, norm_smul, Real.norm_eq_abs,
        abs_of_pos hc, mul_pow, integral_const_mul]
      exact mul_lt_mul_of_pos_left (hE (ν⁻¹ * t) (mul_nonneg hc.le ht))
        (sq_pos_of_pos hc)

  apply h.not_global_agreement hGlobal.velocity_smooth
  obtain ⟨K, hK, hs⟩ := h.velocity_support
  intro t ht x
  by_cases ht0 : t = 0
  · subst t
    rw [h.zero_initial_velocity, hGlobal.initial_velocity]

  have hpos : 0 < t := lt_of_le_of_ne ht.1 (Ne.symm ht0)
  have hpre : NavierStokesR3.Comparison.slab 0 t ⊆ preSingularDomain := by
    intro z hz
    exact ⟨⟨hz.1.1, hz.1.2.trans_lt ht.2⟩, hz.2⟩
  have hfuture : NavierStokesR3.Comparison.slab 0 t ⊆ futureDomain := by
    intro z hz
    exact ⟨hz.1.1, hz.2⟩
  have hsupport : ∀ r ∈ Icc (0 : ℝ) t, tsupport (fun y => u (r, y)) ⊆ K := by
    intro r hr
    apply closure_minimal _ hK.isClosed
    intro y hy
    by_contra hyK
    exact hy (hs r ⟨hr.1, hr.2.trans_lt ht.2⟩ y hyK)

  have hEnergy := hGlobal.uniformFiniteEnergy t
  have heq := NavierStokesR3.WholeSpaceUniqueness.classical_uniqueness_on_Icc hpos
    (h.velocity_smooth.mono hpre) (hGlobal.velocity_smooth.mono hfuture)
    (h.pressure_smooth.mono hpre) (hGlobal.pressure_smooth.mono hfuture)
    hK hsupport hEnergy
    (fun r hr => h.divergence_free r ⟨hr.1.le, hr.2.trans ht.2⟩)
    (fun r hr => hGlobal.divergence_free r hr.1.le)
    (fun r hr y => by
      simpa only [NavierStokesR3.ProblemStatement.navierStokesResidual,
        navierStokesResidual, one_smul] using
        (h.navier_stokes r ⟨hr.1, hr.2.trans ht.2⟩ y).trans
          (hGlobal.navier_stokes r hr.1 y).symm)
    (fun y => (h.zero_initial_velocity y).trans (hGlobal.initial_velocity y).symm)
  exact heq t ⟨ht.1, le_rfl⟩ x

end NavierStokes.ProofAnimation

#print axioms NavierStokes.ProofAnimation.navier_stokes_breakdown_R3_full