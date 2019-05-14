import { Pipeline, Step, RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';
import { Node } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

import Plugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { getText } from 'tinymce/plugins/wordcount/core/GetText';

UnitTest.asynctest('browser.tinymce.plugins.wordcount.GetTextTest', (success, failure) => {
  Plugin();
  Theme();

  TinyLoader.setup(function (editor: Editor, onSuccess, onFailure) {
    const sAssertGetText = (node: Node, expected) => {
      return Step.sync(() => {
        const actual = getText(node, editor.schema);

        RawAssertions.assertEq('should be the same', expected, actual);
      });
    };

    const c = (html) => editor.dom.create('div', {}, html);

    Pipeline.async({}, [
      sAssertGetText(c('<p></p>'), []),
      sAssertGetText(c('<p>a b</p>'), ['a b']),
      sAssertGetText(c('<p>a&nbsp;b</p>'), ['a\u00a0b']),
      sAssertGetText(c('<p>a\uFEFFb</p>'), ['a\uFEFFb']),
      sAssertGetText(c('<p><span>a</span> b</p>'), ['a b']),
      sAssertGetText(c('<p>a</p><p>b</p>'), ['a', 'b']),
      sAssertGetText(c('<p>a<br>b</p>'), ['a', 'b'])
    ], onSuccess, onFailure);
  }, {
    plugins: 'wordcount',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
