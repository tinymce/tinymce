import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyApis, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.EditorGetContentRawTest', () => {
  const isSafari = PlatformDetection.detect().browser.isSafari();

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const testGetContentRaw = (initial: string, expected: string) => () => {
    const editor = hook.editor();
    TinyApis(editor).setRawContent(initial);
    assert.strictEqual(editor.getContent({ format: 'raw' }), expected, 'Should be expected html');
    TinyAssertions.assertRawContent(editor, initial);
  };

  it('getContent raw should preserve non-temporary internal nodes',
    testGetContentRaw(
      '<p>test0<span data-mce-bogus="1">bogus</span></p><p>test1</p><p data-mce-bogus="1">test2</p>',
      '<p>test0<span data-mce-bogus="1">bogus</span></p><p>test1</p><p data-mce-bogus="1">test2</p>'));

  it('getContent raw should not preserve temporary internal nodes or ZWNBSP',
    testGetContentRaw(
      '<p>te\ufeffst0<span data-mce-bogus="1">bogus</span></p><p data-mce-selected="true">test1</p><p data-mce-bogus="all">test2</p><p>test3</p>',
      '<p>test0<span data-mce-bogus="1">bogus</span></p><p>test1</p><p>test3</p>'));

  it('TINY-10236: getContent raw should empty comment nodes containing ZWNBSP',
    testGetContentRaw(
      '<p>test0</p><!-- te\uFEFFst1 --><!-- test2 --><!-- te\uFEFFst3 -->',
      '<p>test0</p><!----><!-- test2 --><!---->'));

  Arr.each([ 'noscript', 'style', 'script', 'xmp', 'iframe', 'noembed', 'noframes' ], (parent) => {
    it(`TINY-10305: getContent raw should empty unescaped text nodes containing ZWNBSP within ${parent}`,
      testGetContentRaw(
        `<p>test0</p><${parent}>te\uFEFFst1</${parent}><${parent}>test2</${parent}><${parent}>te\uFEFFst3</${parent}>`,
        `<p>test0</p><${parent}></${parent}><${parent}>test2</${parent}><${parent}></${parent}>`
      ));
  });

  it('TINY-10305: getContent raw should empty unescaped text nodes containing ZWNBSP within plaintext', () => {
    const editor = hook.editor();
    const initial = '<p>test0</p><plaintext>te\uFEFFst1 test2<p>te\uFEFFst3</p>';
    TinyApis(editor).setRawContent(initial);
    assert.strictEqual(editor.getContent({ format: 'raw' }), '<p>test0</p><plaintext></plaintext>', 'Should be expected html');
    // TINY-10305: Modern browsers add a closing plaintext tag to end of body. Safari escapes text nodes within <plaintext>.
    TinyAssertions.assertRawContent(editor,
      isSafari ? '<p>test0</p><plaintext>te\uFEFFst1 test2&lt;p&gt;te\uFEFFst3&lt;/p&gt;</plaintext>' : `${initial}</plaintext>`);
  });

  context('Content XSS', () => {
    const xssFnName = 'xssfn';

    const testGetContentRawMxss = (content: string) => () => {
      const editor = hook.editor();
      const apis = TinyApis(editor);
      let hasXssOccurred = false;
      (editor.getWin() as any)[xssFnName] = () => hasXssOccurred = true;
      apis.setRawContent(content);
      apis.setRawContent(editor.getContent({ format: 'raw' }));
      assert.isFalse(hasXssOccurred, 'XSS should not have occurred');
      (editor.getWin() as any)[xssFnName] = null;
    };

    it('TINY-10236: Excluding data-mce-bogus="all" elements does not cause mXSS',
      testGetContentRawMxss(`<!--<br data-mce-bogus="all">><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10236: Excluding temporary attributes does not cause mXSS',
      testGetContentRawMxss(`<!--data-mce-selected="x"><iframe onload="window.${xssFnName}();">->`));

    it('TINY-10236: Excluding ZWNBSP in comment nodes does not cause mXSS',
      testGetContentRawMxss(`<!--\uFEFF><iframe onload="window.${xssFnName}();">->`));

    Arr.each([ 'noscript', 'style', 'script', 'xmp', 'iframe', 'noembed', 'noframes' ], (parent) => {
      it(`TINY-10305: Excluding ZWNBSP in ${parent} does not cause mXSS`,
        testGetContentRawMxss(`<${parent}><\uFEFF/${parent}><\uFEFFiframe onload="window.${xssFnName}();"></${parent}>`));
    });
  });
});
