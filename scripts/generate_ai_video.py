#!/usr/bin/env python3
"""
Generate an illustrative AI-styled mobility loop video that can sit behind the hero.

The animation is procedural: gradient waves, light particles, and line-art vehicle
motifs (car, bike, auto/commercial) drift subtly to give a futuristic feel without
hurting readability of the foreground copy.
"""

from __future__ import annotations

import math
import os
from pathlib import Path

import cv2  # type: ignore
import imageio.v2 as imageio  # type: ignore
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "images" / "ai-mobility-loop.mp4"

WIDTH, HEIGHT = 1440, 810  # 16:9, keeps file-size in check
FPS = 30
DURATION = 8  # seconds
FRAMES = FPS * DURATION

X = np.linspace(-1.2, 1.2, WIDTH)
Y = np.linspace(-1.0, 1.0, HEIGHT)
GRID_X, GRID_Y = np.meshgrid(X, Y)

RNG = np.random.default_rng(22)
PARTICLE_COUNT = 230
PARTICLE_POS = RNG.random((PARTICLE_COUNT, 2))
PARTICLE_VEL = (RNG.random((PARTICLE_COUNT, 2)) - 0.5) * 0.0025


def gradient_frame(t: float) -> np.ndarray:
  """Create a fluid gradient backdrop."""
  phase = t * math.tau
  wave_r = 0.58 + 0.42 * np.sin(phase * 0.6 + GRID_X * 2.4 + np.cos(GRID_Y * 2.0))
  wave_g = 0.52 + 0.48 * np.sin(phase * 0.8 + GRID_Y * 2.6 - np.sin(GRID_X * 1.4))
  wave_b = 0.55 + 0.45 * np.sin(phase * 1.1 + GRID_X * 1.2 - GRID_Y * 1.6)
  base = np.stack([wave_r, wave_g, wave_b], axis=-1)
  base = np.clip(base**1.2, 0, 1)
  base = (base * 255).astype(np.uint8)
  base = cv2.cvtColor(base, cv2.COLOR_RGB2BGR)
  scan = ((np.sin((GRID_Y + t * 2.0) * math.tau * 3.5) + 1) * 12).astype(np.uint8)
  base[:, :, 2] = np.clip(base[:, :, 2] + scan, 0, 255)
  return base


def update_particles() -> np.ndarray:
  """Advance particle positions and produce a BGR layer."""
  global PARTICLE_POS  # noqa: PLW0603 - intentional state mutation
  PARTICLE_POS = (PARTICLE_POS + PARTICLE_VEL) % 1.0
  layer = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
  for x_norm, y_norm in PARTICLE_POS:
    x = int(x_norm * (WIDTH + 200)) - 100
    y = int(y_norm * (HEIGHT + 200)) - 100
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
      size = int(RNG.integers(1, 4))
      shade = int(RNG.integers(180, 255))
      cv2.circle(layer, (x, y), size, (shade, shade, 255), -1, lineType=cv2.LINE_AA)
  blur = cv2.GaussianBlur(layer, (0, 0), sigmaX=2.2, sigmaY=2.2)
  return blur


def _poly(points: list[tuple[float, float]], scale: float, offset: tuple[int, int]) -> np.ndarray:
  arr = np.array(points, dtype=np.float32)
  arr *= scale
  arr[:, 0] += offset[0]
  arr[:, 1] += offset[1]
  return arr.astype(np.int32)


def draw_icons(glow_layer: np.ndarray, line_layer: np.ndarray, t: float) -> None:
  """Render stylised car, bike, and auto icons with neon glows."""
  vehicles = [
    {
      "label": "AUTO & SUV COVER",
      "center": (int(WIDTH * 0.25), int(HEIGHT * 0.55)),
      "scale": 1.0,
      "color": (255, 186, 120),
      "type": "car",
    },
    {
      "label": "BIKE & SCOOTER COVER",
      "center": (int(WIDTH * 0.50), int(HEIGHT * 0.35)),
      "scale": 0.9,
      "color": (148, 234, 255),
      "type": "bike",
    },
    {
      "label": "AUTO / COMMERCIAL COVER",
      "center": (int(WIDTH * 0.74), int(HEIGHT * 0.58)),
      "scale": 1.05,
      "color": (255, 140, 210),
      "type": "auto",
    },
  ]

  for idx, meta in enumerate(vehicles):
    jitter = math.sin(t * math.tau * (0.4 + idx * 0.1)) * 12
    cx, cy = meta["center"]
    cy += int(jitter)
    color = meta["color"]
    scale = meta["scale"] * (1.0 + 0.02 * math.sin(t * math.tau * 0.6 + idx))

    if meta["type"] == "car":
      body = _poly(
          [(-160, 20), (-90, -40), (90, -40), (150, 20), (150, 50), (-160, 50)],
          scale,
          (cx, cy),
      )
      cv2.polylines(glow_layer, [body], True, color, 18, lineType=cv2.LINE_AA)
      cv2.polylines(line_layer, [body], True, color, 3, lineType=cv2.LINE_AA)
      for offset in (-90, 80):
        cv2.circle(glow_layer, (int(cx + offset * scale), int(cy + 58 * scale)), int(36 * scale), color, 16)
        cv2.circle(line_layer, (int(cx + offset * scale), int(cy + 58 * scale)), int(24 * scale), color, 3)

    elif meta["type"] == "bike":
      wheel = int(60 * scale)
      for offset in (-70, 70):
        center = (int(cx + offset * scale), int(cy + 50 * scale))
        cv2.circle(glow_layer, center, wheel, color, 14)
        cv2.circle(line_layer, center, wheel, color, 3)
      frame_pts = _poly([(-60, 0), (-10, -50), (60, -30), (10, 20)], scale, (cx, cy))
      cv2.polylines(glow_layer, [frame_pts], True, color, 14, lineType=cv2.LINE_AA)
      cv2.polylines(line_layer, [frame_pts], True, color, 3, lineType=cv2.LINE_AA)

    else:  # auto / commercial
      cab = _poly([(-120, 30), (-80, -50), (90, -50), (120, 40), (120, 80), (-120, 80)], scale, (cx, cy))
      cv2.polylines(glow_layer, [cab], True, color, 18, lineType=cv2.LINE_AA)
      cv2.polylines(line_layer, [cab], True, color, 3, lineType=cv2.LINE_AA)
      nose = _poly([(100, -10), (160, 30), (120, 70)], scale, (cx, cy))
      cv2.polylines(glow_layer, [nose], True, color, 14, lineType=cv2.LINE_AA)
      cv2.polylines(line_layer, [nose], True, color, 3, lineType=cv2.LINE_AA)
      cv2.circle(glow_layer, (int(cx - 80 * scale), int(cy + 82 * scale)), int(34 * scale), color, 16)
      cv2.circle(line_layer, (int(cx - 80 * scale), int(cy + 82 * scale)), int(24 * scale), color, 3)
      cv2.circle(glow_layer, (int(cx + 30 * scale), int(cy + 82 * scale)), int(34 * scale), color, 16)
      cv2.circle(line_layer, (int(cx + 30 * scale), int(cy + 82 * scale)), int(24 * scale), color, 3)

    text_origin = (cx - 170, cy + int(130 * scale))
    cv2.putText(
        line_layer,
        meta["label"],
        text_origin,
        cv2.FONT_HERSHEY_DUPLEX,
        0.7,
        tuple(int(c * 0.85) for c in color),
        2,
        lineType=cv2.LINE_AA,
    )


def render_frame(frame_idx: int) -> np.ndarray:
  t = frame_idx / FRAMES
  frame = gradient_frame(t)

  particles = update_particles()
  frame = cv2.addWeighted(frame, 1.0, particles, 0.45, 0)

  glow_layer = np.zeros_like(frame)
  line_layer = np.zeros_like(frame)
  draw_icons(glow_layer, line_layer, t)
  glow_layer = cv2.GaussianBlur(glow_layer, (0, 0), sigmaX=12, sigmaY=12)
  frame = cv2.addWeighted(frame, 1.0, glow_layer, 0.6, 0)
  frame = cv2.add(frame, line_layer)

  tagline = "Intelligent Motor, Bike & Commercial Insurance"
  subline = "AI triage · Live advisory desk · 24x7 claims tracking"
  cv2.putText(
      frame,
      tagline,
      (int(WIDTH * 0.12), int(HEIGHT * 0.14)),
      cv2.FONT_HERSHEY_DUPLEX,
      0.9,
      (240, 255, 255),
      2,
      lineType=cv2.LINE_AA,
  )
  cv2.putText(
      frame,
      subline,
      (int(WIDTH * 0.12), int(HEIGHT * 0.18) + 28),
      cv2.FONT_HERSHEY_DUPLEX,
      0.7,
      (220, 220, 255),
      2,
      lineType=cv2.LINE_AA,
  )

  hud_alpha = 0.25 + 0.2 * math.sin(t * math.tau)
  overlay = frame.copy()
  cv2.rectangle(
      overlay,
      (int(WIDTH * 0.08), int(HEIGHT * 0.1)),
      (int(WIDTH * 0.92), int(HEIGHT * 0.9)),
      (10, 22, 36),
      2,
  )
  frame = cv2.addWeighted(overlay, hud_alpha, frame, 1 - hud_alpha, 0)

  return frame


def main() -> None:
  OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
  writer = imageio.get_writer(
      OUT_PATH,
      fps=FPS,
      codec="libx264",
      quality=8,
      macro_block_size=None,
      pixelformat="yuv420p",
  )

  try:
    for idx in range(FRAMES):
      frame = render_frame(idx)
      rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
      writer.append_data(rgb)
  finally:
    writer.close()

  print(f"Saved {OUT_PATH.relative_to(ROOT)} ({DURATION}s @ {FPS}fps, H.264)")


if __name__ == "__main__":
  main()

