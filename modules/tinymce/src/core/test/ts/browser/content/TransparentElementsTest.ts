import { afterEach, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj, Singleton } from '@ephox/katamari';
import { Hierarchy, Html, Insert, Remove, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';

import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';
import * as TransparentElements from 'tinymce/core/content/TransparentElements';

describe('browser.tinymce.core.content.TransparentElementsTest', () => {
  const schema = Schema();
  const transparentElements = Arr.filter(Obj.keys(schema.getTransparentElements()), (name) => /^[a-z]+$/.test(name));

  context('update/updateCaret', () => {
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

    it('TINY-9172: Should add data-mce-block on transparent elements if the contain blocks', () => {
      const root = rootState.get().getOrDie();

      Html.set(root, '<a href="#">link</a><div><a href="#"><p>link</p></a></div><div><a href="#">link</a></div>');
      TransparentElements.updateChildren(schema, root.dom);
      assert.equal(Html.get(root), '<a href="#">link</a><div><a href="#" data-mce-block="true"><p>link</p></a></div><div><a href="#">link</a></div>');
    });

    it('TINY-9172: Should add data-mce-block on transparent block elements that wrap blocks and also remove data-mce-selected="inline-boundary"', () => {
      const root = rootState.get().getOrDie();

      Html.set(root, '<div><a href="#" data-mce-selected="inline-boundary"><p>link</p></a></div>');
      TransparentElements.updateChildren(schema, root.dom);
      assert.equal(Html.get(root), '<div><a href="#" data-mce-block="true"><p>link</p></a></div>');
    });

    it('TINY-9172: Should update all anchors in element closest to the root only', () => {
      const root = rootState.get().getOrDie();

      Html.set(root, '<div><a href="#"><p>link</p></a><a href="#"><p>link</p></a></div><a href="#">not this</a><a href="#"><p>not this</p></a>');
      const scope = Hierarchy.follow(root, [ 0, 0, 0 ]).filter(SugarNode.isElement).getOrDie();
      TransparentElements.updateCaret(schema, root.dom, scope.dom);
      assert.equal(
        Html.get(root),
        '<div><a href="#" data-mce-block="true"><p>link</p></a><a href="#" data-mce-block="true"><p>link</p></a></div><a href="#">not this</a><a href="#"><p>not this</p></a>'
      );
    });

    it('TINY-9172: Should update anchor closest to root', () => {
      const root = rootState.get().getOrDie();

      Html.set(root, '<a href="#"><p>link</p></a>');
      const scope = Hierarchy.follow(root, [ 0 ]).filter(SugarNode.isElement).getOrDie();
      TransparentElements.updateCaret(schema, root.dom, scope.dom);
      assert.equal(Html.get(root), '<a href="#" data-mce-block="true"><p>link</p></a>');
    });

  });

  context('isTransparentElementName', () => {
    it('TINY-9172: Should return true for any transparent element name', () => {
      Arr.each(transparentElements, (name) => {
        assert.isTrue(TransparentElements.isTransparentElementName(schema, name));
      });
    });

    it('TINY-9172: Should return false for any non transparent element names', () => {
      assert.isFalse(TransparentElements.isTransparentElementName(schema, 'p'));
      assert.isFalse(TransparentElements.isTransparentElementName(schema, 'span'));
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
