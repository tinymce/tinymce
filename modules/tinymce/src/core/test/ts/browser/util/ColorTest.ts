import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import Color from 'tinymce/core/api/util/Color';

UnitTest.asynctest('browser.tinymce.core.util.ColorTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  suite.test('Constructor', () => {
    LegacyUnit.equal(Color().toHex(), '#000000');
    LegacyUnit.equal(Color('#faebcd').toHex(), '#faebcd');
  });

  suite.test('parse method', () => {
    const color = Color();

    LegacyUnit.equal(color.parse('#faebcd').toHex(), '#faebcd');
    LegacyUnit.equal(color.parse('#ccc').toHex(), '#cccccc');
    LegacyUnit.equal(color.parse(' #faebcd ').toHex(), '#faebcd');
    LegacyUnit.equal(color.parse('rgb(255,254,253)').toHex(), '#fffefd');
    LegacyUnit.equal(color.parse(' rgb ( 255 , 254 , 253 ) ').toHex(), '#fffefd');
    LegacyUnit.equal(color.parse({ r: 255, g: 254, b: 253 }).toHex(), '#fffefd');
    LegacyUnit.equal(color.parse({ h: 359, s: 50, v: 50 }).toHex(), '#804041');
    LegacyUnit.equal(color.parse({ r: 700, g: 700, b: 700 }).toHex(), '#ffffff');
    LegacyUnit.equal(color.parse({ r: -1, g: -10, b: -20 }).toHex(), '#000000');
  });

  suite.test('toRgb method', () => {
    LegacyUnit.deepEqual(Color('#faebcd').toRgb(), { r: 250, g: 235, b: 205 });
  });

  suite.test('toHsv method', () => {
    LegacyUnit.deepEqual(Color('#804041').toHsv(), { h: 359, s: 50, v: 50 });
  });

  suite.test('toHex method', () => {
    LegacyUnit.equal(Color({ r: 255, g: 254, b: 253 }).toHex(), '#fffefd');
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
