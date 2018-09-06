import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Plugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.wordcount.ApiTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  suite.test('Blank document has 0 words', function (editor) {
    editor.setContent('');
    const result = editor.plugins.wordcount.getCount();
    LegacyUnit.equal(result, 0);
  });

  suite.test('Simple word count', function (editor) {
    editor.setContent('<p>My sentence is this.</p>');
    const result = editor.plugins.wordcount.getCount();
    LegacyUnit.equal(result, 4);
  });

  suite.test('Does not count dashes', function (editor) {
    editor.setContent('<p>Something -- ok</p>');
    const result = editor.plugins.wordcount.getCount();
    LegacyUnit.equal(result, 2);
  });

  suite.test('Does not count asterisks, non-word characters', function (editor) {
    editor.setContent('<p>* something\n\u00b7 something else</p>');
    const result = editor.plugins.wordcount.getCount();
    LegacyUnit.equal(result, 3);
  });

  suite.test('Does count numbers', function (editor) {
    editor.setContent('<p>Something 123 ok</p>');
    const result = editor.plugins.wordcount.getCount();
    LegacyUnit.equal(result, 3);
  });

  suite.test('Does not count htmlentities', function (editor) {
    editor.setContent('<p>It&rsquo;s my life &ndash; &#8211; &#x2013; don\'t you forget.</p>');
    const result = editor.plugins.wordcount.getCount();
    LegacyUnit.equal(result, 6);
  });

  suite.test('Counts hyphenated words as one word', function (editor) {
    editor.setContent('<p>Hello some-word here.</p>');
    const result = editor.plugins.wordcount.getCount();
    LegacyUnit.equal(result, 3);
  });

  suite.test('Counts words between blocks as two words', function (editor) {
    editor.setContent('<p>Hello</p><p>world</p>');
    const result = editor.plugins.wordcount.getCount();
    LegacyUnit.equal(result, 2);
  });

  suite.test('Counts words in table', function (editor) {
    editor.setContent(`
      <table style="width: 100%; border-collapse: collapse;" border="1">
        <tbody>
          <tr>
            <td style="width: 50%;">a</td>
            <td style="width: 50%;">b</td>
          </tr>
        </tbody>
      </table>
    `);
    const result = editor.plugins.wordcount.getCount();
    LegacyUnit.equal(result, 2);
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    plugins: 'wordcount',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
