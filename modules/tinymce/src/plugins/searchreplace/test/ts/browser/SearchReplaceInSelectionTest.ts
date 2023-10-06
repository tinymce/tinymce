import { describe, it } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/searchreplace/Plugin';

interface FindScenario {
  readonly content: string;
  readonly find: string;
  readonly matches: number;
  readonly sel?: {
    readonly sPath: number[];
    readonly sOffset: number;
    readonly fPath?: number[];
    readonly fOffset?: number;
  };
  readonly wholeWords?: boolean;
  readonly matchCase?: boolean;
  readonly editableRoot?: boolean;
}

interface ReplaceScenario extends FindScenario {
  readonly replace: string;
  readonly replaceAll?: boolean;
  readonly backwards?: boolean;
  readonly moreMatches: boolean;
  readonly expectedContent: string;
}

describe('browser.tinymce.plugins.searchreplace.SearchReplaceInSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
    extended_valid_elements: 'b,i,svg'
  }, [ Plugin ], true);

  const isReplaceScenario = (scenario: FindScenario | ReplaceScenario): scenario is ReplaceScenario => Obj.has(scenario as Record<string, any>, 'replace');

  const testReplace = (editor: Editor, scenario: ReplaceScenario) => {
    editor.setEditableRoot(scenario.editableRoot ?? true);
    const moreMatches = editor.plugins.searchreplace.replace(scenario.replace, scenario.backwards || true, scenario.replaceAll || false);
    assert.equal(scenario.moreMatches, moreMatches);
    TinyAssertions.assertContent(editor, scenario.expectedContent);
    editor.setEditableRoot(true);
  };

  const testInSelection = (scenario: FindScenario | ReplaceScenario) => () => {
    const editor = hook.editor();
    editor.setContent(scenario.content);
    if (scenario.sel) {
      TinySelections.setSelection(editor, scenario.sel.sPath, scenario.sel.sOffset, scenario.sel.fPath || scenario.sel.sPath, scenario.sel.fOffset || scenario.sel.sOffset);
    }
    editor.setEditableRoot(scenario.editableRoot ?? true);
    const matches = editor.plugins.searchreplace.find(scenario.find, scenario.matchCase || false, scenario.wholeWords || false, true);
    assert.equal(scenario.matches, matches);

    if (isReplaceScenario(scenario)) {
      testReplace(editor, scenario);
    }
    editor.setEditableRoot(true);
  };

  it('TINY-4549: Find no match', testInSelection({ content: 'a', find: 'x', matches: 0, sel: { sPath: [ 0, 0 ], sOffset: 0, fOffset: 1 }}));

  it('TINY-4549: Find single match', testInSelection({ content: 'a a', find: 'a', matches: 1, sel: { sPath: [ 0, 0 ], sOffset: 0, fOffset: 1 }}));

  it('TINY-4549: Find multiple matches', testInSelection({ content: 'a A a', find: 'a', matches: 2, sel: { sPath: [ 0, 0 ], sOffset: 0, fOffset: 3 }}));

  it('TINY-4549: Find single match in fragmented text', testInSelection({
    content: 't<b>e</b><i>xt</i> t<b>e</b><i>xt</i>',
    find: 'text',
    matches: 1,
    sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 3 ], fOffset: 0 }
  }));

  it('TINY-4549: Find multiple matches in table', testInSelection({
    content: '<table><tbody><tr><th data-mce-selected="1">a</th><th>a</th></tr><tr><td data-mce-selected="1">a</td><td>a</td></tr></tbody></table>',
    find: 'a',
    matches: 2
  }));

  it('TINY-4549: Find match ignores content editable false elements', testInSelection({
    content: 'a<span contenteditable="false">a</span>a',
    find: 'a',
    matches: 2,
    sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 2 ], fOffset: 1 }
  }));

  it('TINY-10162: Find match ignores SVG elements', testInSelection({
    content: '<p>a<svg>a</svg>a</p>',
    find: 'a',
    matches: 2,
    sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 2 ], fOffset: 1 }
  }));

  it('TINY-10162: Find match ignores non-editable elements if editable root is set to false', testInSelection({
    editableRoot: false,
    content: '<p>a<span contenteditable="true">a</span>a</p>',
    find: 'a',
    matches: 1,
    sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 2 ], fOffset: 1 }
  }));

  it('TINY-4549: Find matches on either side of an image', testInSelection({
    content: 'ab ab<img src=""/>ab abab',
    find: 'ab',
    matches: 2,
    sel: { sPath: [ 0, 0 ], sOffset: 3, fPath: [ 0, 2 ], fOffset: 2 }
  }));

  it('TINY-4549: Find no match spread across image', testInSelection({
    content: 'abab ab<img src=""/>ab abab',
    find: 'abab',
    matches: 0,
    sel: { sPath: [ 0, 0 ], sOffset: 4, fPath: [ 0, 2 ], fOffset: 3 }
  }));

  it('TINY-4549: Find no match spread across new lines', testInSelection({
    content: 'abab<br>ab<br>ab<br>abab',
    find: 'abab',
    matches: 0,
    sel: { sPath: [ 0, 2 ], sOffset: 0, fPath: [ 0, 4 ], fOffset: 2 }
  }));

  it('TINY-4549: Find single match, match case: true', testInSelection({
    content: 'a A a A',
    find: 'A',
    matches: 1,
    matchCase: true,
    sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 3 }
  }));

  it('TINY-4549: Find single match, whole words: true', testInSelection({
    content: 'a Ax a Ax',
    find: 'a',
    matches: 1,
    wholeWords: true,
    sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 4 }
  }));

  it('TINY-4549: Find special characters match', testInSelection({
    content: '^^ ^^ ^^^^',
    find: '^^',
    matches: 3,
    sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 8 }
  }));

  it('TINY-4549: Find special characters match, whole words: true', testInSelection({
    content: '^^ ^^ ^^^^',
    find: '^^',
    matches: 3,
    wholeWords: true,
    sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 8 }
  }));

  it('TINY-4549: Find and replace single match', testInSelection({
    content: 'a a a',
    find: 'a',
    matches: 1,
    replace: 'x',
    expectedContent: '<p>a x a</p>',
    moreMatches: false,
    sel: { sPath: [ 0, 0 ], sOffset: 2, fPath: [ 0, 0 ], fOffset: 3 }
  }));

  it('TINY-4549: Find and replace first in multiple matches', testInSelection({
    content: 'a b a b ab',
    find: 'a',
    matches: 2,
    replace: 'x',
    expectedContent: '<p>a b x b ab</p>',
    moreMatches: true,
    sel: { sPath: [ 0, 0 ], sOffset: 1, fPath: [ 0, 0 ], fOffset: 10 }
  }));

  it('TINY-4549: Find and replace two consecutive spaces', testInSelection({
    content: 'ab a&nbsp; b a&nbsp; &nbsp;',
    find: 'a  ',
    matches: 1,
    replace: 'x',
    expectedContent: '<p>ab xb a&nbsp; &nbsp;</p>',
    moreMatches: false,
    sel: { sPath: [ 0, 0 ], sOffset: 2, fPath: [ 0, 0 ], fOffset: 8 }
  }));

  it('TINY-4549: Find and replace consecutive spaces', testInSelection({
    content: 'ab a&nbsp; &nbsp;b a&nbsp; &nbsp;',
    find: 'a   ',
    matches: 1,
    replace: 'x',
    expectedContent: '<p>ab a&nbsp; &nbsp;b x</p>',
    moreMatches: false,
    sel: { sPath: [ 0, 0 ], sOffset: 6, fPath: [ 0, 0 ], fOffset: 13 }
  }));

  it('TINY-4549: Find and replace all in multiple matches', testInSelection({
    content: 'a b a b a',
    find: 'a',
    matches: 2,
    replace: 'x',
    replaceAll: true,
    expectedContent: '<p>x b x b a</p>',
    moreMatches: false,
    sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 7 }
  }));

  it('TINY-4549: Find and replace all in multiple matches with nbsp', testInSelection({
    content: 'a&nbsp; &nbsp;b<br/><br/>ab&nbsp;c',
    find: ' ',
    matches: 2,
    replace: 'x',
    replaceAll: true,
    expectedContent: '<p>a&nbsp; xb<br><br>abxc</p>',
    moreMatches: false,
    sel: { sPath: [ 0, 0 ], sOffset: 3, fPath: [ 0, 3 ], fOffset: 4 }
  }));

  it('TINY-4549: Find and replace fragmented match', testInSelection({
    content: '<b>te<i>s</i>t</b><b>te<i>s</i>t</b>',
    find: 'test',
    matches: 1,
    replace: 'abc',
    expectedContent: '<p><b>te<i>s</i>t</b><b>abc</b></p>',
    moreMatches: false,
    sel: { sPath: [ 0, 0, 1 ], sOffset: 0, fPath: [ 0, 1, 2 ], fOffset: 1 }
  }));

  it('TINY-4549: Find and replace all fragmented matches', testInSelection({
    content: '<b>te<i>s</i>t</b><b>te<i>s</i>t</b><b>te<i>s</i>t</b>',
    find: 'test',
    matches: 2,
    replace: 'abc',
    replaceAll: true,
    expectedContent: '<p><b>te<i>s</i>t</b><b>abc</b><b>abc</b></p>',
    moreMatches: false,
    sel: { sPath: [ 0, 1, 0 ], sOffset: 0, fPath: [ 0, 2, 2 ], fOffset: 1 }
  }));
});
