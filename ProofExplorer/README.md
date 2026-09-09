# Blow-Up Lab

An educational, static proof explorer for the whole-space Navier–Stokes result in
this repository. It presents the mathematical argument and the corresponding Lean
4 proof-state transitions as synchronized views.

## Development

```sh
npm install
npm run dev
```

Use the Story, Both, and Lean controls to change the level of detail. In the Lean
replay, use the arrow keys to move between tactics and Space to toggle playback.

## Proof data

The committed browser snapshot at `public/data/navier-stokes-proof.json` is
derived from the JSON emitted by `animate-lean-proofs`. Regenerate it after
extracting the animation data:

```sh
npm run data:proof -- ../ProofAnimation/build/navier-stokes-proof.json
```

The extraction script intentionally removes animation highlighting maps and keeps
only the theorem name, tactic text, and before/after goals required by the site.

## Validation

```sh
npm run check
```

The Vite build uses relative asset URLs, so the generated `dist/` directory works
under a GitHub Pages project path as well as at a custom domain.
