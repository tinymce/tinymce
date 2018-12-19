import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.UndoTextpatternTest', (success, failure) => {

  Theme();
  TextpatternPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const steps = Utils.withTeardown([
      Log.stepsAsStep('TBA', 'TextPattern: inline italic then undo', [
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*a*'),
        tinyApis.sAssertContentStructure(Utils.inlineStructHelper('em', 'a')),
        tinyApis.sExecCommand('Undo'),
        tinyApis.sAssertContent('<p>*a*&nbsp;</p>')
      ])],
      tinyApis.sSetContent('')
    );

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'textpattern',
    toolbar: 'textpattern',
    base_url: '/project/js/tinymce'
  }, success, failure);
});
