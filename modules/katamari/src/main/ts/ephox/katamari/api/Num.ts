export const cycleBy = (value: number, delta: number, min: number, max: number): number => {
  const r = value + delta;
  if (r > max) { return min; } else { return r < min ? max : r; }
};

export const cap = (value: number, min: number, max: number): number => {
  if (value <= min) { return min; } else { return value >= max ? max : value; }
};
