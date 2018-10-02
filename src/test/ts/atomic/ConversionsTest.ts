import * as RgbaColour from '../../../main/ts/ephox/acid/api/colour/RgbaColour';
import * as HexColour from '../../../main/ts/ephox/acid/api/colour/HexColour';
import * as HsvColour from '../../../main/ts/ephox/acid/api/colour/HsvColour';
import { Struct } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('SplitMenuTest', function() {
  const rgbaBlack = RgbaColour.rgbaColour(0, 0, 0, 1);
  const rgbaWhite = RgbaColour.rgbaColour(255, 255, 255, 1);

  const hexBlack = HexColour.fromRgba(rgbaBlack);
  assert.eq('000000', hexBlack.value());

  const hexWhite = HexColour.fromRgba(rgbaWhite);
  assert.eq('ffffff', hexWhite.value());
});

