# [Comparator](https://github.com/leanprover/comparator) challenges

For the strongest check, start from a fresh checkout under an unprivileged Linux
user and do not build the solution modules before invoking Comparator. Build
`landrun`, `lean4export`, and `nanoda_bin` from source and make them available on
`PATH`.

These source revisions are known to work with this repository:

| Executable | Repository | Revision |
| --- | --- | --- |
| `landrun` | [Zouuup/landrun](https://github.com/Zouuup/landrun) | `811cfff51ceaf3d9843708aa6d22e9b84ccac8b4` |
| `lean4export` | [leanprover/lean4export](https://github.com/leanprover/lean4export) | `411dce7db58a3afc60ecab2d211acd1042b593dc` |
| `nanoda_bin` | [ammkrn/nanoda_lib](https://github.com/ammkrn/nanoda_lib) | `05055695879dfebb6628a67da88ceca6cd6b0421` |

The external `lean4export` revision is a Lean-4.34-compatible descendant of the
v4.34.0-rc2 revision in the Lake manifest. The manually triggered
[`independent-proof-check.yml`](../.github/workflows/independent-proof-check.yml)
workflow is an executable recipe for building the pinned tools.

From the repository root, fetch only the Mathlib cache before running each check
inside Comparator's recommended `systemd-run` wrapper:

```sh
lake exe cache get

systemd-run --property=RestrictAddressFamilies=~AF_UNIX \
	--user --pty -E PATH="$PATH" --working-directory="$(pwd)" -- \
	bash -c 'lake exe comparator ComparatorChallenges/NavierStokes.json'

systemd-run --property=RestrictAddressFamilies=~AF_UNIX \
	--user --pty -E PATH="$PATH" --working-directory="$(pwd)" -- \
	bash -c 'lake exe comparator ComparatorChallenges/Euler.json'
```

A successful run for each configuration ends with all three lines:

```text
nanoda kernel accepts the solution
Lean default kernel accepts the solution
Your solution is okay!
```

Warnings about `sorry` in the challenge modules are intentional specification
placeholders. Comparator builds the solution independently and checks its full
dependency closure against the configured axiom allowlist.

Thank you to the [Formal Conjectures](https://google-deepmind.github.io/formal-conjectures/) authors for their [Lean formalization of the Navier–Stokes problem statement](https://github.com/google-deepmind/formal-conjectures/blob/main/FormalConjectures/Millenium/NavierStokes.lean), which we adapted for these Comparator challenges.
