import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { assert } from 'chai';

import * as RgbaColour from 'ephox/acid/api/colour/RgbaColour';

describe('RgbaColourTest', () => {
  context('colour identify', () => {
    it('TINY-7480: identify rgb colours', () => {
      Arr.each([
        { colour: 'rgb(0, 0, 0)', expected: 'rgb' },
        { colour: 'rgba(0, 0, 0, 0)', expected: 'rgba' },
        // rgb with alpha value is invalid
        { colour: 'rgb(0, 0, 0, 0)', expected: 'other' },
        { colour: 'rgb(0 0 0)', expected: 'rgb' },
        { colour: 'rgba(0 0 0 0)', expected: 'rgba' },
        // We currently don't support converting this format
        { colour: 'rgb(0 0 0 / 10%)', expected: 'other' },
      ], (test) => {
        const { colour, expected } = test;
        const result = RgbaColour.getColorFormat(colour);
        assert.equal(result, expected);
      });
    });
  });
});