import { assert, UnitTest } from '@ephox/bedrock-client';
import * as HexColour from '../../../main/ts/ephox/acid/api/colour/HexColour';
import * as RgbaColour from '../../../main/ts/ephox/acid/api/colour/RgbaColour';

UnitTest.test('ConversionsTest', () => {
  const rgbaBlack = RgbaColour.rgbaColour(0, 0, 0, 1);
  const rgbaWhite = RgbaColour.rgbaColour(255, 255, 255, 1);

  const hexBlack = HexColour.fromRgba(rgbaBlack);
  assert.eq('000000', hexBlack.value());

  const hexWhite = HexColour.fromRgba(rgbaWhite);
  assert.eq('ffffff', hexWhite.value());
});
