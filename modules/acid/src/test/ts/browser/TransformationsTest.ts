import { context, describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Transformations from 'ephox/acid/api/colour/Transformations';

describe('TransformationsTest', () => {
  context('anyToHex', () => {
    it('TINY-7480: keep hex colors as is', () => {
      fc.assert(fc.property(fc.hexaString(6, 6), (hex) => {
        const result1 = Transformations.anyToHex(hex);
        const result2 = Transformations.anyToHex('#' + hex);
        assert.equal(result1.value, hex.toUpperCase(), 'without hash');
        assert.equal(result2.value, hex.toUpperCase(), 'with hash');
      }));
    });

    it('TINY-7480: transform rgb colors', () => {
      Obj.each({
        'rgb(155, 89, 182)': '9B59B6', // Purple
        'rgb(0,0,255)': '0000FF', // Blue
        'rgb(50,205,50)': '32CD32', // Lime green
        'rgba(255, 99, 71, 0.5)': 'FF6347', // Pale tomato
        'rgb(244,164,96)': 'F4A460', // Sandy brown
      }, (hex, rgb) => {
        const result = Transformations.anyToHex(rgb);
        assert.equal(result.value, hex);
      });
    });

    it('TINY-7480: transform named based colors', () => {
      Obj.each({
        darkviolet: '9400D3',
        red: 'FF0000',
        deeppink: 'FF1493',
        silver: 'C0C0C0'
      }, (hex, rgb) => {
        const result = Transformations.anyToHex(rgb);
        assert.equal(result.value, hex);
      });
    });

    it('TINY-7480: transform hsl colors', () => {
      Obj.each({
        'hsl(145, 63.2%, 49.0%)': '2ECC70',
        'hsl(25,100%,60%)': 'FF8833',
        'hsl(340,79%,59%)': 'E9447B',
      }, (hex, rgb) => {
        const result = Transformations.anyToHex(rgb);
        assert.equal(result.value, hex);
      });
    });

    it('TINY-7480: falls back to white for unknown colors', () => {
      const result = Transformations.anyToHex('unknowncolor');
      assert.equal(result.value, 'FFFFFF');
    });
  });
});
