import { computeMaxRows, computeMinRows } from 'oxide-components/components/autoresizingtextarea/AutoResizingTextareaUtils';
import { describe, expect, it } from 'vitest';

const noPadding = { lineHeight: 20, padding: 0 };
const withPadding = { lineHeight: 20, padding: 14 };

describe('atomic.components.autoresizingtextarea.AutoResizingTextareaUtils', () => {
  describe('computeMaxRows', () => {
    describe('unit: rows (metrics are ignored)', () => {
      it('TINY-12773: returns the value when it is positive', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'rows', value: 4 }, metrics: noPadding })).toBe(4);
        expect(computeMaxRows({ maxHeight: { unit: 'rows', value: 1 }, metrics: noPadding })).toBe(1);
      });

      it('TINY-12773: clamps zero and negative values to 1', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'rows', value: 0 }, metrics: noPadding })).toBe(1);
        expect(computeMaxRows({ maxHeight: { unit: 'rows', value: -3 }, metrics: noPadding })).toBe(1);
      });
    });

    describe('unit: px (floor((value - padding) / lineHeight))', () => {
      it('TINY-12773: divides exactly when value is a multiple of lineHeight', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 100 }, metrics: noPadding })).toBe(5);
      });

      it('TINY-12773: floors fractional results', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 105 }, metrics: noPadding })).toBe(5);
      });

      it('TINY-12773: clamps to 1 when the result would be 0', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 19 }, metrics: noPadding })).toBe(1);
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 0 }, metrics: noPadding })).toBe(1);
      });

      it('TINY-14607: charges padding once rather than once per row', () => {
        // 113px budget fits (113 - 14) / 20 = 4 rows, not floor(113 / 34) = 3.
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 113 }, metrics: withPadding })).toBe(4);
      });

      it('TINY-14607: clamps to 1 when the budget is smaller than the padding', () => {
        expect(computeMaxRows({ maxHeight: { unit: 'px', value: 10 }, metrics: withPadding })).toBe(1);
      });
    });
  });

  describe('computeMinRows', () => {
    describe('unit: rows (metrics are ignored)', () => {
      it('TINY-12773: returns the value when it is positive', () => {
        expect(computeMinRows({ minHeight: { unit: 'rows', value: 1 }, metrics: noPadding })).toBe(1);
        expect(computeMinRows({ minHeight: { unit: 'rows', value: 5 }, metrics: noPadding })).toBe(5);
      });

      it('TINY-12773: clamps zero and negative values to 1', () => {
        expect(computeMinRows({ minHeight: { unit: 'rows', value: 0 }, metrics: noPadding })).toBe(1);
        expect(computeMinRows({ minHeight: { unit: 'rows', value: -3 }, metrics: noPadding })).toBe(1);
      });
    });

    describe('unit: px (ceil((value - padding) / lineHeight))', () => {
      it('TINY-12773: ceils fractional results', () => {
        expect(computeMinRows({ minHeight: { unit: 'px', value: 50 }, metrics: noPadding })).toBe(3);
        expect(computeMinRows({ minHeight: { unit: 'px', value: 60 }, metrics: noPadding })).toBe(3);
      });

      it('TINY-12773: clamps to 1 for very small fractions', () => {
        expect(computeMinRows({ minHeight: { unit: 'px', value: 5 }, metrics: noPadding })).toBe(1);
        expect(computeMinRows({ minHeight: { unit: 'px', value: 0 }, metrics: noPadding })).toBe(1);
      });

      it('TINY-14607: charges padding once rather than once per row', () => {
        // A 94px minimum needs (94 - 14) / 20 = 4 rows, not ceil(94 / 34) = 3.
        expect(computeMinRows({ minHeight: { unit: 'px', value: 94 }, metrics: withPadding })).toBe(4);
      });
    });
  });
});
