import { Cursors } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Css, PredicateFilter, SugarElement, SugarNode } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as NormalizeTagOrder from 'tinymce/core/fmt/NormalizeTagOrder';

interface TestCase {
  html: string;
  selection: Cursors.CursorPath;
  expectedHtml: string;
  expectedSelection: Cursors.CursorPath;
}

describe('browser.tinymce.core.fmt.NormalizeTagOrderTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    extended_valid_elements: 'b,i',
    indent: false
  }, [], true);

  const isFontSizeElement = (element: SugarElement<Node>): element is SugarElement<HTMLElement> => {
    return SugarNode.isHTMLElement(element) && SugarNode.name(element) === 'span' && Css.getRaw(element, 'font-size').isSome();
  };

  const testNormalizeTagOrder = ({ html, selection, expectedHtml, expectedSelection }: TestCase) => {
    const editor = hook.editor();
    editor.setContent(html);

    const fontSizeElements = PredicateFilter.descendants<HTMLElement>(TinyDom.body(editor), isFontSizeElement);

    if (selection) {
      TinySelections.setSelection(editor, selection.startPath, selection.soffset, selection.finishPath, selection.foffset);
    }

    NormalizeTagOrder.normalizeFontSizeElementsWithFormat(
      editor,
      'strikethrough',
      fontSizeElements
    );

    TinyAssertions.assertContent(editor, expectedHtml);
    TinyAssertions.assertSelection(editor, expectedSelection.startPath, expectedSelection.soffset, expectedSelection.finishPath, expectedSelection.foffset);
  };

  it('TINY-12004: Switch order of strikethrough and font size with text node content', () => testNormalizeTagOrder({
    html: '<p><s><span style="font-size: 40px;">Hello</span></s></p>',
    selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 'Hello'.length },
    expectedHtml: '<p><span style="font-size: 40px;"><s>Hello</s></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 'Hello'.length }
  }));

  it('TINY-12004: Switch order of strikethrough and font size when strikethrough is mixed with other styles', () => testNormalizeTagOrder({
    html: '<p><span style="text-decoration: line-through; color: red"><span style="font-size: 40px;">Hello</span></span></p>',
    selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 'Hello'.length },
    expectedHtml: '<p><span style="color: red;"><span style="font-size: 40px;"><span style="text-decoration: line-through;">Hello</span></span></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'Hello'.length }
  }));

  it('TINY-12004: Switch order of strikethrough and font size with mixed content', () => testNormalizeTagOrder({
    html: '<p><s><span style="font-size: 40px;">Hello <b>world</b></span></s></p>',
    selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 'Hello'.length },
    expectedHtml: '<p><span style="font-size: 40px;"><s>Hello <b>world</b></s></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 'Hello'.length }
  }));

  it('TINY-12004: Switch order of strikethrough and font size when font size is wrapped in b', () => testNormalizeTagOrder({
    html: '<p><s><b><span style="font-size: 40px;">Hello</span></b></s></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'Hello'.length },
    expectedHtml: '<p><b><span style="font-size: 40px;"><s>Hello</s></span></b></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'Hello'.length }
  }));

  it('TINY-12004: Switch order of strikethrough and font size when font size is wrapped in b and i', () => testNormalizeTagOrder({
    html: '<p><s><b><i><span style="font-size: 40px;">Hello</span></></b></s></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0, 0 ], foffset: 'Hello'.length },
    expectedHtml: '<p><b><i><span style="font-size: 40px;"><s>Hello</s></span></i></b></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0, 0 ], foffset: 'Hello'.length }
  }));

  it('TINY-12004: Switch order of strikethrough and font size with text node content when content is before and after font size', () => testNormalizeTagOrder({
    html: '<p><s><b><i>foo</i></b><span style="font-size: 40px;">bar</span><i><b>baz</b></i></s></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 2, 0, 0 ], foffset: 'baz'.length },
    expectedHtml: '<p><s><b><i>foo</i></b></s><span style="font-size: 40px;"><s>bar</s></span><s><i><b>baz</b></i></s></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 2, 0, 0, 0 ], foffset: 'baz'.length }
  }));

  it('TINY-12004: Switch order of strikethrough and font size on text that is also bold and italic', () => testNormalizeTagOrder({
    html: '<p><s><b><i>foo<span style="font-size: 40px;">bar</span>baz</b></i></s></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 2 ], foffset: 'baz'.length },
    expectedHtml: '<p><s><b><i>foo</i></b></s><b><i><span style="font-size: 40px;"><s>bar</s></span></i></b><s><b><i>baz</i></b></s></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 2, 0, 0, 0 ], foffset: 'baz'.length }
  }));

  it('TINY-12004: Switch order of strikethrough and font size when there is multiple nested font sizes', () => testNormalizeTagOrder({
    html: '<p><s><span style="font-size: 40px;"><span style="font-size: 32px;">bar</span></span></s></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'bar'.length },
    expectedHtml: '<p><span style="font-size: 40px;"><span style="font-size: 32px;"><s>bar</s></span></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'bar'.length }
  }));

  it('TINY-12004: Should reduce nested strikethroughs', () => testNormalizeTagOrder({
    html: '<p><s><s><span style="font-size: 40px;">Hello</span></s></s></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'Hello'.length },
    expectedHtml: '<p><span style="font-size: 40px;"><s>Hello</s></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 'Hello'.length }
  }));

  it('TINY-12004: Should not wrap existing strikethroughs with strikethrough by unwrapping inner ones', () => testNormalizeTagOrder({
    html: '<p><s><span style="font-size: 40px;"><s>Hello</s></span></s></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'Hello'.length },
    expectedHtml: '<p><span style="font-size: 40px;"><s>Hello</s></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0 ], foffset: 'Hello'.length }
  }));

  it('TINY-12004: Should not wrap existing strikethroughs with strikethrough by removing styles from inner ones', () => testNormalizeTagOrder({
    html: '<p><span style="text-decoration: line-through"><span style="font-size: 40px;"><s>Hello</s> <span style="text-decoration: line-through; color: red;">world</span></span></s></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 2, 0 ], foffset: 'world'.length },
    expectedHtml: '<p><span style="font-size: 40px;"><span style="text-decoration: line-through;">Hello <span style="color: red;">world</span></span></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 2, 0 ], foffset: 'world'.length }
  }));

  it('TINY-12004: Should remove line-through from nested element but retain the color', () => testNormalizeTagOrder({
    html: '<p><s><span style="text-decoration: line-through; color: red;"><span style="font-size: 40px;">Hello</span></span></s></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'Hello'.length },
    expectedHtml: '<p><span style="color: red;"><span style="font-size: 40px;"><s>Hello</s></span></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'Hello'.length }
  }));

  it('TINY-12004: Should remove line-through from parent element but retain the color', () => testNormalizeTagOrder({
    html: '<p><span style="text-decoration: line-through; color: red;"><s><span style="font-size: 40px;">Hello</span></s></span></p>',
    selection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'Hello'.length },
    expectedHtml: '<p><span style="color: red;"><span style="font-size: 40px;"><span style="text-decoration: line-through;">Hello</span></span></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0, 0, 0 ], foffset: 'Hello'.length }
  }));

  it('TINY-12004: Switch order of multiple font size elements', () => testNormalizeTagOrder({
    html: '<p><s><span style="font-size: 40px;">Hello</span> <span style="font-size: 32px;">world</span></s></p>',
    selection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 2, 0 ], foffset: 'world'.length },
    expectedHtml: '<p><span style="font-size: 40px;"><s>Hello</s></span><s> </s><span style="font-size: 32px;"><s>world</s></span></p>',
    expectedSelection: { startPath: [ 0, 0, 0, 0 ], soffset: 0, finishPath: [ 0, 2, 0, 0 ], foffset: 'world'.length }
  }));
});
