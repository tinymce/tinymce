import { delta, round, clamp, boundries } from 'oxide-components/components/draggable/internals/calculations';
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

  describe('clamp', () => {
    it('clamp', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('boundries', () => {
    it('should calculate max and min shift when left top is in 0, 0', () => {
      const upperLeftCorner = { x: 0, y: 0 };
      const bottomRightCorner = { x: 1500, y: 1500 };
      const calculatedBoundries = boundries({ x: 50, y: 50, width: 300, height: 300 }, upperLeftCorner, bottomRightCorner);

      expect(calculatedBoundries).toMatchObject({
        shiftX: {
          min: -50,
          max: 1150
        },
        shiftY: {
          min: -50,
          max: 1150
        }
      });
    });

    it('should calculate max and min shift when left top is in 500, 500', () => {
      const upperLeftCorner = { x: 500, y: 500 };
      const bottomRightCorner = { x: 1500, y: 1500 };
      const calculatedBoundries = boundries({ x: 700, y: 600, width: 50, height: 50 }, upperLeftCorner, bottomRightCorner);

      expect(calculatedBoundries).toMatchObject({
        shiftX: {
          min: -200,
          max: 750
        },
        shiftY: {
          min: -100,
          max: 850
        }
      });
    });
  });
});