import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { assert } from 'chai';

import * as ColourTypes from 'ephox/acid/api/colour/ColourTypes';
import * as HexColour from 'ephox/acid/api/colour/HexColour';

describe('atomic.acid.HexColourTest', () => {
  const assertHexFromString = (input: string, expected: string) => {
    const hex = HexColour.fromString(input);
    assert.equal(hex.getOrDie().value, expected);
  };

  const assertHexFromRgba = (rbga: ColourTypes.Rgba, expected: string) => {
    const hex = HexColour.fromRgba(rbga);
    assert.equal(hex.value, expected);
  };

  context('isHexString', () => {
    it('TINY-6952: validates correct shorthand hex', () => {
      // with #
      assert.isTrue(HexColour.isHexString('#FFF'));
      assert.isTrue(HexColour.isHexString('#fff'));
      assert.isTrue(HexColour.isHexString('#0ed'));
      assert.isTrue(HexColour.isHexString('#0ED'));
      assert.isTrue(HexColour.isHexString('#0Ed'));

      // without #
      assert.isTrue(HexColour.isHexString('FFF'));
      assert.isTrue(HexColour.isHexString('fff'));
      assert.isTrue(HexColour.isHexString('0ed'));
      assert.isTrue(HexColour.isHexString('0ED'));
      assert.isTrue(HexColour.isHexString('0Ed'));
    });

    it('TINY-6952: incorrect shorthand hex', () => {
      // with #
      assert.isFalse(HexColour.isHexString('#FF'));
      assert.isFalse(HexColour.isHexString('#FFFF'));
      assert.isFalse(HexColour.isHexString('#FFFFF'));
      assert.isFalse(HexColour.isHexString('#GGG'));
      assert.isFalse(HexColour.isHexString('#ggg'));
      assert.isFalse(HexColour.isHexString('#0et'));
      assert.isFalse(HexColour.isHexString('#0ET'));

      // without #
      assert.isFalse(HexColour.isHexString('FF'));
      assert.isFalse(HexColour.isHexString('FFFF'));
      assert.isFalse(HexColour.isHexString('FFFFF'));
      assert.isFalse(HexColour.isHexString('GGG'));
      assert.isFalse(HexColour.isHexString('ggg'));
      assert.isFalse(HexColour.isHexString('0et'));
      assert.isFalse(HexColour.isHexString('0ET'));
    });

    it('TINY-6952: validates full hex', () => {
      // with #
      assert.isTrue(HexColour.isHexString('#FFFFFF'));
      assert.isTrue(HexColour.isHexString('#ffffff'));
      assert.isTrue(HexColour.isHexString('#00eedd'));
      assert.isTrue(HexColour.isHexString('#00EEDD'));
      assert.isTrue(HexColour.isHexString('#00EEdd'));

      // without #
      assert.isTrue(HexColour.isHexString('FFFFFF'));
      assert.isTrue(HexColour.isHexString('ffffff'));
      assert.isTrue(HexColour.isHexString('00eedd'));
      assert.isTrue(HexColour.isHexString('00EEDD'));
      assert.isTrue(HexColour.isHexString('00EEdd'));
    });
  });

  context('fromString', () => {
    it('TINY-6952: gets a Hex from a string', () => {
      // with #
      assertHexFromString('#FFF', 'FFF');
      assertHexFromString('#0ED', '0ED');
      assertHexFromString('#0ed', '0ED');
      assertHexFromString('#FFFFFF', 'FFFFFF');
      assertHexFromString('#00EEDD', '00EEDD');
      assertHexFromString('#00eedd', '00EEDD');
      assertHexFromString('#00eeDD', '00EEDD');

      // without #
      assertHexFromString('FFF', 'FFF');
      assertHexFromString('0ED', '0ED');
      assertHexFromString('0ed', '0ED');
      assertHexFromString('FFFFFF', 'FFFFFF');
      assertHexFromString('00EEDD', '00EEDD');
      assertHexFromString('00eedd', '00EEDD');
      assertHexFromString('00eeDD', '00EEDD');
    });

    it('TINY-6952: fails for invalid hex strings', () => {
      // with #
      assert.throws(() => assertHexFromString('#FGG', '#FGG'));
      assert.throws(() => assertHexFromString('#FF', '#FF'));
      assert.throws(() => assertHexFromString('#FFFF', '#FFFF'));
      assert.throws(() => assertHexFromString('#FFFFF', '#FFFFF'));

      // without #
      assert.throws(() => assertHexFromString('FGG', 'FGG'));
      assert.throws(() => assertHexFromString('FF', 'FF'));
      assert.throws(() => assertHexFromString('FFFF', 'FFFF'));
      assert.throws(() => assertHexFromString('FFFFF', 'FFFFF'));
    });
  });

  context('fromRgba', () => {
    it('TINY-6952: gets a hex string from rgba', () => {
      const tests = [
        {
          rgba: { red: 0, blue: 0, green: 0, alpha: 1 },
          expected: '000000',
        },
        {
          rgba: { red: 255, green: 255, blue: 255, alpha: 1 },
          expected: 'FFFFFF',
        },
        {
          rgba: { red: 222, green: 151, blue: 156, alpha: 1 },
          expected: 'DE979C',
        },
      ];
      Arr.each(tests, ({ rgba, expected }) => assertHexFromRgba(rgba, expected));
    });
  });

  context('extractValues', () => {
    it('TINY-6952: extracts values from hex', () => {
      assert.deepEqual(HexColour.extractValues({ value: 'FFFFFF' }), [ 'FFFFFF', 'FF', 'FF', 'FF' ]);
      assert.deepEqual(HexColour.extractValues({ value: '000000' }), [ '000000', '00', '00', '00' ]);
      assert.deepEqual(HexColour.extractValues({ value: '00EEDD' }), [ '00EEDD', '00', 'EE', 'DD' ]);
    });
  });
});
