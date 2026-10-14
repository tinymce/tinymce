// TINYMCE-14907: compares one target's computed property values between the two compiles.
import type { DiffMismatch } from './types';

// Chrome serializes a color computed through a relative-color function (e.g.
// `hsl(from var(--x) ...)`) as `color(srgb r g b[ / a])` even when the legacy LESS
// output for the same color is a plain `rgb()`/`rgba()` literal — same color, different
// notation. Re-serialize to the legacy form so the string comparison isn't fooled by it.
// Channels can fall outside 0-1 (e.g. `calc(l - 30)` past black); Chromium clips them
// to the sRGB gamut when painting, so clamp them the same way.
const COLOR_SRGB = /color\(srgb (-?[\d.e-]+) (-?[\d.e-]+) (-?[\d.e-]+)(?:\s*\/\s*([\d.]+))?\)/g;

const normalizeColor = (value: string): string =>
  value.replace(COLOR_SRGB, (_match, r: string, g: string, b: string, a?: string) => {
    const channel = (c: string) => Math.round(Math.min(Math.max(Number(c), 0), 1) * 255);
    return a === undefined
      ? `rgb(${channel(r)}, ${channel(g)}, ${channel(b)})`
      : `rgba(${channel(r)}, ${channel(g)}, ${channel(b)}, ${a})`;
  });

// Even after normalizeColor's conversion, reconstructing a 0-255 channel from Chrome's
// 6-decimal `color(srgb ...)` serialization can land ±1 off from the LESS literal for
// the exact same color (float truncation, not a real difference) — e.g. `rgb(0, 96,
// 206)` vs a reconstructed `rgb(0, 96, 205)`. Tolerate that on the RGB channels only;
// alpha (0-1) and every non-color part of the value (lengths, keywords, ...) still need
// an exact match, so a real transparency or design change still gets caught.
const RGBA = /rgba?\(([^)]+)\)/g;
const CHANNEL_TOLERANCE = 1;

const colorsCloseEnough = (offColor: string, onColor: string): boolean => {
  const offChannels = offColor.split(',').map((c) => Number(c.trim()));
  const onChannels = onColor.split(',').map((c) => Number(c.trim()));
  if (offChannels.length !== onChannels.length) {
    return false;
  }
  return offChannels.every((channel, i) => {
    const tolerance = i < 3 ? CHANNEL_TOLERANCE : 0;
    return Math.abs(channel - onChannels[i]) <= tolerance;
  });
};

const valuesMatch = (offValue: string, onValue: string): boolean => {
  if (offValue === onValue) {
    return true;
  }

  const offColors = [ ...offValue.matchAll(RGBA) ].map((m) => m[1]);
  const onColors = [ ...onValue.matchAll(RGBA) ].map((m) => m[1]);
  if (offColors.length === 0 || offColors.length !== onColors.length) {
    return false;
  }

  // The value stripped of its color(s) (lengths, keywords, commas, ...) must still
  // match exactly — only the color channels themselves get tolerance.
  if (offValue.replace(RGBA, '\0') !== onValue.replace(RGBA, '\0')) {
    return false;
  }

  return offColors.every((offColor, i) => colorsCloseEnough(offColor, onColors[i]));
};

export const diffComputed = (off: Record<string, string>, on: Record<string, string>): DiffMismatch[] =>
  Object.entries(off)
    .filter(([ prop, offValue ]) => on[prop] === undefined || !valuesMatch(normalizeColor(offValue), normalizeColor(on[prop])))
    .map(([ prop, offValue ]) => ({ prop, offValue, onValue: on[prop] ?? '(missing)' }));
