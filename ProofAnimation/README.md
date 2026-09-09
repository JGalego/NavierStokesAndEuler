# Navier–Stokes proof animation

This directory drives [dwrensha/animate-lean-proofs](https://github.com/dwrensha/animate-lean-proofs) against the whole-space Navier–Stokes result.

The animation target is
`NavierStokes.ProofAnimation.navier_stokes_breakdown_R3_full` in
`NavierStokes/ComparatorProofAnimation.lean`. It proves the same proposition as
`NavierStokes.Comparator.navier_stokes_breakdown_R3`, while exposing the major
proof stages that the public one-line adapter intentionally hides:

- select the compact blow-up candidate;
- establish decay of the viscosity-rescaled force;
- assume and normalize a hypothetical global solution;
- invoke whole-space finite-energy uniqueness on each interval before time one;
- contradict the candidate's unbounded speed.

`animate-lean-proofs` animates the tactic information tree of one theorem. It
does not recursively animate proofs of imported declarations. The dedicated
target therefore gives an end-to-end animation of the theorem argument, with
the repository's construction and analysis results shown as named trusted
steps rather than attempting to flatten hundreds of source modules into one
scene.

## Prerequisites

- Lean and Lake from the repository's `lean-toolchain`
- Pygments 2.19 or newer, with the `lean4` lexer, and Pillow 11
- Blender 4.x for scene and video rendering
- FFmpeg support in Blender and the `ffmpeg` command-line tool

Install the Python requirement in the environment of your choice:

```sh
python3 -m pip install -r ProofAnimation/requirements.txt
```

If `pygmentize` is not on `PATH`, set `PYGMENTIZE_BIN` to its absolute path.
If Blender is not on `PATH`, set `BLENDER_BIN`. The script also discovers the
official Blender 4.0.2 portable build at `.lake/blender-4.0.2-linux-x64/`.

## Generate

From the repository root:

```sh
ProofAnimation/render.sh render
```

The script pins `animate-lean-proofs` at revision
`587735b4d3b589dc63779182bf6d1b07946564d6`, checks it out below `.lake/`, and
applies the compatibility patch in this directory. The patch updates the tool
to Lean 4.34, reuses this workspace's Mathlib checkout, enables background
Blender rendering, and adds explicit output paths.

Generated artifacts are written to `ProofAnimation/build/`:

- `navier-stokes-proof.json`: extracted tactic and goal transitions
- `navier-stokes-proof.blend`: editable Blender scene
- `navier-stokes-proof.mp4`: rendered animation

Useful modes and overrides:

```sh
ProofAnimation/render.sh setup
ProofAnimation/render.sh extract
REUSE_JSON=1 ProofAnimation/render.sh render
FPS=30 ACTION_FRAME_COUNT=14 RESOLUTION_X=1920 RESOLUTION_Y=1080 \
	ProofAnimation/render.sh render
```

The default render uses Blender's Workbench engine at 1280×720 and 15 FPS, with
a compact timeline that still gives each tactic about one second. Set
`RENDER_ENGINE=EEVEE` or `RENDER_ENGINE=CYCLES` for a different engine. The
timing can be adjusted with `ACTION_FRAME_COUNT`, `WAIT_FRAME_COUNT`,
`POST_TACTIC_PAUSE_FRAME_COUNT`, and `SWITCH_FOCUS_FRAME_COUNT`.

The first extraction can take several minutes because Lean must load the full
formalization environment before collecting the theorem's tactic information.

## YouTube thumbnail

After rendering the video, generate the thumbnail from a stable proof state at
about eight seconds:

```sh
python3 ProofAnimation/create_thumbnail.py
```

This writes a lossless master and a compact upload-ready copy to
`ProofAnimation/assets/navier-stokes-youtube-thumbnail.png` and
`ProofAnimation/assets/navier-stokes-youtube-thumbnail.jpg`. Use `--timestamp`
to select another source frame, or `--video` and `--output` to override the
input and output paths.
