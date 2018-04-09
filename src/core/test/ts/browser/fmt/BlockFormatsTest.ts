import { Pipeline, Step, RawAssertions, Logger, GeneralSteps } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.fmt.BlockFormatsTest', (success, failure) => {
  ModernTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('apply heading format at the end of paragraph should not expand selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([0, 0], 1),
        Step.sync(() => editor.formatter.apply('h1')),
        Step.sync(() => RawAssertions.assertEq('should still have a collapsed rng', true, editor.selection.isCollapsed()))
      ])),
      Logger.t('apply alignright format at the end of paragraph should not expand selection', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([0, 0], 1),
        Step.sync(() => editor.formatter.apply('alignright')),
        Step.sync(() => RawAssertions.assertEq('should still have a collapsed rng', true, editor.selection.isCollapsed()))
      ]))
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
