import { Logger, Pipeline, RawAssertions, Step, Log } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import Settings from '../../../main/ts/api/Settings';
import 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.textcolor.GetCurrentColorTest', (success, failure) => {
  const sAssertColors = function (editor, expected) {
    return Logger.t(`Assert colors ${expected}`, Step.sync(function () {
      const colors = Settings.getBackColorMap(editor);
      RawAssertions.assertEq('should be same', expected, colors);
    }));
  };

  const sAssertCols = function (editor, expected) {
    return Logger.t(`Assert colors ${expected}`, Step.sync(function () {
      const colors = Settings.getBackColorCols(editor);
      RawAssertions.assertEq('should be same', expected, colors);
    }));
  };

  const sAssertCalcCols = function (editor, colors, expected) {
    return Logger.t(`Assert colors ${expected}`, Step.sync(function () {
      const sqrt = Settings.calcCols(colors);
      RawAssertions.assertEq('should be same', expected, sqrt);
    }));
  };

  const colorSettings = [
    {
      text: 'Black',
      value: '#1abc9c'
    },
    {
      text: 'Black',
      value: '#2ecc71'
    },
    {
      text: 'Black',
      value: '#3498db'
    },
    {
      text: 'Black',
      value: '#9b59b6'
    }
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
        sAssertColors(editor, mappedColors),
        sAssertCols(editor, 2),
        sAssertCalcCols(editor, 1, 1),
        sAssertCalcCols(editor, 2, 2),
        sAssertCalcCols(editor, 3, 2),
        sAssertCalcCols(editor, 4, 2),
        sAssertCalcCols(editor, 5, 3),
        sAssertCalcCols(editor, 8, 3),
        sAssertCalcCols(editor, 9, 3),
        sAssertCalcCols(editor, 10, 4)
      ])
    , onSuccess, onFailure);
  }, {
      plugins: 'textcolor',
      toolbar: 'forecolor backcolor',
      skin_url: '/project/js/tinymce/skins/oxide/',
      textcolor_map: colorSettings
    }, success, failure);
}
);
