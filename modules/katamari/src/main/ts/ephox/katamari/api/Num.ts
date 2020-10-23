/**
 * Adds two numbers, and wrap to a range.
 * If the result overflows to the right, snap to the left.
 * If the result overflows to the left, snap to the right.
 */
export const cycleBy = (value: number, delta: number, min: number, max: number): number => {
  const r = value + delta;
  return r > max ? min : r < min ? max : r;
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
