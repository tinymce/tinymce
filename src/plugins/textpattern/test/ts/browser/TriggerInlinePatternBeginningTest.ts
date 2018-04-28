import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest(
  'browser.tinymce.plugins.textpattern.TriggerInlinePatternBeginningTest',
  function () {
    const success = arguments[arguments.length - 2];
    const failure = arguments[arguments.length - 1];

    ModernTheme();
    TextpatternPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      // var tinyActions = TinyActions(editor);

      const steps = Utils.withTeardown([
        Logger.t('enter after first * in *a*', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>*a*</p>'),
          tinyApis.sFocus,
          tinyApis.sSetCursor([0, 0], 1),
          Step.sync(function () {
            editor.fire('keydown', { keyCode: 13 });
          }),
          tinyApis.sAssertContent('<p>*</p><p>a*</p>')
        ])),
        Logger.t('enter after first * in *a*', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>a</strong>*b*</p>'),
          tinyApis.sFocus,
          tinyApis.sSetCursor([0, 1], 1),
          Step.sync(function () {
            editor.fire('keydown', { keyCode: 13 });
          })
        ]))
      ], tinyApis.sSetContent(''));

      Pipeline.async({}, steps, onSuccess, onFailure);
    }, {
      plugins: 'textpattern',
      toolbar: 'textpattern',
      indent: false,
      skin_url: '/project/js/tinymce/skins/lightgray'
    }, success, failure);
  }
);
