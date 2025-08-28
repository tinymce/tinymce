import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { getText } from 'tinymce/plugins/wordcount/core/GetText';
import Plugin from 'tinymce/plugins/wordcount/Plugin';

describe('browser.tinymce.plugins.wordcount.GetTextTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'wordcount',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const assertGetText = (node: Node, expected: string[]) => {
    const editor = hook.editor();
    const actual = getText(node, editor.schema);
    assert.deepEqual(actual, expected, 'should be the same');
  };

  it('getText', () => {
    const editor = hook.editor();
    const c = (html: string) => editor.dom.create('div', {}, html);

    assertGetText(c('<p></p>'), []);
    assertGetText(c('<p>a b</p>'), [ 'a b' ]);
    assertGetText(c('<p>a&nbsp;b</p>'), [ 'a\u00a0b' ]);
    assertGetText(c('<p>a\uFEFFb</p>'), [ 'ab' ]);
    assertGetText(c('<p><span>a</span> b</p>'), [ 'a b' ]);
    assertGetText(c('<p>a</p><p>b</p>'), [ 'a', 'b' ]);
    assertGetText(c('<p>a<br>b</p>'), [ 'a', 'b' ]);
  });
});
