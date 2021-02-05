import { afterEach, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';
import Theme from 'tinymce/themes/silver/Theme';
import * as ColorSwatch from 'tinymce/themes/silver/ui/core/color/ColorSwatch';
import * as Settings from 'tinymce/themes/silver/ui/core/color/Settings';

interface ExpectedColor {
  readonly type: string;
  readonly text: string;
  readonly value: string;
  readonly delta?: number;
}

describe('browser.tinymce.themes.silver.editor.color.ColorSettingsTest', () => {
  const colorSettings = [
    '1abc9c', 'Black',
    'hsl(145, 63.2%, 49.0%)', 'Black',
    '#3498db', 'Black',
    'rgb(155, 89, 182)', 'Black',
    'PeachPuff', 'Some horrible pink/orange color',
    'rgba(255, 99, 71, 0.5)', 'Pale tomato'
  ];
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor',
    base_url: '/project/tinymce/js/tinymce',
    color_map: colorSettings
  }, [ Theme ]);

  const resetLocalStorage = () => {
    LocalStorage.removeItem('tinymce-custom-colors');
  };

  const assertColors = (input: string[], expected: ExpectedColor[]) => {
    const extractColor = (color: string) => {
      const m = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/.exec(color);
      return [ parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16) ];
    };
    const assertColor = (expectedColor: string, actualColor: string, delta: number = 0) => {
      const expectedRgb = extractColor(expectedColor);
      const actualRgb = extractColor(actualColor);
      assert.isTrue((
        Math.abs(expectedRgb[0] - actualRgb[0]) <= delta &&
        Math.abs(expectedRgb[1] - actualRgb[1]) <= delta &&
        Math.abs(expectedRgb[2] - actualRgb[2]) <= delta
      ), 'Color value should match (within ' + delta + '). Expected: ' + expectedColor + ' Actual: ' + actualColor);
    };

    const colors = Settings.mapColors(input);
    assert.lengthOf(colors, expected.length, 'Colors length should match');
    Arr.each(expected, (item, i) => {
      const colorItem = colors[i];
      assert.equal(colorItem.type, item.type, 'Color type should match');
      assert.equal(colorItem.text, item.text, 'Color text should match');
      assertColor(item.value, colorItem.value, item.delta);
    });
  };

  const assertCols = (editor: Editor, expected: number) => {
    const colors = ColorSwatch.getColorCols(editor);
    assert.equal(colors, expected, 'Color cols should be the same');
  };

  const assertCalcCols = (editor: Editor, colors: number, expected: number) => {
    const sqrt = ColorSwatch.calcCols(colors);
    assert.equal(sqrt, expected, 'Calced cols should be the same');
  };

  const mappedColors = [
    {
      text: 'Black',
      value: '#1ABC9C',
      type: 'choiceitem'
    },
    {
      text: 'Black',
      value: '#2ECC70',
      type: 'choiceitem'
    },
    {
      text: 'Black',
      value: '#3498DB',
      type: 'choiceitem'
    },
    {
      text: 'Black',
      value: '#9B59B6',
      type: 'choiceitem'
    },
    {
      text: 'Some horrible pink/orange color',
      value: '#FFDAB9',
      type: 'choiceitem'
    },
    {
      text: 'Pale tomato',
      value: '#FFB0A2',
      type: 'choiceitem',
      delta: 1
    }
  ];

  beforeEach(() => {
    resetLocalStorage();
  });

  afterEach(() => {
    resetLocalStorage();
  });

  it('TBA: getCurrentColor should return the first found forecolor, not the parent color', () => {
    const editor = hook.editor();
    assertColors(colorSettings, mappedColors);
    assertCols(editor, 5);
    assertCalcCols(editor, 1, 5);
    assertCalcCols(editor, 2, 5);
    assertCalcCols(editor, 3, 5);
    assertCalcCols(editor, 4, 5);
    assertCalcCols(editor, 5, 5);
    assertCalcCols(editor, 8, 5);
    assertCalcCols(editor, 9, 5);
    assertCalcCols(editor, 10, 5);
    assertCalcCols(editor, 25, 5);
    assertCalcCols(editor, 26, 6);
    assertCalcCols(editor, 36, 6);
    assertCalcCols(editor, 37, 7);
  });
});
