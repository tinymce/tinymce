import { delta, clamp, boundaries } from 'oxide-components/components/draggable/internals/calculations';
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

  describe('clamp', () => {
    it('clamp', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('boundaries', () => {
    it('should calculate max and min pointer position when left top is in 0, 0', () => {
      const upperLeftCorner = { x: 0, y: 0 };
      const bottomRightCorner = { x: 1500, y: 1500 };
      const element = { x: 50, y: 50, width: 300, height: 300 };
      const mousePosition = { x: 100, y: 100 };

      const calculatedBoundaries = boundaries(element, mousePosition, upperLeftCorner, bottomRightCorner);

      expect(calculatedBoundaries).toMatchObject({
        x: {
          min: 50,
          max: 1250
        },
        y: {
          min: 50,
          max: 1250
        }
      });
    });

    it('should calculate max and min pointer when left top is in 500, 500', () => {
      const upperLeftCorner = { x: 500, y: 500 };
      const bottomRightCorner = { x: 1500, y: 1500 };
      const element = { x: 700, y: 600, width: 50, height: 50 };
      const mousePosition = { x: 710, y: 620 };
      const calculatedBoundaries = boundaries(element, mousePosition, upperLeftCorner, bottomRightCorner);

      expect(calculatedBoundaries).toMatchObject({
        x: {
          min: 510,
          max: 1460
        },
        y: {
          min: 520,
          max: 1470
        }
      });
    });

    it('should round boundaries correctly', () => {
      const upperLeftCorner = { x: 0, y: 0 };
      const bottomRightCorner = { x: 1500, y: 1500 };
      const element = { x: 750, y: 285, width: 250, height: 500 };
      const mousePosition = { x: 751.5, y: 286.5 };
      const calculatedBoundaries = boundaries(element, mousePosition, upperLeftCorner, bottomRightCorner);

      expect(calculatedBoundaries).toMatchObject({
        x: {
          min: 2, // 1.5 rounded up
          max: 1251 // 1251.5 rounded down
        },
        y: {
          min: 2, // 1.5 rounded up
          max: 1001 // 1001.5 rounded down
        }
      });
    });
  });
});
