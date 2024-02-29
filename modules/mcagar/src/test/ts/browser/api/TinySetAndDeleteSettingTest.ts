import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import { Editor } from 'ephox/mcagar/alien/EditorTypes';
import { TinyApis } from 'ephox/mcagar/api/pipeline/TinyApis';
import * as TinyLoader from 'ephox/mcagar/api/pipeline/TinyLoader';

UnitTest.asynctest('TinySetAndDeleteSettingTest', (success, failure) => {

  const sAssertSetting = (editor: Editor, key: string, expected: any) => {
    return Step.sync(() => {
      const actual = editor.options ? editor.options.get(key) : editor.settings?.[key];

      return Assertions.assertEq('should have expected val at key', expected, actual);
    });
  };

  const sAssertSettingType = (editor: Editor, key: string, expected: any) => {
    return Step.sync(() => {
      const actual = editor.options ? editor.options.get(key) : editor.settings?.[key];

      return Assertions.assertEq('should have expected type', expected, typeof actual);
    });
  };

  TinyLoader.setupLight((editor, loadSuccess, loadFailure) => {
    if (editor.options) {
      editor.options.register('a', { processor: Fun.always });
    }
    const apis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('set and change setting', GeneralSteps.sequence([
        apis.sSetOption('a', 'b'),
        sAssertSetting(editor, 'a', 'b'),
        apis.sSetOption('a', 'c'),
        sAssertSetting(editor, 'a', 'c')
      ])),

      Logger.t('set setting to function', GeneralSteps.sequence([
        apis.sSetOption('a', Fun.identity),
        sAssertSettingType(editor, 'a', 'function')
      ])),

      Logger.t('delete setting', GeneralSteps.sequence([
        apis.sUnsetOption('a'),
        sAssertSetting(editor, 'a', undefined)
      ]))
    ], loadSuccess, loadFailure);

  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
