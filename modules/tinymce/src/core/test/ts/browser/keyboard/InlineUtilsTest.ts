import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Hierarchy, SugarElement, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Schema from 'tinymce/core/api/html/Schema';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as InlineUtils from 'tinymce/core/keyboard/InlineUtils';
import { ZWSP } from 'tinymce/core/text/Zwsp';

interface ElementPosition {
  readonly elm: SugarElement<Node>;
  readonly pos: CaretPosition;
}

describe('browser.tinymce.core.keyboard.InlineUtilsTest', () => {
  const normalizePosition = (elm: SugarElement<Node>, forward: boolean, path: number[], offset: number): ElementPosition => {
    const container = Hierarchy.follow(elm, path).getOrDie();
    const pos = CaretPosition(container.dom, offset);
    return {
      pos: InlineUtils.normalizePosition(forward, pos),
      elm
    };
  };

  const assertPosition = (elmPos: ElementPosition, path: number[], expectedOffset: number) => {
    const expectedContainer = Hierarchy.follow(elmPos.elm, path).getOrDie();
    Assertions.assertDomEq('Should be expected container', SugarElement.fromDom(elmPos.pos.container()), expectedContainer);
    assert.equal(elmPos.pos.offset(), expectedOffset, 'Should be expected offset');
  };

  const splitAt = (elm: SugarElement<Node>, path: number[], offset: number) => {
    const textNode = Hierarchy.follow(elm, path).filter(SugarNode.isText).getOrDie();
    textNode.dom.splitText(offset);
  };

  const createFakeEditor = (options: RawEditorOptions): Editor => {
    return {
      options: {
        get: (name: string) => options[name] ?? 'a[href],code,.mce-annotation'
      },
      dom: {
        isEditable: Fun.always
      },
      schema: Schema()
    } as any;
  };

  it('isInlineTarget with various editor settings', () => {
    assert.isTrue(InlineUtils.isInlineTarget(createFakeEditor({ }), SugarElement.fromHtml<HTMLAnchorElement>('<a href="a">').dom), 'Links should be inline target');
    assert.isTrue(InlineUtils.isInlineTarget(createFakeEditor({ }), SugarElement.fromTag('code').dom), 'Code should be inline target');
    assert.isTrue(InlineUtils.isInlineTarget(createFakeEditor({ }), SugarElement.fromHtml<HTMLSpanElement>('<span class="mce-annotation"></span>').dom), 'Annotations should be inline target');
    assert.isFalse(InlineUtils.isInlineTarget(createFakeEditor({ }), SugarElement.fromTag('a').dom), 'None link anchor should not be inline target');
    assert.isFalse(InlineUtils.isInlineTarget(createFakeEditor({ }), SugarElement.fromTag('b').dom), 'Bold should not be inline target');
    assert.isTrue(InlineUtils.isInlineTarget(createFakeEditor({
      inline_boundaries_selector: 'b'
    }), SugarElement.fromTag('b').dom), 'Bold should be inline target if configured');
    assert.isTrue(InlineUtils.isInlineTarget(createFakeEditor({
      inline_boundaries_selector: 'b,i'
    }), SugarElement.fromTag('i').dom), 'Italic should be inline target if configured');
  });

  context('normalizePosition on text forwards', () => {
    it('normalizePosition start of zwsp before text', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + 'a</p>');
      const elmPos = normalizePosition(elm, true, [ 0 ], 0);
      assertPosition(elmPos, [ 0 ], 1);
    });

    it('normalizePosition end of zwsp before text', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + 'a</p>');
      const elmPos = normalizePosition(elm, true, [ 0 ], 1);
      assertPosition(elmPos, [ 0 ], 1);
    });

    it('normalizePosition start of zwsp after text', () => {
      const elm = SugarElement.fromHtml('<p>a' + ZWSP + '</p>');
      const elmPos = normalizePosition(elm, true, [ 0 ], 1);
      assertPosition(elmPos, [ 0 ], 2);
    });

    it('normalizePosition end of zwsp after text', () => {
      const elm = SugarElement.fromHtml('<p>a' + ZWSP + '</p>');
      const elmPos = normalizePosition(elm, true, [ 0 ], 2);
      assertPosition(elmPos, [ 0 ], 2);
    });
  });

  context('normalizePosition on text backwards', () => {
    it('normalizePosition end of zwsp after text', () => {
      const elm = SugarElement.fromHtml('<p>a' + ZWSP + '</p>');
      const elmPos = normalizePosition(elm, false, [ 0 ], 2);
      assertPosition(elmPos, [ 0 ], 1);
    });

    it('normalizePosition start of zwsp after text', () => {
      const elm = SugarElement.fromHtml('<p>a' + ZWSP + '</p>');
      const elmPos = normalizePosition(elm, false, [ 0 ], 1);
      assertPosition(elmPos, [ 0 ], 1);
    });

    it('normalizePosition end of zwsp before text', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + 'a</p>');
      const elmPos = normalizePosition(elm, false, [ 0 ], 1);
      assertPosition(elmPos, [ 0 ], 0);
    });

    it('normalizePosition start of zwsp before text', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + 'a</p>');
      const elmPos = normalizePosition(elm, false, [ 0 ], 0);
      assertPosition(elmPos, [ 0 ], 0);
    });
  });

  context('normalizePosition on element forwards', () => {
    it('normalizePosition start of zwsp before element', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + '<input></p>');
      const elmPos = normalizePosition(elm, true, [ 0 ], 0);
      assertPosition(elmPos, [], 1);
    });

    it('normalizePosition end of zwsp before element', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + '<input></p>');
      const elmPos = normalizePosition(elm, true, [ 0 ], 1);
      assertPosition(elmPos, [], 1);
    });

    it('normalizePosition start of zwsp after element', () => {
      const elm = SugarElement.fromHtml('<p><input>' + ZWSP + '</p>');
      const elmPos = normalizePosition(elm, true, [ 1 ], 0);
      assertPosition(elmPos, [], 2);
    });

    it('normalizePosition end of zwsp after element', () => {
      const elm = SugarElement.fromHtml('<p><input>' + ZWSP + '</p>');
      const elmPos = normalizePosition(elm, true, [ 1 ], 1);
      assertPosition(elmPos, [], 2);
    });
  });

  context('normalizePosition on element backwards', () => {
    it('normalizePosition end of zwsp after element', () => {
      const elm = SugarElement.fromHtml('<p><input>' + ZWSP + '</p>');
      const elmPos = normalizePosition(elm, false, [ 1 ], 1);
      assertPosition(elmPos, [], 1);
    });

    it('normalizePosition start of zwsp after element', () => {
      const elm = SugarElement.fromHtml('<p><input>' + ZWSP + '</p>');
      const elmPos = normalizePosition(elm, false, [ 1 ], 0);
      assertPosition(elmPos, [], 1);
    });

    it('normalizePosition end of zwsp before element', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + '<input></p>');
      const elmPos = normalizePosition(elm, false, [ 0 ], 1);
      assertPosition(elmPos, [], 0);
    });

    it('normalizePosition start of zwsp before element', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + '<input></p>');
      const elmPos = normalizePosition(elm, false, [ 0 ], 0);
      assertPosition(elmPos, [], 0);
    });
  });

  context('normalizePosition on fragmented text forwards', () => {
    it('normalizePosition start of zwsp before text', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + 'a</p>');
      splitAt(elm, [ 0 ], 1);
      const elmPos = normalizePosition(elm, true, [ 0 ], 0);
      assertPosition(elmPos, [ 1 ], 0);
    });

    it('normalizePosition end of zwsp before text', () => {
      const elm = SugarElement.fromHtml('<p>' + ZWSP + 'a</p>');
      splitAt(elm, [ 0 ], 1);
      const elmPos = normalizePosition(elm, true, [ 0 ], 1);
      assertPosition(elmPos, [ 1 ], 0);
    });

    it('normalizePosition start of zwsp after text', () => {
      const elm = SugarElement.fromHtml('<p>a' + ZWSP + '</p>');
      splitAt(elm, [ 0 ], 1);
      const elmPos = normalizePosition(elm, true, [ 1 ], 0);
      assertPosition(elmPos, [], 2);
    });

    it('normalizePosition end of zwsp after text', () => {
      const elm = SugarElement.fromHtml('<p>a' + ZWSP + '</p>');
      splitAt(elm, [ 0 ], 1);
      const elmPos = normalizePosition(elm, true, [ 1 ], 1);
      assertPosition(elmPos, [], 2);
    });
  });
});
