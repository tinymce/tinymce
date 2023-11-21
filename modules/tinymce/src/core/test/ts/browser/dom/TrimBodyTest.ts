import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import * as TrimBody from 'tinymce/core/dom/TrimBody';

describe('browser.tinymce.core.dom.TrimBodyTest', () => {
  const isSafari = PlatformDetection.detect().browser.isSafari();

  context('trim', () => {
    it('trim should trim body containing trimmmable nodes', () => {
      const tempAttrs = [ 'data-mce-selected' ];
      const body = document.createElement('div');
      const initialHtml = '<p>Test</p><span data-mce-bogus="all">bogus</span><span data-mce-bogus="1">bogus1</span><p>Test</p><!-- \ufeffcomment --><noscript>\ufeffnoscript</noscript><span data-mce-selected="true">tempAttr</span><p>Test</p>';
      body.innerHTML = initialHtml;
      const trimmedBody = TrimBody.trim(body, tempAttrs);
      assert.strictEqual(trimmedBody.innerHTML, '<p>Test</p><span data-mce-bogus="1">bogus1</span><p>Test</p><!----><noscript></noscript><span>tempAttr</span><p>Test</p>', 'Should trim trimmable nodes');
      assert.strictEqual(body.innerHTML, initialHtml, 'Should not modify original body');
      assert.notStrictEqual(trimmedBody, body, 'Should trim and return a new body when body is trimmable');
    });

    it('trim should not trim body without trimmable nodes', () => {
      const tempAttrs = [ 'data-mce-selected' ];
      const body = document.createElement('div');
      const initialHtml = '<p>Test</p><span data-mce-bogus="1">bogus1</span><p>Test</p><!-- comment --><noscript>noscript</noscript><span>span</span><p>Test</p>';
      body.innerHTML = initialHtml;
      const trimmedBody = TrimBody.trim(body, tempAttrs);
      assert.strictEqual(trimmedBody.innerHTML, initialHtml, 'Should not trim body without temporary nodes');
      assert.strictEqual(trimmedBody, body, 'Should return the original body when body is not trimmable');
    });
  });

  context('Zwsp comments', () => {
    it('hasZwspComment', () => {
      const commentDivWithZwsp = document.createElement('div');
      commentDivWithZwsp.innerHTML = `<p>Test</p><!-- \ufeffcomment --><p>Test</p>`;
      assert.isTrue(TrimBody.hasZwspComment(commentDivWithZwsp));

      const commentDiv = document.createElement('div');
      commentDiv.innerHTML = '<p>Test</p><!-- comment --><p>Test</p>';
      assert.isFalse(TrimBody.hasZwspComment(commentDiv));

      const commentlessDiv = document.createElement('div');
      commentlessDiv.innerHTML = '<p>Test</p><p>Test</p>';
      assert.isFalse(TrimBody.hasZwspComment(commentlessDiv));
    });

    it('emptyZwspComments', () => {
      const commentDivWithZwsp = document.createElement('div');
      commentDivWithZwsp.innerHTML = '<!-- \ufeffcommentent --><p>Test</p><!-- comm\ufeffent --><!-- \ufeff --><!-- commentwithoutufeff --><p>Test</p>';
      TrimBody.emptyZwspComments(commentDivWithZwsp);
      assert.strictEqual(commentDivWithZwsp.innerHTML, '<!----><p>Test</p><!----><!----><!-- commentwithoutufeff --><p>Test</p>');

      const commentDiv = document.createElement('div');
      commentDiv.innerHTML = '<p>Test</p><!-- comment --><p>Test</p>';
      TrimBody.emptyZwspComments(commentDiv);
      assert.strictEqual(commentDiv.innerHTML, '<p>Test</p><!-- comment --><p>Test</p>');

      const commentlessDiv = document.createElement('div');
      commentlessDiv.innerHTML = '<p>Test</p><p>Test</p>';
      TrimBody.emptyZwspComments(commentlessDiv);
      assert.strictEqual(commentlessDiv.innerHTML, '<p>Test</p><p>Test</p>');
    });
  });

  context('Temporary nodes', () => {
    it('hasTemporaryNode', () => {
      const bogusDiv = document.createElement('div');
      bogusDiv.innerHTML = '<p>Test</p><span data-mce-bogus="all">bogus</span><p>Test</p>';
      assert.isTrue(TrimBody.hasTemporaryNode([], bogusDiv));

      const tempAttrDiv = document.createElement('div');
      tempAttrDiv.innerHTML = '<p>Test</p><span data-mce-selected="true">tempAttr</span><p>Test</p>';
      assert.isTrue(TrimBody.hasTemporaryNode([ 'data-mce-selected' ], tempAttrDiv));

      const templessDiv = document.createElement('div');
      templessDiv.innerHTML = '<p>Test</p><p>Test</p>';
      assert.isFalse(TrimBody.hasTemporaryNode([ 'data-mce-selected' ], templessDiv));
    });

    it('trimTemporaryNodes', () => {
      const bogusDiv = document.createElement('div');
      bogusDiv.innerHTML = '<p>Test</p><span data-mce-bogus="all">bogusall</span><p>Test</p><span data-mce-bogus="1">bogus1</span><span data-mce-bogus="all">bogusall2</span>';
      TrimBody.trimTemporaryNodes([], bogusDiv);
      assert.strictEqual(bogusDiv.innerHTML, '<p>Test</p><p>Test</p><span data-mce-bogus="1">bogus1</span>');

      const tempAttrDiv = document.createElement('div');
      tempAttrDiv.innerHTML = '<p>Test</p><span data-mce-selected="true">tempAttr</span><p data-mce-selected="false">Test</p>';
      TrimBody.trimTemporaryNodes([ 'data-mce-selected' ], tempAttrDiv);
      assert.strictEqual(tempAttrDiv.innerHTML, '<p>Test</p><span>tempAttr</span><p>Test</p>');

      const templessDiv = document.createElement('div');
      templessDiv.innerHTML = '<p>Test</p><p>Test</p>';
      TrimBody.trimTemporaryNodes([ 'data-mce-selected' ], templessDiv);
      assert.strictEqual(templessDiv.innerHTML, '<p>Test</p><p>Test</p>');
    });
  });

  context('Unescaped zwsp text', () => {
    const unescapedClosingTextParents = [
      'noscript',
      'style',
      'script',
      'xmp',
      'iframe',
      'noembed',
      'noframes'
    ];

    it('hasUnescapedZwspText with div parent should always return false', () => {
      const divZwspText = document.createElement('div');
      divZwspText.innerHTML = `<p>Test</p><div>\ufeffTest</div><p>Test</p>`;
      assert.isFalse(TrimBody.hasUnescapedZwspText(divZwspText));

      const divText = document.createElement('div');
      divText.innerHTML = `<p>Test</p><div>Test</div><p>Test</p>`;
      assert.isFalse(TrimBody.hasUnescapedZwspText(divText));
    });

    it('emptyUnescapedZwspTexts with div parent should do nothing', () => {
      const divZwspText = document.createElement('div');
      divZwspText.innerHTML = `<p>Test</p><div>\ufeffTest</div><p>Test</p>`;
      TrimBody.emptyUnescapedZwspTexts(divZwspText);
      assert.strictEqual(divZwspText.innerHTML, `<p>Test</p><div>\ufeffTest</div><p>Test</p>`);

      const divText = document.createElement('div');
      divText.innerHTML = `<p>Test</p><div>Test</div><p>Test</p>`;
      TrimBody.emptyUnescapedZwspTexts(divText);
      assert.strictEqual(divText.innerHTML, `<p>Test</p><div>Test</div><p>Test</p>`);
    });

    Arr.each(unescapedClosingTextParents, (parent) => {
      it(`hasUnescapedZwspText with ${parent} parent`, () => {
        const unescapedZwspText = document.createElement('div');
        unescapedZwspText.innerHTML = `<p>Test</p><${parent}>Test\ufeffTest</${parent}><p>Test</p>`;
        assert.isTrue(TrimBody.hasUnescapedZwspText(unescapedZwspText));

        const unescapedText = document.createElement('div');
        unescapedText.innerHTML = `<p>Test</p><${parent}>Test</${parent}><p>Test</p>`;
        assert.isFalse(TrimBody.hasUnescapedZwspText(unescapedText));
      });

      it(`emptyUnescapedZwspTexts with ${parent} parent`, () => {
        const unescapedZwspText = document.createElement('div');
        unescapedZwspText.innerHTML = `<p>Test</p><${parent}>Test\ufeffTest</${parent}><p>Test</p>`;
        TrimBody.emptyUnescapedZwspTexts(unescapedZwspText);
        assert.strictEqual(unescapedZwspText.innerHTML, `<p>Test</p><${parent}></${parent}><p>Test</p>`);

        const unescapedText = document.createElement('div');
        unescapedText.innerHTML = `<p>Test</p><${parent}>Test</${parent}><p>Test</p>`;
        TrimBody.emptyUnescapedZwspTexts(unescapedText);
        assert.strictEqual(unescapedText.innerHTML, `<p>Test</p><${parent}>Test</${parent}><p>Test</p>`);
      });
    });

    // TINY-10305: <plaintext> is special because it is used without a closing tag and turns everything after it into its own content.
    // Modern browsers will add a closing </plaintext> at the end of the body.
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/plaintext
    context('plaintext', () => {
      const plaintext = 'plaintext';

      it('hasUnescapedZwspText with plaintext parent', () => {
        const unescapedZwspText = document.createElement('div');
        unescapedZwspText.innerHTML = `<p>Test</p><${plaintext}>Test\ufeffTest<p>Test</p>`;
        assert.isTrue(TrimBody.hasUnescapedZwspText(unescapedZwspText));

        const unescapedText = document.createElement('div');
        unescapedText.innerHTML = `<p>Test</p><${plaintext}>Test<p>Test</p>`;
        assert.isFalse(TrimBody.hasUnescapedZwspText(unescapedText));
      });

      it('emptyUnescapedZwspTexts with plaintext parent', () => {
        const unescapedZwspText = document.createElement('div');
        unescapedZwspText.innerHTML = `<p>Test</p><${plaintext}>Test\ufeffTest<p>Test</p>`;
        TrimBody.emptyUnescapedZwspTexts(unescapedZwspText);
        assert.strictEqual(unescapedZwspText.innerHTML, `<p>Test</p><${plaintext}></${plaintext}>`);

        const unescapedText = document.createElement('div');
        unescapedText.innerHTML = `<p>Test</p><${plaintext}>Test<p>Test</p>`;
        TrimBody.emptyUnescapedZwspTexts(unescapedText);
        // TINY-10305: Safari escapes text nodes within <plaintext>.
        assert.strictEqual(unescapedText.innerHTML,
          isSafari ? `<p>Test</p><${plaintext}>Test&lt;p&gt;Test&lt;/p&gt;</${plaintext}>` : `<p>Test</p><${plaintext}>Test<p>Test</p></${plaintext}>`);
      });
    });
  });
});
