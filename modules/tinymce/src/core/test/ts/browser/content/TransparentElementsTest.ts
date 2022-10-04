import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj, Singleton } from '@ephox/katamari';
import { Html, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';
import * as TransparentElements from 'tinymce/core/content/TransparentElements';

describe('browser.tinymce.core.content.TransparentElementsTest', () => {
  const schema = Schema();
  const transparentElements = Arr.unique(Arr.map(Obj.keys(schema.getTransparentElements()), (key) => key.toLowerCase()));

  context('update', () => {
    const rootState = Singleton.value<SugarElement<HTMLElement>>();

    beforeEach(() => {
      const root = SugarElement.fromTag('div');
      Insert.append(SugarBody.body(), root);
      rootState.set(root);
    });

    afterEach(() => {
      rootState.get().each((root) => Remove.remove(root));
      rootState.clear();
    });

    it('TINY-9172: Should add data-mce-block on transparent block elements', () => {
      const root = rootState.get().getOrDie();

      Html.set(root, '<a href="#">link</a><div><a href="#"><p>link</p></a></div><div><a href="#">link</a></div>');
      TransparentElements.update(schema, root.dom, true);
      assert.equal(Html.get(root), '<a href="#" data-mce-block="true">link</a><div><a href="#" data-mce-block="true"><p>link</p></a></div><div><a href="#">link</a></div>');
    });

    it('TINY-9172: Should add data-mce-block on transparent block elements that wrap blocks but not at root level', () => {
      const root = rootState.get().getOrDie();

      Html.set(root, '<a href="#">link</a><div><a href="#"><p>link</p></a></div><div><a href="#">link</a></div>');
      TransparentElements.update(schema, root.dom, false);
      assert.equal(Html.get(root), '<a href="#">link</a><div><a href="#" data-mce-block="true"><p>link</p></a></div><div><a href="#">link</a></div>');
    });
  });

  context('isTransparentBlock', () => {
    it('TINY-9172: Should return true for any transparent element with data-mce-block', () => {
      Arr.each(transparentElements, (name) => {
        const elm = document.createElement(name);
        elm.setAttribute('data-mce-block', 'true');
        assert.isTrue(TransparentElements.isTransparentBlock(schema, elm));
      });
    });

    it('TINY-9172: Should return false for any transparent element without data-mce-block', () => {
      Arr.each(transparentElements, (name) => {
        assert.isFalse(TransparentElements.isTransparentBlock(schema, document.createElement(name)));
      });
    });

    it('TINY-9172: Should return false for any non element', () => {
      assert.isFalse(TransparentElements.isTransparentBlock(schema, document.createTextNode('')));
      assert.isFalse(TransparentElements.isTransparentBlock(schema, document.createComment('')));
    });

    it('TINY-9172: Should return false for any non transparent element', () => {
      assert.isFalse(TransparentElements.isTransparentBlock(schema, document.createElement('p')));
      assert.isFalse(TransparentElements.isTransparentBlock(schema, document.createElement('span')));
    });
  });

  context('isTransparentInline', () => {
    it('TINY-9172: Should return false for any transparent element with data-mce-block', () => {
      Arr.each(transparentElements, (name) => {
        const elm = document.createElement(name);
        elm.setAttribute('data-mce-block', 'true');
        assert.isFalse(TransparentElements.isTransparentInline(schema, elm));
      });
    });

    it('TINY-9172: Should return true for any transparent element without data-mce-block', () => {
      Arr.each(transparentElements, (name) => {
        assert.isTrue(TransparentElements.isTransparentInline(schema, document.createElement(name)));
      });
    });

    it('TINY-9172: Should return false for any non element', () => {
      assert.isFalse(TransparentElements.isTransparentInline(schema, document.createTextNode('')));
      assert.isFalse(TransparentElements.isTransparentInline(schema, document.createComment('')));
    });

    it('TINY-9172: Should return false for any non transparent element', () => {
      assert.isFalse(TransparentElements.isTransparentInline(schema, document.createElement('p')));
      assert.isFalse(TransparentElements.isTransparentInline(schema, document.createElement('span')));
    });
  });

  context('isTransparentAstBlock', () => {
    it('TINY-9172: Should return true for any transparent element with data-mce-block', () => {
      Arr.each(transparentElements, (name) => {
        const elm = AstNode.create(name);
        elm.attr('data-mce-block', 'true');
        assert.isTrue(TransparentElements.isTransparentAstBlock(schema, elm));
      });
    });

    it('TINY-9172: Should return false for any transparent element without data-mce-block', () => {
      Arr.each(transparentElements, (name) =>
        assert.isFalse(TransparentElements.isTransparentAstBlock(schema, AstNode.create(name)))
      );
    });

    it('TINY-9172: Should return false for any non element', () => {
      assert.isFalse(TransparentElements.isTransparentAstBlock(schema, AstNode.create('#text')));
      assert.isFalse(TransparentElements.isTransparentAstBlock(schema, AstNode.create('#comment')));
    });

    it('TINY-9172: Should return false for any non transparent element', () => {
      assert.isFalse(TransparentElements.isTransparentAstBlock(schema, AstNode.create('p')));
      assert.isFalse(TransparentElements.isTransparentAstBlock(schema, AstNode.create('span')));
    });
  });

  context('isTransparentAstInline', () => {
    it('TINY-9172: Should return false for any transparent element with data-mce-block', () => {
      Arr.each(transparentElements, (name) => {
        const elm = AstNode.create(name);
        elm.attr('data-mce-block', 'true');
        assert.isFalse(TransparentElements.isTransparentAstInline(schema, elm));
      });
    });

    it('TINY-9172: Should return true for any transparent element without data-mce-block', () => {
      Arr.each(transparentElements, (name) =>
        assert.isTrue(TransparentElements.isTransparentAstInline(schema, AstNode.create(name)))
      );
    });

    it('TINY-9172: Should return false for any non element', () => {
      assert.isFalse(TransparentElements.isTransparentAstInline(schema, AstNode.create('#text')));
      assert.isFalse(TransparentElements.isTransparentAstInline(schema, AstNode.create('#comment')));
    });

    it('TINY-9172: Should return false for any non transparent element', () => {
      assert.isFalse(TransparentElements.isTransparentAstInline(schema, AstNode.create('p')));
      assert.isFalse(TransparentElements.isTransparentAstInline(schema, AstNode.create('span')));
    });
  });
});

