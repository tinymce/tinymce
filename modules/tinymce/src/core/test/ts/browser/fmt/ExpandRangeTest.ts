import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import { TinyApis, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as ExpandRange from 'tinymce/core/fmt/ExpandRange';
import { Format } from 'tinymce/core/fmt/FormatTypes';
import { RangeLikeObject } from 'tinymce/core/selection/RangeTypes';
import { ZWSP } from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.fmt.ExpandRangeTest', () => {
  const inlineFormat = [{ inline: 'b' }];
  const blockFormat = [{ block: 'div' }];
  const selectorFormat = [{ selector: 'div', classes: 'b' }];
  const selectorFormatCollapsed = [{ selector: 'div', classes: 'b', collapsed: true }];
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const expandRng = (editor: Editor, startPath: number[], startOffset: number, endPath: number[], endOffset: number, format: Format[], excludeTrailingSpaces: boolean = false) => {
    const startContainer = Hierarchy.follow(TinyDom.body(editor), startPath).getOrDie();
    const endContainer = Hierarchy.follow(TinyDom.body(editor), endPath).getOrDie();

    const rng = editor.dom.createRng();
    rng.setStart(startContainer.dom, startOffset);
    rng.setEnd(endContainer.dom, endOffset);

    return ExpandRange.expandRng(editor.dom, rng, format, excludeTrailingSpaces);
  };

  const assertRange = (editor: Editor, rng: RangeLikeObject, startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
    const startContainer = Hierarchy.follow(TinyDom.body(editor), startPath).getOrDie();
    const endContainer = Hierarchy.follow(TinyDom.body(editor), endPath).getOrDie();

    Assertions.assertDomEq('Should be expected start container', startContainer, SugarElement.fromDom(rng.startContainer));
    assert.equal(rng.startOffset, startOffset, 'Should be expected start offset');
    Assertions.assertDomEq('Should be expected end container', endContainer, SugarElement.fromDom(rng.endContainer));
    assert.equal(rng.endOffset, endOffset, 'Should be expected end offset');
  };

  context('TBA: Expand inline format words', () => {
    it('TBA: In middle of single word in paragraph', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      const rng = expandRng(editor, [ 0, 0 ], 1, [ 0, 0 ], 1, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: In middle of single word in paragraph with paragraph siblings', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p>bc</p><p>de</p>');
      const rng = expandRng(editor, [ 1, 0 ], 1, [ 1, 0 ], 1, inlineFormat, false);
      assertRange(editor, rng, [], 1, [], 2);
    });

    it('TBA: In middle of single word wrapped in b', () => {
      const editor = hook.editor();
      editor.setContent('<p><b>ab</b></p>');
      const rng = expandRng(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: In middle of first word', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab cd</p>');
      const rng = expandRng(editor, [ 0, 0 ], 1, [ 0, 0 ], 1, inlineFormat, false);
      assertRange(editor, rng, [], 0, [ 0, 0 ], 2);
    });

    it('TBA: In middle of last word', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab cd</p>');
      const rng = expandRng(editor, [ 0, 0 ], 4, [ 0, 0 ], 4, inlineFormat, false);
      assertRange(editor, rng, [ 0, 0 ], 3, [], 1);
    });

    it('TBA: In middle of middle word', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab cd ef</p>');
      const rng = expandRng(editor, [ 0, 0 ], 4, [ 0, 0 ], 4, inlineFormat, false);
      assertRange(editor, rng, [ 0, 0 ], 3, [ 0, 0 ], 5);
    });

    it('TBA: In middle of word with bold siblings expand to sibling spaces', () => {
      const editor = hook.editor();
      editor.setContent('<p><b>ab </b>cd<b> ef</b></p>');
      const rng = expandRng(editor, [ 0, 1 ], 1, [ 0, 1 ], 1, inlineFormat, false);
      assertRange(editor, rng, [ 0, 0, 0 ], 3, [ 0, 2, 0 ], 0);
    });

    it('TBA: In middle of word with block sibling and inline sibling expand to sibling space to the right', () => {
      const editor = hook.editor();
      editor.setContent('<div><p>ab </p>cd<b> ef</b></div>');
      const rng = expandRng(editor, [ 0, 1 ], 1, [ 0, 1 ], 1, inlineFormat, false);
      assertRange(editor, rng, [ 0, 1 ], 0, [ 0, 2, 0 ], 0);
    });

    it('TBA: In middle of word with block sibling and inline sibling expand to sibling space to the left', () => {
      const editor = hook.editor();
      editor.setContent('<div><b>ab </b>cd<p> ef</p></div>');
      const rng = expandRng(editor, [ 0, 1 ], 1, [ 0, 1 ], 1, inlineFormat, false);
      assertRange(editor, rng, [ 0, 0, 0 ], 3, [ 0, 1 ], 2);
    });

    it('TBA: In middle of middle word separated by nbsp characters', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab\u00a0cd\u00a0ef</p>');
      const rng = expandRng(editor, [ 0, 0 ], 4, [ 0, 0 ], 4, inlineFormat, false);
      assertRange(editor, rng, [ 0, 0 ], 3, [ 0, 0 ], 5);
    });

    it('TBA: In empty paragraph', () => {
      const editor = hook.editor();
      editor.setContent('<p><br></p>');
      const rng = expandRng(editor, [ 0 ], 0, [ 0 ], 0, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: Fully selected word', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      const rng = expandRng(editor, [ 0, 0 ], 0, [ 0, 0 ], 2, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: Partially selected word', () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      const rng = expandRng(editor, [ 0, 0 ], 1, [ 0, 0 ], 2, inlineFormat, false);
      assertRange(editor, rng, [ 0, 0 ], 1, [ 0, 0 ], 2);
    });

    it('TBA: Whole word selected wrapped in multiple inlines', () => {
      const editor = hook.editor();
      editor.setContent('<p><b><i>c</i></b></p>');
      const rng = expandRng(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: Whole word inside td', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
      const rng = expandRng(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1, inlineFormat, false);
      assertRange(editor, rng, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    });

    it('TBA: In middle of single word in paragraph (index based)', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      const rng = expandRng(editor, [ 0 ], 0, [ 0 ], 1, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: In middle of single word wrapped in bold in paragraph (index based)', () => {
      const editor = hook.editor();
      editor.setContent('<p><b>ab</b></p>');
      const rng = expandRng(editor, [ 0 ], 0, [ 0 ], 1, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: In middle of word inside bookmark then exclude bookmark', () => {
      const editor = hook.editor();
      editor.setContent('<p><span data-mce-type="bookmark">ab cd ef</span></p>');
      const rng = expandRng(editor, [ 0, 0, 0 ], 3, [ 0, 0, 0 ], 5, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });
  });

  context('TBA: Expand inline format words (remove format)', () => {
    it('TBA: In middle of single word in paragraph', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      const rng = expandRng(editor, [ 0, 0 ], 1, [ 0, 0 ], 1, inlineFormat, true);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TINY-6268: Does not extend over space before', () => {
      const editor = hook.editor();
      TinyApis(editor).setRawContent('<p>ab<u> <span data-mce-type="bookmark">' + ZWSP + '</span>cd</u></p>');
      const rng = expandRng(editor, [ 0, 1, 2 ], 0, [ 0, 1, 2 ], 2, inlineFormat, false);
      assertRange(editor, rng, [ 0, 1, 2 ], 0, [], 1);
    });

    it('TINY-6268: Does not extend over space after', () => {
      const editor = hook.editor();
      TinyApis(editor).setRawContent('<p><u>ab<span data-mce-type="bookmark">' + ZWSP + '</span> </u>cd</p>');
      const rng = expandRng(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2, inlineFormat, false);
      assertRange(editor, rng, [], 0, [ 0, 0, 0 ], 2);
    });

    it('TINY-6268: Does extend over collapsible space at start of block', () => {
      const editor = hook.editor();
      TinyApis(editor).setRawContent('<p><u> <span data-mce-type="bookmark">' + ZWSP + '</span>ab</u></p>');
      const rng = expandRng(editor, [ 0, 0, 2 ], 0, [ 0, 0, 2 ], 2, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TINY-6268: Does extend over collapsible space at end of block', () => {
      const editor = hook.editor();
      TinyApis(editor).setRawContent('<p><u>ab<span data-mce-type="bookmark">' + ZWSP + '</span> </u></p>');
      const rng = expandRng(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2, inlineFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });
  });

  context('TBA: Expand block format', () => {
    it('TBA: In middle word', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab cd ef</p>');
      const rng = expandRng(editor, [ 0, 0 ], 4, [ 0, 0 ], 4, blockFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: In middle bold word', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab <b>cd</b> ef</p>');
      const rng = expandRng(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1, blockFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: Whole word inside td', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
      const rng = expandRng(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1, blockFormat, false);
      assertRange(editor, rng, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    });
  });

  context('TBA: Expand selector format', () => {
    it('TBA: Do not expand over element if selector does not match', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab</p>');
      const rng = expandRng(editor, [ 0, 0 ], 1, [ 0, 0 ], 1, selectorFormat, false);
      assertRange(editor, rng, [ 0, 0 ], 0, [ 0, 0 ], 2);
    });

    it('TBA: Do not expand outside of element if selector does not match - from bookmark at middle', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<span data-mce-type="bookmark">&#65279;</span>b</p>');
      const rng = expandRng(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0, selectorFormat, false);
      assertRange(editor, rng, [ 0, 0 ], 0, [ 0, 2 ], 1);
    });

    it('TBA: Do not expand outside of element if selector does not match - from bookmark at start', () => {
      const editor = hook.editor();
      editor.setContent('<p><span data-mce-type="bookmark">&#65279;</span>ab</p>');
      const rng = expandRng(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0, selectorFormat, false);
      assertRange(editor, rng, [ 0 ], 0, [ 0, 1 ], 2);
    });

    it('TBA: Do not expand outside of element if selector does not match - from bookmark at end', () => {
      const editor = hook.editor();
      editor.setContent('<p>ab<span data-mce-type="bookmark">&#65279;</span></p>');
      const rng = expandRng(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0, selectorFormat, false);
      assertRange(editor, rng, [ 0, 0 ], 0, [ 0 ], 2);
    });

    it('TBA: Expand since selector matches', () => {
      const editor = hook.editor();
      editor.setContent('<div>ab</div>');
      const rng = expandRng(editor, [ 0, 0 ], 1, [ 0, 0 ], 1, selectorFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: Expand since selector matches non collapsed', () => {
      const editor = hook.editor();
      editor.setContent('<div>ab</div>');
      const rng = expandRng(editor, [ 0, 0 ], 1, [ 0, 0 ], 2, selectorFormat, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TINY-10154: should expand over the nested summary content instead of parent details body element', () => {
      const editor = hook.editor();
      // eslint-disable-next-line max-len
      editor.setContent(`<details class="mce-accordion" open="open"><summary class="mce-accordion-summary">Accordion summary 1</summary><div class="mce-accordion-body"><p>Accordion body1</p><details class="mce-accordion" open="open"><summary class="mce-accordion-summary">Accordion summary1.1</summary><div class="mce-accordion-body"><p>Accordion body 1.1</p></div></details></div></details>`);
      const rng = expandRng(editor, [ 0, 1, 1, 0, 0 ], 2, [ 0, 1, 1, 0, 0 ], 2, [{ block: 'h1', deep: true, remove: 'all', split: true }], false);
      assertRange(editor, rng, [ 0, 1, 1 ], 0, [ 0, 1, 1, 0, 0 ], 9);
    });
  });

  context('TBA: Expand selector format with collapsed property', () => {
    it('TBA: Expand since selector matches collapsed on collapsed format', () => {
      const editor = hook.editor();
      editor.setContent('<div>ab</div>');
      const rng = expandRng(editor, [ 0, 0 ], 1, [ 0, 0 ], 1, selectorFormatCollapsed, false);
      assertRange(editor, rng, [], 0, [], 1);
    });

    it('TBA: Expand since selector matches non collapsed on collapsed format', () => {
      const editor = hook.editor();
      editor.setContent('<div>ab</div>');
      const rng = expandRng(editor, [ 0, 0 ], 1, [ 0, 0 ], 2, selectorFormatCollapsed, false);
      assertRange(editor, rng, [ 0, 0 ], 1, [ 0, 0 ], 2);
    });
  });
});
