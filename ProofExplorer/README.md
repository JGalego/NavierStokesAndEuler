# Blow-Up Lab

A static reader for the whole-space Navier–Stokes result in this repository. The
mathematical argument appears beside the corresponding Lean 4 proof states.

## Development

```sh
npm install
npm run dev
```

The Mathematics, Together, and Lean controls select the reading mode. The
arrow keys move between tactics; Space starts or pauses playback.

## Proof data

The committed browser snapshot at `public/data/navier-stokes-proof.json` is
derived from the JSON emitted by `animate-lean-proofs`. Regenerate it after
extracting the animation data:

```sh
npm run data:proof -- ../ProofAnimation/build/navier-stokes-proof.json
```

The extraction script drops the animation highlighting maps. It retains the
theorem name, tactic text, and before/after goals used by the site.

## Validation

```sh
npm run check
```

The Vite build uses relative asset URLs, so the generated `dist/` directory works
under a GitHub Pages project path as well as at a custom domain.
