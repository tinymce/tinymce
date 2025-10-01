import { delta, round } from 'oxide-components/components/draggable/internals/calculations';
import { describe, expect, it } from 'vitest';

describe('browser.draggable.calculations', () => {
  describe('delta', () => {
    it('calculates delta with positive differences', () => {
      const start = { x: 10, y: 20 };
      const end = { x: 30, y: 50 };
      const result = delta(start, end);

      expect(result.deltaX).toBe(20);
      expect(result.deltaY).toBe(30);
    });

    it('calculates delta with negative differences', () => {
      const start = { x: 50, y: 80 };
      const end = { x: 30, y: 40 };
      const result = delta(start, end);

      expect(result.deltaX).toBe(-20);
      expect(result.deltaY).toBe(-40);
    });
  });

  describe('round', () => {
    it('rounds shift values to nearest integers', () => {
      const shift = { x: 10.7, y: 20.3 };
      const result = round(shift);

      expect(result.x).toBe(11);
      expect(result.y).toBe(20);
    });

    it('handles negative decimal values', () => {
      const shift = { x: -5.6, y: -3.2 };
      const result = round(shift);

      expect(result.x).toBe(-6);
      expect(result.y).toBe(-3);
    });
  });
});