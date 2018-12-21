import { Logger, Pipeline, RawAssertions, Step, Log } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import ColorSwatch from '../../../../../main/ts/ui/core/color/ColorSwatch';
import Settings from '../../../../../main/ts/ui/core/color/Settings';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';

UnitTest.asynctest('ColorSettingsTest', (success, failure) => {

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
    '2ecc71', 'Black',
    '3498db', 'Black',
    '9b59b6', 'Black',
  ];

  const mappedColors = [
    {
      text: 'Black',
      value: '#1abc9c',
      type: 'choiceitem'
    },
    {
      text: 'Black',
      value: '#2ecc71',
      type: 'choiceitem'
    },
    {
      text: 'Black',
      value: '#3498db',
      type: 'choiceitem'
    },
    {
      text: 'Black',
      value: '#9b59b6',
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
      base_url: '/project/js/tinymce',
      color_map: colorSettings
    }, success, failure);
}
);
