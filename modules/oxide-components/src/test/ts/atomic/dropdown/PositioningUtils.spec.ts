import { getInset, getPositionArea } from 'oxide-components/components/dropdown/internals/PositioningUtils';
import { describe, expect, it } from 'vitest';

describe('getPositionArea', () => {
  describe('side: top', () => {
    it('align: start', () => {
      expect(getPositionArea('top', 'start')).toBe('block-start span-inline-end');
    });

    it('align: center', () => {
      expect(getPositionArea('top', 'center')).toBe('block-start');
    });

    it('align: end', () => {
      expect(getPositionArea('top', 'end')).toBe('block-start span-inline-start');
    });
  });

  describe('side: bottom', () => {
    it('align: start', () => {
      expect(getPositionArea('bottom', 'start')).toBe('block-end span-inline-end');
    });

    it('align: center', () => {
      expect(getPositionArea('bottom', 'center')).toBe('block-end');
    });

    it('align: end', () => {
      expect(getPositionArea('bottom', 'end')).toBe('block-end span-inline-start');
    });
  });

  describe('side: left', () => {
    it('align: start', () => {
      expect(getPositionArea('left', 'start')).toBe('inline-start span-block-end');
    });

    it('align: center', () => {
      expect(getPositionArea('left', 'center')).toBe('inline-start');
    });

    it('align: end', () => {
      expect(getPositionArea('left', 'end')).toBe('inline-start span-block-start');
    });
  });

  describe('side: right', () => {
    it('align: start', () => {
      expect(getPositionArea('right', 'start')).toBe('inline-end span-block-end');
    });

    it('align: center', () => {
      expect(getPositionArea('right', 'center')).toBe('inline-end');
    });

    it('align: end', () => {
      expect(getPositionArea('right', 'end')).toBe('inline-end span-block-start');
    });
  });
});

describe('getInset', () => {
  describe('side: top', () => {
    it('returns insetBlock with the given gap', () => {
      expect(getInset('top', 8)).toEqual({ insetBlock: 8 });
    });
  });

  describe('side: bottom', () => {
    it('returns insetBlock with the given gap', () => {
      expect(getInset('bottom', 8)).toEqual({ insetBlock: 8 });
    });
  });

  describe('side: left', () => {
    it('returns insetInline with the given gap', () => {
      expect(getInset('left', 8)).toEqual({ insetInline: 8 });
    });
  });

  describe('side: right', () => {
    it('returns insetInline with the given gap', () => {
      expect(getInset('right', 8)).toEqual({ insetInline: 8 });
    });
  });
});
