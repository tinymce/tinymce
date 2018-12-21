import { GeneralSteps, Logger, Pipeline, Step, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.ReplacementTest', (success, failure) => {

  TextpatternPlugin();
  Theme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const sAssertContentAndCursor = (contentWithCursor: string) => {
      const content = contentWithCursor.replace('|', '');
      return GeneralSteps.sequence([
        Step.label('Check content', tinyApis.sAssertContent(content)),
        Step.label('Insert cursor marker', Step.sync(() => editor.insertContent('|'))),
        Step.label('Check cursor position', Step.sync(() => {
          const editorContent = editor.getContent();
          const normalizedEditorContent = editorContent.replace(/&nbsp;/g, ' ');
          const normalizedContentWithCursor = contentWithCursor.replace(/<(([^> ]*)[^>]*)>&nbsp;\|<\/\2>/g, '<$1>|</$2>').replace(/&nbsp;/g, ' ');
          Assertions.assertHtml('Checking cursor', normalizedContentWithCursor, normalizedEditorContent);
        })),
      ]);
    };

    const steps = Utils.withTeardown([
      Logger.t('Apply replacement pattern on space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'brb'),
        sAssertContentAndCursor('<p>be right back&nbsp;|</p>'),
      ])),
      Logger.t('Apply replacement pattern on space with content before', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'Xbrb'),
        sAssertContentAndCursor('<p>Xbe right back&nbsp;|</p>'),
      ])),
      Logger.t('Do not replace on pattern with content after', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'brbX'),
        sAssertContentAndCursor('<p>brbX&nbsp;|</p>'),
      ])),
      Logger.t('Apply replacement pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'brb'),
        sAssertContentAndCursor('<p>be right back</p><p>&nbsp;|</p>'),
      ])),
      Logger.t('Apply replacement pattern on enter with content before', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'Xbrb'),
        sAssertContentAndCursor('<p>Xbe right back</p><p>&nbsp;|</p>'),
      ])),

      Logger.t('Apply replacement pattern and inline pattern on space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*brb*'),
        sAssertContentAndCursor('<p><em>be right back</em>&nbsp;|</p>'),
      ])),
      Logger.t('Apply replacement pattern and block pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '#brb'),
        sAssertContentAndCursor('<h1>be right back</h1><p>&nbsp;|</p>'),
      ])),
      Logger.t('Apply replacement pattern italic pattern and block pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '#*brb*'),
        sAssertContentAndCursor('<h1><em>be right back</em></h1><p>&nbsp;|</p>'),
      ])),
      Step.fail('test'),
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
    skin_url: '/project/js/tinymce/skins/oxide'
  }, success, failure);
});