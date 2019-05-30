import { Assertions } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import TinyApis from 'ephox/mcagar/api/TinyApis';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('TinySetAndDeleteSettingTest', (success, failure) => {

  var sAssertSetting = function (editor, key, expected) {
    return Step.sync(function () {
      var actual = editor.settings[key];

      return Assertions.assertEq('should have expected val at key', expected, actual);
    });
  };

  var sAssertSettingType = function (editor, key, expected) {
    return Step.sync(function () {
      var actual = typeof editor.settings[key];

      return Assertions.assertEq('should have expected type', expected, actual);
    });
  };

  TinyLoader.setup((editor, loadSuccess, loadFailure) => {
    var apis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('set and change setting', GeneralSteps.sequence([
        apis.sSetSetting('a', 'b'),
        sAssertSetting(editor, 'a', 'b'),
        apis.sSetSetting('a', 'c'),
        sAssertSetting(editor, 'a', 'c')
      ])),

      Logger.t('set setting to function', GeneralSteps.sequence([
        apis.sSetSetting('a', function (a) {
          return a;
        }),
        sAssertSettingType(editor, 'a', 'function')
      ])),

      Logger.t('delete setting', GeneralSteps.sequence([
        apis.sDeleteSetting('a'),
        sAssertSetting(editor, 'a', undefined)
      ]))
    ], loadSuccess, loadFailure);

  }, {
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});

