import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.ReplacementTest', (success, failure) => {

  TextpatternPlugin();
  Theme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const steps = Utils.withTeardown([
      Logger.t('Apply replacement pattern on space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'brb'),
        tinyApis.sAssertContent('<p>be right back&nbsp;</p>'),
        tinyApis.sAssertSelection([0, 0], 14, [0, 0], 14)
      ])),
      Logger.t('Apply replacement pattern on space with content before', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'Xbrb'),
        tinyApis.sAssertContent('<p>Xbe right back&nbsp;</p>'),
        tinyApis.sAssertSelection([0, 0], 15, [0, 0], 15)
      ])),
      Logger.t('Apply replacement pattern on space with content after', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'brbX'),
        tinyApis.sAssertContent('<p>be right backX&nbsp;</p>'),
        tinyApis.sAssertSelection([0, 0], 15, [0, 0], 15)
      ])),
      Logger.t('Apply replacement pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'brb'),
        tinyApis.sAssertContentStructure(Utils.blockStructHelper('p', 'be right back')),
        tinyApis.sAssertSelection([1], 0, [1], 0)
      ])),
      Logger.t('Apply replacement pattern on enter with content before', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'Xbrb'),
        tinyApis.sAssertContent('<p>Xbe right back</p><p>&nbsp;</p>'),
        tinyApis.sAssertSelection([1], 0, [1], 0)
      ])),

      Logger.t('Apply replacement pattern and inline pattern on space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*brb*'),
        tinyApis.sAssertContent('<p><em>be right back</em>&nbsp;</p>'),
        tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1)
      ])),
      Logger.t('Apply replacement pattern and block pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '#brb'),
        tinyApis.sAssertContent('<h1>be right back</h1><p>&nbsp;</p>'),
        tinyApis.sAssertSelection([1], 0, [1], 0)
      ])),
    ], tinyApis.sSetContent(''));

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    textpattern_patterns: [
      { start: 'brb', replacement: 'be right back' },
      { start: '*', end: '*', format: 'italic' },
      { start: '#', format: 'h1' }
    ],
    indent: false,
    plugins: 'textpattern',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});