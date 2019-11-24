export const cycleBy = (value: number, delta: number, min: number, max: number): number => {
  const r = value + delta;
  if (r > max) { return min; } else { return r < min ? max : r; }
};

export const cap = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
