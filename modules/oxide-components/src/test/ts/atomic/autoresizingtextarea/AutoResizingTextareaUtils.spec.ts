import { computeMaxRows, computeMinRows } from 'oxide-components/components/autoresizingtextarea/AutoResizingTextareaUtils';
import { describe, expect, it } from 'vitest';

describe('atomic.components.autoresizingtextarea.AutoResizingTextareaUtils', () => {
  describe('computeMaxRows', () => {
    describe('unit: rows (singleRowHeight is ignored)', () => {
      it('TINY-12773: returns the value when it is positive', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'rows', value: 4 }, singleRowHeight: 20 })).toBe(4);
        expect(computeMaxRows({ maxHeight: { unit: 'rows', value: 1 }, singleRowHeight: 20 })).toBe(1);
      });

      it('TINY-12773: clamps zero and negative values to 1', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'rows', value: 0 }, singleRowHeight: 20 })).toBe(1);
        expect(computeMaxRows({ maxHeight: { unit: 'rows', value: -3 }, singleRowHeight: 20 })).toBe(1);
      });
    });

    describe('unit: px (floor(value / singleRowHeight))', () => {
      it('TINY-12773: divides exactly when value is a multiple of singleRowHeight', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 100 }, singleRowHeight: 20 })).toBe(5);
      });

      it('TINY-12773: floors fractional results', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 105 }, singleRowHeight: 20 })).toBe(5);
      });

      it('TINY-12773: clamps to 1 when the result would be 0', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 19 }, singleRowHeight: 20 })).toBe(1);
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 0 }, singleRowHeight: 20 })).toBe(1);
      });
    });
  });

  describe('computeMinRows', () => {
    describe('unit: rows (singleRowHeight is ignored)', () => {
      it('TINY-12773: returns the value when it is positive', () => {
        expect(computeMinRows({ minHeight: { unit: 'rows', value: 1 }, singleRowHeight: 20 })).toBe(1);
        expect(computeMinRows({ minHeight: { unit: 'rows', value: 5 }, singleRowHeight: 20 })).toBe(5);
      });

      it('TINY-12773: clamps zero and negative values to 1', () => {
        expect(computeMinRows({ minHeight: { unit: 'rows', value: 0 }, singleRowHeight: 20 })).toBe(1);
        expect(computeMinRows({ minHeight: { unit: 'rows', value: -3 }, singleRowHeight: 20 })).toBe(1);
      });
    });

    describe('unit: px (ceil(value / singleRowHeight))', () => {
      it('TINY-12773: ceils fractional results', () => {
        expect(computeMinRows({ minHeight: { unit: 'px', value: 50 }, singleRowHeight: 20 })).toBe(3);
        expect(computeMinRows({ minHeight: { unit: 'px', value: 60 }, singleRowHeight: 20 })).toBe(3);
      });

      it('TINY-12773: clamps to 1 for very small fractions', () => {
        expect(computeMinRows({ minHeight: { unit: 'px', value: 5 }, singleRowHeight: 20 })).toBe(1);
        expect(computeMinRows({ minHeight: { unit: 'px', value: 0 }, singleRowHeight: 20 })).toBe(1);
      });
    });
  });
});
