import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Hierarchy, Html, Insert, Remove, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';

import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';
import * as TransparentElements from 'tinymce/core/content/TransparentElements';

describe('browser.tinymce.core.content.TransparentElementsTest', () => {
  const schema = Schema();
  const transparentElements = TransparentElements.elementNames(schema.getTransparentElements());
  const textBlockElements = TransparentElements.elementNames(schema.getTextBlockElements());

  it('TINY-9172: elementNames', () => {
    assert.deepEqual(TransparentElements.elementNames({ a: {}, h1: {}, A: {}, H1: {}}), [ 'a', 'h1' ]);
  });

  it('TINY-9230: hasBlockAttr', () => {
    assert.isTrue(TransparentElements.hasBlockAttr(SugarElement.fromHtml<Element>('<a data-mce-block="true"></a>').dom));
    assert.isFalse(TransparentElements.hasBlockAttr(SugarElement.fromHtml<Element>('<a></a>').dom));
  });

  context('updateChildren/updateCaret', () => {
    const withScratchDiv = (html: string, f: (el: SugarElement<HTMLElement>) => void) => {
      const root = SugarElement.fromTag('div');
      Html.set(root, html);
      Insert.append(SugarBody.body(), root);
      f(root);
      Remove.remove(root);
    };

    const testUpdateChildren = (testCase: { input: string; expected: string }) => {
      withScratchDiv(testCase.input, (root) => {
        TransparentElements.updateChildren(schema, root.dom);
        assert.equal(Html.get(root), testCase.expected);
      });
    };

    const testUpdateCaret = (testCase: { input: string; path: number[]; expected: string }) => {
      withScratchDiv(testCase.input, (root) => {
        const scope = Hierarchy.follow(root, testCase.path).filter(SugarNode.isElement).getOrDie();
        TransparentElements.updateCaret(schema, root.dom, scope.dom);
        assert.equal(Html.get(root), testCase.expected);
      });
    };

    it('TINY-9172: Should add data-mce-block on transparent elements if the contain blocks', () => {
      const blockLinks = Arr.map(textBlockElements, (name) => `<a href="#"><${name}>link</${name}></a>`).join('');
      const expectedBlockLinks = Arr.map(textBlockElements, (name) => `<a href="#" data-mce-block="true"><${name}>link</${name}></a>`).join('');

      testUpdateChildren({
        input: `<a href="#">link</a><div>${blockLinks}</div>${blockLinks}<div><a href="#">link</a></div>`,
        expected: `<a href="#">link</a><div>${expectedBlockLinks}</div>${expectedBlockLinks}<div><a href="#">link</a></div>`
      });
    });

    it('TINY-9231: Should unwrap invalid children', () => {
      withScratchDiv('', (root) => {
        const anchor = SugarElement.fromHtml('<a href="#1"></a>');
        Html.set(anchor, '<p><a href="#2">link</a></p>');
        Insert.append(root, anchor);

        assert.equal(Html.get(root), '<a href="#1"><p><a href="#2">link</a></p></a>', 'Check that the setup worked');
        TransparentElements.updateChildren(schema, root.dom);
        assert.equal(Html.get(root), '<a href="#1" data-mce-block="true"><p>link</p></a>', 'Should unwrap the inner anchor');
      });
    });

    it('TINY-9172: Should add data-mce-block on transparent block elements that wrap blocks and also remove data-mce-selected="inline-boundary"', () => testUpdateChildren({
      input: '<div><a href="#" data-mce-selected="inline-boundary"><p>link</p></a></div>',
      expected: '<div><a href="#" data-mce-block="true"><p>link</p></a></div>'
    }));

    it('TINY-10272: Should not add data-mce-block attributes inside SVG elements', () => testUpdateChildren({
      input: '<svg><a href="#"><circle><desc><p>link</p></desc></circle></a></svg>',
      expected: '<svg><a href="#"><circle><desc><p>link</p></desc></circle></a></svg>'
    }));

    it('TINY-9232: Should split the H1 at the P element and remove any empty nodes that gets produced', () => testUpdateChildren({
      input: '<h1><a href="#"><p>link</p></a></h1>',
      expected: '<p>link</p>'
    }));

    it('TINY-9232: Should split the H1 at the P element and keep the contents that is around the paragraph', () => testUpdateChildren({
      input: '<h1>a<a href="#"><p>b</p></a>c</h1>',
      expected: '<h1>a</h1><p>b</p><h1>c</h1>'
    }));

    it('TINY-9232: Should split the H1 and the P element but not split the parent div element', () => testUpdateChildren({
      input: '<div><h1>a<a href="#"><p>b</p></a>c</h1></div>',
      expected: '<div><h1>a</h1><p>b</p><h1>c</h1></div>'
    }));

    it('TINY-9172: Should update all anchors in element closest to the root only', () => testUpdateCaret({
      input: '<div><a href="#"><p>link</p></a><a href="#"><p>link</p></a></div><a href="#">not this</a><a href="#"><p>not this</p></a>',
      path: [ 0, 0, 0 ],
      expected: '<div><a href="#" data-mce-block="true"><p>link</p></a><a href="#" data-mce-block="true"><p>link</p></a></div><a href="#">not this</a><a href="#"><p>not this</p></a>'
    }));

    it('TINY-9172: Should update anchor closest to root', () => testUpdateCaret({
      input: '<a href="#"><p>link</p></a>',
      path: [ 0 ],
      expected: '<a href="#" data-mce-block="true"><p>link</p></a>'
    }));

    it('TINY-9172: Should update anchor even if target element is in another branch', () => testUpdateCaret({
      input: '<div><a href="#"><p>link</p></a><b><i>target</i></b></div>',
      path: [ 0, 1, 0 ],
      expected: '<div><a href="#" data-mce-block="true"><p>link</p></a><b><i>target</i></b></div>'
    }));

    it('TINY-9172: Split the H1 at the P point within the DIV but ignore the other P not in the caret scope', () => testUpdateCaret({
      input: '<div><h1><a href="#"><p>link</p></a></h1></div><h1><a href="#"><p>link</p></a></h1>',
      path: [ 0, 0, 0, 0 ],
      expected: '<div><p>link</p></div><h1><a href="#"><p>link</p></a></h1>'
    }));

    it('TINY-10272: Should not add data-mce-block to closest element', () => testUpdateCaret({
      input: '<svg><a href="#"><circle><desc><p>link</p></desc></circle></a></svg>',
      path: [ 0 ],
      expected: '<svg><a href="#"><circle><desc><p>link</p></desc></circle></a></svg>'
    }));
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
