import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.UndoTextpatternTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  TextpatternPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const steps = Utils.withTeardown([
      Logger.t('inline italic then undo', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*a*'),
        tinyApis.sAssertContentStructure(Utils.inlineStructHelper('em', 'a')),
        tinyApis.sExecCommand('Undo'),
        tinyApis.sAssertContent('<p>*a*&nbsp;</p>')
      ]))
    ], tinyApis.sSetContent(''));

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'textpattern',
    toolbar: 'textpattern',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
