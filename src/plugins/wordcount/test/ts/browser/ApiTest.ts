import { Assertions, Logger, Pipeline, Step, Log, GeneralSteps } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { WordCountApi } from 'tinymce/plugins/wordcount/api/Api';

UnitTest.asynctest('browser.tinymce.plugins.wordcount.ApiTest', (success, failure) => {

  Plugin();
  Theme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {

    const make = (type: keyof WordCountApi) => (label: string, content: string, num: number) => {
      return Logger.t(`${label} in ${content}`, Step.sync(() => {
        editor.setContent(content);
        const result = editor.plugins.wordcount[type]();
        Assertions.assertEq('Assert count ', result, num);
      }));
    };

    const wordCountStep = make('getCount');
    const characterCountStep = make('getCharacterCount');
    const characterCountNoSpacesStep = make('getCharacterCountNoSpaces');

    Pipeline.async({}, Log.steps('TBA', 'WordCount: Test content other than simple words are ignored for wordcount', [
      Logger.t('Word count', GeneralSteps.sequence([
        wordCountStep('Simple word count', '<p>My sentence is this.</p>', 4),
        wordCountStep('Does not count dashes', '<p>Something -- ok</p>', 2),
        wordCountStep('Does not count asterisks, non-word characters', '<p>* something\n\u00b7 something else</p>', 3),
        wordCountStep('Does count numbers', '<p>Something 123 ok</p>', 3),
        wordCountStep('Does not count htmlentities', '<p>It&rsquo;s my life &ndash; &#8211; &#x2013; don\'t you forget.</p>', 6),
        wordCountStep('Counts hyphenated words as one word', '<p>Hello some-word here.</p>', 3),
        wordCountStep('Counts words between blocks as two words', '<p>Hello</p><p>world</p>', 2)
      ])),

      Logger.t('Character count', GeneralSteps.sequence([
        characterCountStep('Simple character count', '<p>My sentence is this.</p>', 20),
        characterCountStep('Does not count newline', '<p>a<br>b</p>', 2),
        characterCountStep('Counts surrogate pairs as single character', '<p>𩸽</p>', 1),
      ])),

      Logger.t('Character no spaces count', GeneralSteps.sequence([
        characterCountNoSpacesStep('Simple character count', '<p>My sentence is this.</p>', 17),
        characterCountNoSpacesStep('Counts surrogate pairs as single character', '<p>𩸽</p>', 1),
      ])),
    ]), onSuccess, onFailure);
  }, {
    plugins: 'wordcount',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
