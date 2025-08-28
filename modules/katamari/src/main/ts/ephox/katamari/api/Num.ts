/**
 * Adds two numbers, and wrap to a range.
 * If the result overflows to the right, snap to the left.
 * If the result overflows to the left, snap to the right.
 */
export const cycleBy = (value: number, delta: number, min: number, max: number): number => {
  const r = value + delta;
  if (r > max) {
    return min;
  } else if (r < min) {
    return max;
  } else {
    return r;
  }
};

// ASSUMPTION: Max will always be larger than min
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

// the division is meant to get a number between 0 and 1 for more information check this discussion: https://stackoverflow.com/questions/58285941/how-to-replace-math-random-with-crypto-getrandomvalues-and-keep-same-result
export const random = (): number => window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
