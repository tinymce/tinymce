import { delta, clamp, boundries, undoShift } from 'oxide-components/components/draggable/internals/calculations';
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

    it('should round boundries correctly', () => {
      const upperLeftCorner = { x: 0, y: 0 };
      const bottomRightCorner = { x: 1500, y: 1500 };
      const calculatedBoundries = boundries({ x: 749.5, y: 285.5, width: 250, height: 500 }, upperLeftCorner, bottomRightCorner);

      expect(calculatedBoundries).toMatchObject({
        shiftX: {
          min: -749,
          max: 500
        },
        shiftY: {
          min: -285,
          max: 714
        }
      });
    });
  });

  describe('undoShift', () => {
    it('should reverse positive shift values', () => {
      const element = { x: 100, y: 200, width: 50, height: 75 };
      const shift = { x: 20, y: 30 };
      const result = undoShift(element, shift);

      expect(result).toEqual({
        x: 80,
        y: 170,
        width: 50,
        height: 75
      });
    });

    it('should reverse negative shift values', () => {
      const element = { x: 50, y: 60, width: 100, height: 150 };
      const shift = { x: -25, y: -40 };
      const result = undoShift(element, shift);

      expect(result).toEqual({
        x: 75,
        y: 100,
        width: 100,
        height: 150
      });
    });

    it('should handle zero shift values', () => {
      const element = { x: 300, y: 400, width: 200, height: 250 };
      const shift = { x: 0, y: 0 };
      const result = undoShift(element, shift);

      expect(result).toEqual({
        x: 300,
        y: 400,
        width: 200,
        height: 250
      });
    });
  });
});