import { Optional } from '@ephox/katamari';
import { getPositioningStyles } from 'oxide-components/components/draggable/internals/styles';
import { describe, expect, it } from 'vitest';

// This test should be atomic test but I ran on some issues with module resolution in node environment.
// To be investiagated later TINY-13555

describe('browser.draggable.styles', () => {
  describe('getPositioningStyles', () => {
    it('should use transform while dragging', () => {
      const shift = { x: 200, y: 300 };
      const position = { x: 50, y: 100 };
      const expected = { left: '50px', top: '100px', transform: 'translate3d(200px, 300px, 0px)' };

      const result = getPositioningStyles(shift, position, 'top-left', { horizontal: 0, vertical: 0 }, true, Optional.none() );

      expect(result).toEqual(expected);
    });

    describe('should use correct css properties', () => {
      const testOriginCssProperties = (params: {
        origin: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        expected: Record<string, string>;
      }) => {
        const shift = { x: 200, y: 300 };
        const position = { x: 50, y: 100 };

        const result = getPositioningStyles(shift, position, params.origin, { horizontal: 0, vertical: 0 }, false, Optional.none() );

        expect(result).toEqual(params.expected);
      };

      it('should use correct css properties, origin top-left', () => testOriginCssProperties({
        origin: 'top-left',
        expected: { left: '50px', top: '100px' }
      }));

      it('should use correct css properties, origin top-right', () => testOriginCssProperties({
        origin: 'top-right',
        expected: { right: '50px', top: '100px' }
      }));

      it('should use correct css properties, origin bottom-left', () => testOriginCssProperties({
        origin: 'bottom-left',
        expected: { left: '50px', bottom: '100px' }
      }));

      it('should use correct css properties, origin bottom-right', () => testOriginCssProperties({
        origin: 'bottom-right',
        expected: { right: '50px', bottom: '100px' }
      }));
    });

    describe('should use correct css formula', () => {
      const testCssFormula = (params: {
        position: { x: number; y: number };
        allowedOverflow: { horizontal: number; vertical: number };
        declaredSize: Optional<{ width: string; height: string }>;
        expected: Record<string, string>;
      }) => {
        const result = getPositioningStyles({ x: 0, y: 0 }, params.position, 'top-left', params.allowedOverflow, false, params.declaredSize );
        expect(result).toEqual(params.expected);
      };

      it('should restrict top/left when declaredSize available', () => testCssFormula({
        position: { x: 50, y: 100 },
        allowedOverflow: { horizontal: 0, vertical: 0 },
        declaredSize: Optional.some({ width: 'var(--width)', height: 'var(--height)' }),
        expected: {
          left: 'min( 50px, calc( 100% - var(--width) ) )',
          top: 'min( 100px, calc( 100% - var(--height) ) )'
        }
      }));

      it('should include allowed overflow in calculation', () => testCssFormula({
        position: { x: 50, y: 100 },
        allowedOverflow: { horizontal: 0.25, vertical: 0.3 },
        declaredSize: Optional.some({ width: 'var(--width)', height: 'var(--height)' }),
        expected: {
          left: 'min( 50px, calc( 100% - var(--width) * 0.75 ) )',
          top: 'min( 100px, calc( 100% - var(--height) * 0.70 ) )'
        }
      }));

      it('should not include allowed overflow in left calculation, when allowed overflow is 100%', () => testCssFormula({
        position: { x: 50, y: 100 },
        allowedOverflow: { horizontal: 1, vertical: 0.3 },
        declaredSize: Optional.some({ width: 'var(--width)', height: 'var(--height)' }),
        expected: {
          left: '50px',
          top: 'min( 100px, calc( 100% - var(--height) * 0.70 ) )'
        }
      }));

      it('should not include allowed overflow in top calculation, when allowed overflow is 100%', () => testCssFormula({
        position: { x: 50, y: 100 },
        allowedOverflow: { horizontal: 0.25, vertical: 1 },
        declaredSize: Optional.some({ width: 'var(--width)', height: 'var(--height)' }),
        expected: {
          left: 'min( 50px, calc( 100% - var(--width) * 0.75 ) )',
          top: '100px'
        }
      }));
    });
  });
});
