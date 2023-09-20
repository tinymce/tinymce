import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.EditorGetContentRawTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const testGetContentRaw = (initial: string, expected: string) => () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = initial;
    assert.strictEqual(editor.getContent({ format: 'raw' }), expected, 'Should be expected html');
    assert.strictEqual(editor.getBody().innerHTML, initial, 'Should not have modified the editor body');
  };

  it('getContent raw should preserve non-temporary internal nodes',
    testGetContentRaw(
      '<p>test0<span data-mce-bogus="1">bogus</span></p><p>test1</p><p data-mce-bogus="1">test2</p>',
      '<p>test0<span data-mce-bogus="1">bogus</span></p><p>test1</p><p data-mce-bogus="1">test2</p>'));

  it('getContent raw should not preserve temporary internal nodes or ZWNBSP',
    testGetContentRaw(
      '<p>te\ufeffst0<span data-mce-bogus="1">bogus</span></p><p data-mce-selected="true">test1</p><p data-mce-bogus="all">test2</p><p>test3</p>',
      '<p>test0<span data-mce-bogus="1">bogus</span></p><p>test1</p><p>test3</p>'));

  it('TINY-10236: getContent raw should not preserve comment nodes containing ZWNBSP',
    testGetContentRaw(
      '<p>test0</p><!-- te\uFEFFst1 --><!-- test2 --><!-- te\uFEFFst3 -->',
      '<p>test0</p><!-- test2 -->'));

  context('Content XSS', () => {
    const xssFnName = 'xssfn';

    const testGetContentRawMxss = (content: string) => () => {
      const editor = hook.editor();
      let hasXssOccurred = false;
      (editor.getWin() as any)[xssFnName] = () => hasXssOccurred = true;
      editor.getBody().innerHTML = content;
      editor.getBody().innerHTML = editor.getContent({ format: 'raw' });
      assert.isFalse(hasXssOccurred, 'XSS should not have occurred');
      (editor.getWin() as any)[xssFnName] = null;
    };

    it('TINY-10236: Excluding data-mce-bogus="all" elements does not cause comment node mXSS',
      testGetContentRawMxss(`<!--<br data-mce-bogus="all">><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10236: Excluding temporary attributes does not cause comment node mXSS',
      testGetContentRawMxss(`<!--data-mce-selected="x"><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10236: Excluding ZWNBSP does not cause comment node mXSS',
      testGetContentRawMxss(`<!--\uFEFF><iframe onload="window.${xssFnName}();">->`));
  });
});
