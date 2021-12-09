import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as HexColour from 'ephox/acid/api/colour/HexColour';
import * as RgbaColour from 'ephox/acid/api/colour/RgbaColour';

describe('browser.acid.api.ConversionsTest', () => {

  it('RGB to Hex Black', () => {
    const rgbaBlack = RgbaColour.rgbaColour(0, 0, 0, 1);
    const hexBlack = HexColour.fromRgba(rgbaBlack);
    assert.equal(hexBlack.value, '000000');
  });

  it('RGB to hex white', () => {
    const rgbaWhite = RgbaColour.rgbaColour(255, 255, 255, 1);
    const hexWhite = HexColour.fromRgba(rgbaWhite);
    assert.equal(hexWhite.value, 'FFFFFF');
  });
});