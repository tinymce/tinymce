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
      Logger.t('Apply html replacement pattern on space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'heading'),
        tinyApis.sAssertContent('<h1>My Heading</h1>'),
        tinyApis.sAssertSelection([0, 0], 10, [0, 0], 10)
      ])),
      Logger.t('Apply html replacement pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'heading'),
        tinyApis.sAssertContent('<h1>My Heading</h1><p>&nbsp;</p>'),
        tinyApis.sAssertSelection([1], 0, [1], 0)
      ])),
      Logger.t('Apply html replacement pattern on enter in middle of word', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>XheadingX</p>'),
        tinyApis.sSetSelection([0, 0], 8, [0, 0], 8),
        Utils.sPressEnter(tinyApis, tinyActions),
        tinyApis.sAssertContent('<p>X</p><h1>My Heading</h1><p>&nbsp;</p><p>X</p>'),
        tinyApis.sAssertSelection([2], 0, [2], 0)
      ])),
      Logger.t('Apply complex html replacement pattern on enter', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>complex pattern</p>'),
        tinyApis.sSetSelection([0, 0], 15, [0, 0], 15),
        Utils.sPressEnter(tinyApis, tinyActions),
        tinyApis.sAssertContent('<h1>Text</h1><p>More text</p><p>&nbsp;</p>'),
      ])),

      Logger.t('Apply text replacement pattern on space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'brb'),
        tinyApis.sAssertContent('<p>Be Right Back</p>'),
        tinyApis.sAssertSelection([0, 0], 13, [0, 0], 13)
      ])),
      Logger.t('Apply text replacement pattern on space with content after', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>brbX</p>'),
        tinyApis.sSetSelection([0, 0], 3, [0, 0], 3),
        Utils.sPressSpace(tinyApis, tinyActions),
        tinyApis.sAssertContent('<p>Be Right BackX</p>'),
        tinyApis.sAssertSelection([0, 0], 14, [0, 0], 14)
      ])),
      Logger.t('Apply text replacement pattern on enter', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>brb</p>'),
        tinyApis.sSetSelection([0, 0], 3, [0, 0], 3),
        Utils.sPressEnter(tinyApis, tinyActions),
        tinyApis.sAssertContent('<p>Be Right Back</p><p>&nbsp;</p>'),
      ])),
      Logger.t('Apply text replacement pattern on enter with content after', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>brbX</p>'),
        tinyApis.sSetSelection([0, 0], 3, [0, 0], 3),
        Utils.sPressEnter(tinyApis, tinyActions),
        tinyApis.sAssertContent('<p>Be Right Back</p><p>X</p>'),
        tinyApis.sAssertSelection([1, 0], 0, [1, 0], 0)
      ])),
    ], tinyApis.sSetContent(''));

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    textpattern_patterns: [
      { start: 'brb', replacement: 'Be Right Back' },
      { start: 'heading', replacement: '<h1>My Heading</h1>' },
      { start: 'complex pattern', replacement: '<h1>Text</h1><p>More text</p>' },
      { start: '*', end: '*', format: 'italic' },
      { start: '#', format: 'h1' }
    ],
    indent: false,
    plugins: 'textpattern',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});