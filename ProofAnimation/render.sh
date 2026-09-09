#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANIM_DIR="${ANIMATE_LEAN_PROOFS_DIR:-$ROOT_DIR/.lake/animate-lean-proofs}"
ANIM_REV="587735b4d3b589dc63779182bf6d1b07946564d6"
PATCH_FILE="$ROOT_DIR/ProofAnimation/animate-lean-proofs-lean-4.34.patch"
INPUT_FILE="NavierStokes/ComparatorProofAnimation.lean"
THEOREM_NAME="NavierStokes.ProofAnimation.navier_stokes_breakdown_R3_full"
OUTPUT_DIR="${OUTPUT_DIR:-$ROOT_DIR/ProofAnimation/build}"
JSON_FILE="$OUTPUT_DIR/navier-stokes-proof.json"
BLEND_FILE="$OUTPUT_DIR/navier-stokes-proof.blend"
VIDEO_FILE="$OUTPUT_DIR/navier-stokes-proof.mp4"
MODE="${1:-render}"

usage() {
  cat <<'EOF'
Usage: ProofAnimation/render.sh [setup|extract|render]

  setup    fetch and build animate-lean-proofs
  extract  generate the proof-state JSON
  render   generate JSON, a Blender scene, and an MP4 (default)

Environment variables:
  ANIMATE_LEAN_PROOFS_DIR  override the upstream checkout location
  OUTPUT_DIR               override ProofAnimation/build
  PYGMENTIZE_BIN           select a Pygments executable with the lean4 lexer
  BLENDER_BIN              select the Blender executable
  REUSE_JSON=1             skip extraction when the JSON already exists
  FPS, RESOLUTION_X, RESOLUTION_Y, RENDER_ENGINE
  ACTION_FRAME_COUNT, WAIT_FRAME_COUNT, POST_TACTIC_PAUSE_FRAME_COUNT
  SWITCH_FOCUS_FRAME_COUNT
EOF
}

case "$MODE" in
  setup|extract|render) ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac

ensure_animator() {
  if [[ ! -d "$ANIM_DIR/.git" ]]; then
    rm -rf "$ANIM_DIR"
    git clone https://github.com/dwrensha/animate-lean-proofs.git "$ANIM_DIR"
  fi

  if [[ "$(git -C "$ANIM_DIR" rev-parse HEAD)" != "$ANIM_REV" ]]; then
    git -C "$ANIM_DIR" fetch origin "$ANIM_REV"
    git -C "$ANIM_DIR" checkout --detach "$ANIM_REV"
  fi

  if git -C "$ANIM_DIR" apply --check "$PATCH_FILE" 2>/dev/null; then
    git -C "$ANIM_DIR" apply "$PATCH_FILE"
  elif ! git -C "$ANIM_DIR" apply --reverse --check "$PATCH_FILE" 2>/dev/null; then
    echo "error: the animate-lean-proofs checkout has unexpected local changes" >&2
    exit 1
  fi

  (
    cd "$ANIM_DIR"
    lake update
    lake build Animate
  )
}

find_pygmentize() {
  if [[ -n "${PYGMENTIZE_BIN:-}" ]]; then
    printf '%s\n' "$PYGMENTIZE_BIN"
  elif [[ -x "$ROOT_DIR/.venv/bin/pygmentize" ]]; then
    printf '%s\n' "$ROOT_DIR/.venv/bin/pygmentize"
  elif command -v pygmentize >/dev/null 2>&1; then
    command -v pygmentize
  else
    echo "error: pygmentize is required; install ProofAnimation/requirements.txt" >&2
    exit 1
  fi
}

extract_proof() {
  mkdir -p "$OUTPUT_DIR"
  if [[ "${REUSE_JSON:-0}" == "1" && -s "$JSON_FILE" ]]; then
    echo "Reusing $JSON_FILE"
    return
  fi

  local pygmentize_bin
  pygmentize_bin="$(find_pygmentize)"
  if ! printf 'theorem x : True := by trivial\n' |
      "$pygmentize_bin" -l lean4 -f raw >/dev/null 2>&1; then
    echo "error: $pygmentize_bin does not provide the Pygments lean4 lexer" >&2
    echo "Install Pygments >= 2.19 from ProofAnimation/requirements.txt." >&2
    exit 1
  fi

  local json_tmp="$JSON_FILE.tmp"
  rm -f "$json_tmp"
  (
    cd "$ROOT_DIR"
    PATH="$(dirname "$pygmentize_bin"):$PATH" lake env \
      "$ANIM_DIR/.lake/build/bin/Animate" "$INPUT_FILE" "$THEOREM_NAME"
  ) > "$json_tmp"
  mv "$json_tmp" "$JSON_FILE"
  echo "Wrote $JSON_FILE"
}

render_proof() {
  local blender_bin
  if [[ -n "${BLENDER_BIN:-}" ]]; then
    blender_bin="$BLENDER_BIN"
  elif command -v blender >/dev/null 2>&1; then
    blender_bin="$(command -v blender)"
  elif [[ -x "$ROOT_DIR/.lake/blender-4.0.2-linux-x64/blender" ]]; then
    blender_bin="$ROOT_DIR/.lake/blender-4.0.2-linux-x64/blender"
  else
    echo "error: Blender is required to render the animation" >&2
    echo "Install Blender 4.x or set BLENDER_BIN, then rerun with 'render'." >&2
    exit 1
  fi

  (
    cd "$ANIM_DIR"
    FPS="${FPS:-15}" \
    RESOLUTION_X="${RESOLUTION_X:-1280}" \
    RESOLUTION_Y="${RESOLUTION_Y:-720}" \
    RENDER_ENGINE="${RENDER_ENGINE:-WORKBENCH}" \
      "$blender_bin" --background --python animate_proof.py -- "$JSON_FILE" \
        --action_frame_count "${ACTION_FRAME_COUNT:-7}" \
        --wait_frame_count "${WAIT_FRAME_COUNT:-3}" \
        --post_tactic_pause_frame_count "${POST_TACTIC_PAUSE_FRAME_COUNT:-2}" \
        --switch_focus_frame_count "${SWITCH_FOCUS_FRAME_COUNT:-3}" \
        --foreground_ratio_y 0.28 \
        --save-blend "$BLEND_FILE" \
        --output "$VIDEO_FILE" \
        --render
  )
  if [[ ! -s "$BLEND_FILE" || ! -s "$VIDEO_FILE" ]]; then
    echo "error: Blender did not produce the expected animation artifacts" >&2
    exit 1
  fi
  echo "Wrote $BLEND_FILE"
  echo "Wrote $VIDEO_FILE"
}

ensure_animator

case "$MODE" in
  setup) ;;
  extract) extract_proof ;;
  render)
    extract_proof
    render_proof
    ;;
esac
