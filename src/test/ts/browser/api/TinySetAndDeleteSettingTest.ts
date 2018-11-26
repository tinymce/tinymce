import { Assertions } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import TinyApis from 'ephox/mcagar/api/TinyApis';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import { UnitTest } from '@ephox/bedrock';
import { sAssertVersion } from '../../module/AssertVersion';

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

  var sTestVersion = (version: string, major, minor) => {
    return TinyLoader.sSetupVersion(version, [], (editor) => {
      var apis = TinyApis(editor);

      return GeneralSteps.sequence([
        sAssertVersion(major, minor),
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
      ]);
    }, { });
  };

  Pipeline.async({}, [
    sTestVersion('4.5.x', 4, 5),
    sTestVersion('4.8.x', 4, 8),
    sTestVersion('5.0.x', 5, 0)
  ], () => success(), failure);
});

