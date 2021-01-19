import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Color from 'tinymce/core/api/util/Color';

describe('browser.tinymce.core.util.ColorTest', () => {
  it('Constructor', () => {
    assert.equal(Color().toHex(), '#000000');
    assert.equal(Color('#faebcd').toHex(), '#faebcd');
  });

  it('parse method', () => {
    const color = Color();

    assert.equal(color.parse('#faebcd').toHex(), '#faebcd');
    assert.equal(color.parse('#ccc').toHex(), '#cccccc');
    assert.equal(color.parse(' #faebcd ').toHex(), '#faebcd');
    assert.equal(color.parse('rgb(255,254,253)').toHex(), '#fffefd');
    assert.equal(color.parse(' rgb ( 255 , 254 , 253 ) ').toHex(), '#fffefd');
    assert.equal(color.parse({ r: 255, g: 254, b: 253 }).toHex(), '#fffefd');
    assert.equal(color.parse({ h: 359, s: 50, v: 50 }).toHex(), '#804041');
    assert.equal(color.parse({ r: 700, g: 700, b: 700 }).toHex(), '#ffffff');
    assert.equal(color.parse({ r: -1, g: -10, b: -20 }).toHex(), '#000000');
  });

  it('toRgb method', () => {
    assert.deepEqual(Color('#faebcd').toRgb(), { r: 250, g: 235, b: 205 });
  });

  it('toHsv method', () => {
    assert.deepEqual(Color('#804041').toHsv(), { h: 359, s: 50, v: 50 });
  });

  it('toHex method', () => {
    assert.equal(Color({ r: 255, g: 254, b: 253 }).toHex(), '#fffefd');
  });
});
