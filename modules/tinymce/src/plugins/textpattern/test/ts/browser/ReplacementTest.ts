import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import TextpatternPlugin from 'tinymce/plugins/textpattern/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as Utils from '../module/test/Utils';

UnitTest.asynctest('browser.tinymce.plugins.textpattern.ReplacementTest', (success, failure) => {

  TextpatternPlugin();
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const sAssertContentAndCursor = (beforeType: string, afterType?: string) => {
      const normalize = afterType === undefined;
      if (normalize) {
        afterType = beforeType.replace(/<(([^> ]*)[^>]*)>(&nbsp;| )\|<\/\2>/g, '<$1>|</$2>').replace(/&nbsp;/g, ' ');
        beforeType = beforeType.replace(/\|/g, '');
      }
      return GeneralSteps.sequence([
        Step.label('Check content', tinyApis.sAssertContent(beforeType)),
        Step.label('Insert cursor marker', Step.sync(() => editor.insertContent('|'))),
        Step.label('Check cursor position', Step.sync(() => {
          const content = editor.getContent();
          const normalizedContent = normalize ? content.replace(/&nbsp;/g, ' ') : content;
          Assertions.assertHtml('Checking cursor', afterType, normalizedContent);
        }))
      ]);
    };

    const steps = Utils.withTeardown([
      Logger.t('Apply html replacement pattern on space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'heading'),
        sAssertContentAndCursor('<h1>My Heading</h1><p>&nbsp;</p>', '<h1>My Heading</h1><p>&nbsp;|</p>')
      ])),
      Logger.t('Apply html replacement pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'heading'),
        sAssertContentAndCursor('<h1>My Heading</h1><p>&nbsp;|</p>')
      ])),
      Logger.t('Apply html replacement pattern on enter in middle of word', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'XheadingX', 8),
        sAssertContentAndCursor('<p>X</p><h1>My Heading</h1><p>&nbsp;</p><p>|X</p>')
      ])),
      Logger.t('Apply complex html replacement pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'complex pattern'),
        sAssertContentAndCursor('<h1>Text</h1><p>More text</p><p>&nbsp;|</p>')
      ])),
      Logger.t('Apply text replacement pattern on space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'brb'),
        sAssertContentAndCursor('<p>be right back&nbsp;|</p>')
      ])),
      Logger.t('Apply text replacement pattern on space with content before', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'Xbrb'),
        sAssertContentAndCursor('<p>Xbe right back&nbsp;|</p>')
      ])),
      Logger.t('Apply text replacement pattern on space with content after', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'brbX', 3),
        sAssertContentAndCursor('<p>be right back |X</p>')
      ])),
      Logger.t('Do not replace on pattern with content after when cursor is in the wrong position', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, 'brbX'),
        sAssertContentAndCursor('<p>brbX&nbsp;|</p>')
      ])),
      Logger.t('Apply text replacement pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'brb'),
        sAssertContentAndCursor('<p>be right back</p><p>&nbsp;|</p>')
      ])),
      Logger.t('Apply text replacement pattern on enter with content before', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'Xbrb'),
        sAssertContentAndCursor('<p>Xbe right back</p><p>&nbsp;|</p>')
      ])),
      Logger.t('Apply text replacement pattern on enter with content after', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, 'brbX', 3),
        sAssertContentAndCursor('<p>be right back</p><p>|X</p>')
      ])),
      Logger.t('Apply replacement pattern and inline pattern on space', GeneralSteps.sequence([
        Utils.sSetContentAndPressSpace(tinyApis, tinyActions, '*brb*'),
        sAssertContentAndCursor('<p><em>be right back</em>&nbsp;|</p>')
      ])),
      Logger.t('Apply replacement pattern and block pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '#brb'),
        sAssertContentAndCursor('<h1>be right back</h1><p>&nbsp;|</p>')
      ])),
      Logger.t('Apply replacement pattern italic pattern and block pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '#*brb*'),
        sAssertContentAndCursor('<h1><em>be right back</em></h1><p>&nbsp;|</p>')
      ])),
      Logger.t('Apply replacement pattern italic pattern and block pattern on enter', GeneralSteps.sequence([
        Utils.sSetContentAndPressEnter(tinyApis, tinyActions, '<span data-mce-spelling="invalid">#</span>*brb<span data-mce-spelling="invalid">*</span>', 3, [ 0 ]),
        sAssertContentAndCursor('<h1><em>be right back</em></h1><p>&nbsp;|</p>')
      ]))
    ], tinyApis.sSetContent(''));

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    textpattern_patterns: [
      { start: 'brb', replacement: 'be right back' },
      { start: 'heading', replacement: '<h1>My Heading</h1>' },
      { start: 'complex pattern', replacement: '<h1>Text</h1><p>More text</p>' },
      { start: '*', end: '*', format: 'italic' },
      { start: '#', format: 'h1' }
    ],
    indent: false,
    plugins: 'textpattern',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
