import { Logger, Pipeline, RawAssertions, Step, Log } from '@ephox/agar';
import { UnitTest, assert } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';

import LocalStorage from 'tinymce/core/api/util/LocalStorage';
import SilverTheme from 'tinymce/themes/silver/Theme';
import ColorSwatch from 'tinymce/themes/silver/ui/core/color/ColorSwatch';
import Settings from 'tinymce/themes/silver/ui/core/color/Settings';

UnitTest.asynctest('ColorSettingsTest', (success, failure) => {
  SilverTheme();

  const sResetLocalStorage = function () {
    return Logger.t(`Reset local storage`, Step.sync(function () {
      LocalStorage.removeItem('tinymce-custom-colors');
    }));
  };

  const sAssertColors = function (input, expected) {
    const extractColor = (color: string) => {
      const m = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/.exec(color);
      return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
    };
    const assertColor = (expectedColor: string, actualColor: string, delta: number = 0) => {
      const expectedRgb = extractColor(expectedColor);
      const actualRgb = extractColor(actualColor);
      assert.eq(true, (
        Math.abs(expectedRgb[0] - actualRgb[0]) <= delta &&
        Math.abs(expectedRgb[1] - actualRgb[1]) <= delta &&
        Math.abs(expectedRgb[2] - actualRgb[2]) <= delta
      ), 'Color value should match (within ' + delta + '). Expected: ' + expectedColor + ' Actual: ' + actualColor);
    };
    return Logger.t(`Assert colors: ${expected}`, Step.sync(function () {
      const colors = Settings.mapColors(input);
      RawAssertions.assertEq('Colors length should match', expected.length, colors.length);
      for (let i = 0; i < expected.length; i++) {
        RawAssertions.assertEq('Color type should match', expected[i].type, colors[i].type);
        RawAssertions.assertEq('Color text should match', expected[i].text, colors[i].text);
        assertColor(expected[i].value, colors[i].value, expected[i].delta);
      }
    }));
  };

  const sAssertCols = function (editor, expected) {
    return Logger.t(`Assert color cols: ${expected}`, Step.sync(function () {
      const colors = ColorSwatch.getColorCols(editor);
      RawAssertions.assertEq('should be same', expected, colors);
    }));
  };

  const sAssertCalcCols = function (editor, colors, expected) {
    return Logger.t(`Assert calced cols: ${expected}`, Step.sync(function () {
      const sqrt = ColorSwatch.calcCols(colors);
      RawAssertions.assertEq('should be same', expected, sqrt);
    }));
  };

  const colorSettings = [
    '1abc9c', 'Black',
    'hsl(145, 63.2%, 49.0%)', 'Black',
    '#3498db', 'Black',
    'rgb(155, 89, 182)', 'Black',
    'PeachPuff', 'Some horrible pink/orange color',
    'rgba(255, 99, 71, 0.5)', 'Pale tomato'
  ];

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

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({},
      Log.steps('TBA', 'TextColor: getCurrentColor should return the first found forecolor, not the parent color', [
        sResetLocalStorage(),
        sAssertColors(colorSettings, mappedColors),
        sAssertCols(editor, 5),
        sAssertCalcCols(editor, 1, 5),
        sAssertCalcCols(editor, 2, 5),
        sAssertCalcCols(editor, 3, 5),
        sAssertCalcCols(editor, 4, 5),
        sAssertCalcCols(editor, 5, 5),
        sAssertCalcCols(editor, 8, 5),
        sAssertCalcCols(editor, 9, 5),
        sAssertCalcCols(editor, 10, 5),
        sAssertCalcCols(editor, 25, 5),
        sAssertCalcCols(editor, 26, 6),
        sAssertCalcCols(editor, 36, 6),
        sAssertCalcCols(editor, 37, 7),
        sResetLocalStorage()
      ])
    , onSuccess, onFailure);
  }, {
      plugins: '',
      toolbar: 'forecolor backcolor',
      base_url: '/project/tinymce/js/tinymce',
      color_map: colorSettings
    }, success, failure);
}
);
