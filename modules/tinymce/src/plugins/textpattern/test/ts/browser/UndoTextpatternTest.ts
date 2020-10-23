import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.UndoTextpatternTest', (success, failure) => {

  Theme();
  TextpatternPlugin();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const steps = Utils.withTeardown(
      [
        Log.stepsAsStep('TBA', 'TextPattern: inline italic then undo', [
          Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*a*'),
          tinyApis.sAssertContentStructure(Utils.inlineStructHelper('em', 'a')),
          tinyApis.sExecCommand('Undo'),
          tinyApis.sAssertContent('<p>*a*&nbsp;</p>')
        ]),
        Log.stepsAsStep('TBA', 'TextPattern: block italic then undo', [
          Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '*a*'),
          tinyApis.sAssertContentStructure(Utils.inlineBlockStructHelper('em', 'a')),
          tinyApis.sExecCommand('Undo'),
          tinyApis.sAssertContent('<p>*a*</p>\n<p>&nbsp;</p>'),
          tinyApis.sExecCommand('Undo'),
          tinyApis.sAssertContent('<p>*a*</p>')
        ])
      ],
      tinyApis.sSetContent('')
    );

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'textpattern',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
