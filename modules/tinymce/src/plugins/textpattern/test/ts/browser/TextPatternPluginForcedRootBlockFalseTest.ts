import { GeneralSteps, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';

import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.TextPatternPluginForcedRootBlockFalseTest', (success, failure) => {
  TextpatternPlugin();
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const steps = Utils.withTeardown([
      Step.label('inline format with forced_root_block: false', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '**a**', 5, [ 0 ], false),
        Step.label('Check bold format was applied', tinyApis.sAssertContentStructure(Utils.forcedRootBlockInlineStructHelper('strong', 'a')))
      ])),
      Step.label('block format with forced_root_block: false', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '# heading 1', 11, [ 0 ], false),
        Step.label('Check heading format was applied', tinyApis.sAssertContentStructure(Utils.forcedRootBlockStructHelper('h1', ' heading 1')))
      ]))
    ], tinyApis.sSetContent(''));

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'textpattern lists',
    base_url: '/project/tinymce/js/tinymce',
    forced_root_block: false
  }, success, failure);
});
