import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as TrimBody from 'tinymce/core/dom/TrimBody';

describe('browser.tinymce.core.dom.TrimBodyTest', () => {
  context('trim', () => {
    it('trim should trim body containing temporary nodes', () => {
      const tempAttrs = [ 'data-mce-bogus', 'data-mce-selected' ];
      const body = document.createElement('div');
      const initialHtml = '<p>Test</p><span data-mce-bogus="all">bogus</span><p>Test</p><span data-mce-selected="true">tempAttr</span><p>Test</p>';
      body.innerHTML = initialHtml;
      const trimmedBody = TrimBody.trim(body, tempAttrs);
      assert.strictEqual(trimmedBody.innerHTML, '<p>Test</p><p>Test</p><span>tempAttr</span><p>Test</p>', 'Should trim temporary nodes');
      assert.strictEqual(body.innerHTML, initialHtml, 'Should not modify original body');
      assert.notStrictEqual(trimmedBody, body, 'Should trim and return a new body when body is trimmable');
    });

    it('trim should not trim body without temporary nodes', () => {
      const tempAttrs = [ 'data-mce-bogus', 'data-mce-selected' ];
      const body = document.createElement('div');
      const initialHtml = '<p>Test</p><p>Test</p>';
      body.innerHTML = initialHtml;
      const trimmedBody = TrimBody.trim(body, tempAttrs);
      assert.strictEqual(trimmedBody.innerHTML, initialHtml, 'Should not trim body without temporary nodes');
      assert.strictEqual(trimmedBody, body, 'Should return the original body when body is not trimmable');
    });
  });

  context('Comments', () => {
    it('hasComments', () => {
      const commentDiv = document.createElement('div');
      commentDiv.innerHTML = '<p>Test</p><!-- comment --><p>Test</p>';
      assert.isTrue(TrimBody.hasComments(commentDiv));

      const commentlessDiv = document.createElement('div');
      commentlessDiv.innerHTML = '<p>Test</p><p>Test</p>';
      assert.isFalse(TrimBody.hasComments(commentlessDiv));
    });

    it('removeCommentsContainingZwsp', () => {
      const commentDiv = document.createElement('div');
      commentDiv.innerHTML = '<p>Test</p><!-- comm\ufeffent --><!-- \ufeff --><!-- commentwithoutufeff --><p>Test</p>';
      TrimBody.removeCommentsContainingZwsp(commentDiv);
      assert.strictEqual(commentDiv.innerHTML, '<p>Test</p><!-- commentwithoutufeff --><p>Test</p>');

      const commentlessDiv = document.createElement('div');
      commentlessDiv.innerHTML = '<p>Test</p><p>Test</p>';
      TrimBody.removeCommentsContainingZwsp(commentlessDiv);
      assert.strictEqual(commentlessDiv.innerHTML, '<p>Test</p><p>Test</p>');
    });
  });

  context('Temporary nodes', () => {
    it('hasTemporaryNodes', () => {
      const bogusDiv = document.createElement('div');
      bogusDiv.innerHTML = '<p>Test</p><span data-mce-bogus="all">bogus</span><p>Test</p>';
      assert.isTrue(TrimBody.hasTemporaryNodes(bogusDiv, []));

      const tempAttrDiv = document.createElement('div');
      tempAttrDiv.innerHTML = '<p>Test</p><span data-mce-selected="true">tempAttr</span><p>Test</p>';
      assert.isTrue(TrimBody.hasTemporaryNodes(tempAttrDiv, [ 'data-mce-selected' ]));

      const templessDiv = document.createElement('div');
      templessDiv.innerHTML = '<p>Test</p><p>Test</p>';
      assert.isFalse(TrimBody.hasTemporaryNodes(templessDiv, [ 'data-mce-selected' ]));
    });

    it('trimTemporaryNodes', () => {
      const bogusDiv = document.createElement('div');
      bogusDiv.innerHTML = '<p>Test</p><span data-mce-bogus="all">bogus</span><p>Test</p>';
      TrimBody.trimTemporaryNodes(bogusDiv, []);
      assert.strictEqual(bogusDiv.innerHTML, '<p>Test</p><p>Test</p>');

      const tempAttrDiv = document.createElement('div');
      tempAttrDiv.innerHTML = '<p>Test</p><span data-mce-selected="true">tempAttr</span><p>Test</p>';
      TrimBody.trimTemporaryNodes(tempAttrDiv, [ 'data-mce-selected' ]);
      assert.strictEqual(tempAttrDiv.innerHTML, '<p>Test</p><span>tempAttr</span><p>Test</p>');

      const templessDiv = document.createElement('div');
      templessDiv.innerHTML = '<p>Test</p><p>Test</p>';
      TrimBody.trimTemporaryNodes(templessDiv, [ 'data-mce-selected' ]);
      assert.strictEqual(templessDiv.innerHTML, '<p>Test</p><p>Test</p>');
    });
  });
});
