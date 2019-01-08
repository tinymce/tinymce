import { Assertions, Logger, Pipeline, Step, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.wordcount.ApiTest', (success, failure) => {

  Plugin();
  Theme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {

    const makeStep = (label, content, numWords) => {
      return Logger.t(`${label} in ${content}`, Step.sync(() => {
        editor.setContent(content);
        const result = editor.plugins.wordcount.getCount();
        Assertions.assertEq('Assert number of words is ' + numWords, result, numWords);
      }));
    };

    Pipeline.async({}, Log.steps('TBA', 'WordCount: Test content other than simple words are ignored for wordcount', [
      makeStep('Simple word count', '<p>My sentence is this.</p>', 4),
      makeStep('Does not count dashes', '<p>Something -- ok</p>', 2),
      makeStep('Does not count asterisks, non-word characters', '<p>* something\n\u00b7 something else</p>', 3),
      makeStep('Does count numbers', '<p>Something 123 ok</p>', 3),
      makeStep('Does not count htmlentities', '<p>It&rsquo;s my life &ndash; &#8211; &#x2013; don\'t you forget.</p>', 6),
      makeStep('Counts hyphenated words as one word', '<p>Hello some-word here.</p>', 3),
      makeStep('Counts words between blocks as two words', '<p>Hello</p><p>world</p>', 2),
    ]), onSuccess, onFailure);
  }, {
    plugins: 'wordcount',
    theme: 'silver',
    base_url: '/project/js/tinymce'
  }, success, failure);
});
