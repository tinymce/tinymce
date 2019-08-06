import { Assertions, Logger, Pipeline, Step, Log, GeneralSteps } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader, TinyApis } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { CountGetter, WordCountApi } from 'tinymce/plugins/wordcount/api/Api';
import Editor from 'tinymce/core/api/Editor';

interface Sel {
  startPath: number[];
  soffset: number;
  finishPath: number[];
  foffset: number;
}

UnitTest.asynctest('browser.tinymce.plugins.wordcount.ApiTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const createAssertionStep = (getCount: CountGetter) => (label: string, content: string, assertedLength: number, sel?: Sel) => {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(content),
        ...(sel ? [tinyApis.sSetSelection(sel.startPath, sel.soffset, sel.finishPath, sel.foffset)] : []),
        Step.sync(() => Assertions.assertEq(label, getCount(), assertedLength))
      ]);
    };

    const api: WordCountApi = editor.plugins.wordcount as WordCountApi;

    const bodyWordCount = createAssertionStep(api.body.getWordCount);
    const bodyCharacterCount = createAssertionStep(api.body.getCharacterCount);
    const bodyCharacterCountWithoutSpaces = createAssertionStep(api.body.getCharacterCountWithoutSpaces);

    const selectionWordCount = createAssertionStep(api.selection.getWordCount);
    const selectionCharacterCount = createAssertionStep(api.selection.getCharacterCount);
    const selectionCharacterCountWithoutSpaces = createAssertionStep(api.selection.getCharacterCountWithoutSpaces);

    Pipeline.async({}, Log.steps('TBA', 'WordCount', [
      Logger.t('Body word count', GeneralSteps.sequence([
        bodyWordCount('Simple word count', '<p>My sentence is this.</p>', 4),
        bodyWordCount('Simple word count', '<p>My sentence is this.</p>', 4),
        bodyWordCount('Does not count dashes', '<p>Something -- ok</p>', 2),
        bodyWordCount('Does not count asterisks, non-word characters', '<p>* something\n\u00b7 something else</p>', 3),
        bodyWordCount('Does count numbers', '<p>Something 123 ok</p>', 3),
        bodyWordCount('Does not count htmlentities', '<p>It&rsquo;s my life &ndash; &#8211; &#x2013; don\'t you forget.</p>', 6),
        bodyWordCount('Counts hyphenated words as one word', '<p>Hello some-word here.</p>', 3),
        bodyWordCount('Counts words between blocks as two words', '<p>Hello</p><p>world</p>', 2)
      ])),

      Logger.t('Body character count', GeneralSteps.sequence([
        bodyCharacterCount('Simple character count', '<p>My sentence is this.</p>', 20),
        bodyCharacterCount('Does not count newline', '<p>a<br>b</p>', 2),
        bodyCharacterCount('Counts surrogate pairs as single character', '<p>𩸽</p>', 1)
      ])),

      Logger.t('Body character count without spaces', GeneralSteps.sequence([
        bodyCharacterCountWithoutSpaces('Simple character count', '<p>My sentence is this.</p>', 17),
        bodyCharacterCountWithoutSpaces('Counts surrogate pairs as single character', '<p>𩸽</p>', 1),
      ])),

      Logger.t('Selection word count', GeneralSteps.sequence([
        selectionWordCount('Simple word count', '<p>My sentence is this.</p>', 2, {
          startPath: [0, 0],
          soffset: 2,
          finishPath: [0, 0],
          foffset: 15
        }),
      ])),

      Logger.t('Selection character count', GeneralSteps.sequence([
        selectionCharacterCount('Simple word count', '<p>My sentence is this.</p>', 13, {
          startPath: [0, 0],
          soffset: 2,
          finishPath: [0, 0],
          foffset: 15
        }),
      ])),

      Logger.t('Selection character count without spaces', GeneralSteps.sequence([
        selectionCharacterCountWithoutSpaces('Simple word count', '<p>My sentence is this.</p>', 10, {
          startPath: [0, 0],
          soffset: 2,
          finishPath: [0, 0],
          foffset: 15
        }),
      ]))
    ]), onSuccess, onFailure);
  }, {
    plugins: 'wordcount',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
