import { Logger, Pipeline, RawAssertions, Step, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
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
    return Logger.t(`Assert colors: ${expected}`, Step.sync(function () {
      const colors = Settings.mapColors(input);
      RawAssertions.assertEq('should be same', expected, colors);
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
      type: 'choiceitem'
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
