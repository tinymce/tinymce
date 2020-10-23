import { Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';

import SearchreplacePlugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.searchreplace.SearchReplaceInSelectionTest', (success, failure) => {
  Theme();
  SearchreplacePlugin();

  interface FindScenario {
    content: string;
    find: string;
    matches: number;
    sel?: {
      sPath: number[];
      sOffset: number;
      fPath?: number[];
      fOffset?: number;
    };
    wholeWords?: boolean;
    matchCase?: boolean;
  }

  interface ReplaceScenario extends FindScenario {
    replace: string;
    replaceAll?: boolean;
    backwards?: boolean;
    moreMatches: boolean;
    expectedContent: string;
  }

  const isReplaceScenario = (scenario: FindScenario | ReplaceScenario): scenario is ReplaceScenario => Obj.has(scenario as Record<string, any>, 'replace');

  const sReplaceStep = (editor: Editor, scenario: ReplaceScenario) => Step.sync(() => {
    const moreMatches = editor.plugins.searchreplace.replace(scenario.replace, scenario.backwards || true, scenario.replaceAll || false);
    Assertions.assertEq('More matches found', scenario.moreMatches, moreMatches);
    Assertions.assertHtml('Replaced content successfully', scenario.expectedContent, editor.getContent());
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sTestInSelection = (label: string, scenario: FindScenario | ReplaceScenario) => Log.stepsAsStep('TINY-4549', 'SearchReplace: ' + label, [
      tinyApis.sSetContent(scenario.content),
      scenario.sel ? tinyApis.sSetSelection(scenario.sel.sPath, scenario.sel.sOffset, scenario.sel.fPath || scenario.sel.sPath, scenario.sel.fOffset || scenario.sel.fOffset) : Step.pass,
      Step.sync(() => {
        const matches = editor.plugins.searchreplace.find(scenario.find, scenario.matchCase || false, scenario.wholeWords || false, true);
        Assertions.assertEq('Check the correct number of matches were found', scenario.matches, matches);
      }),
      isReplaceScenario(scenario) ? sReplaceStep(editor, scenario) : Step.pass
    ]);

    Pipeline.async({}, Log.steps('TINY-4549', 'SearchReplace: Find and replace in selection matches', [
      tinyApis.sFocus(),
      sTestInSelection('Find no match', { content: 'a', find: 'x', matches: 0, sel: { sPath: [ 0, 0 ], sOffset: 0, fOffset: 1 }}),
      sTestInSelection('Find single match', { content: 'a a', find: 'a', matches: 1, sel: { sPath: [ 0, 0 ], sOffset: 0, fOffset: 1 }}),
      sTestInSelection('Find multiple matches', { content: 'a A a', find: 'a', matches: 2, sel: { sPath: [ 0, 0 ], sOffset: 0, fOffset: 3 }}),
      sTestInSelection('Find single match in fragmented text', {
        content: 't<b>e</b><i>xt</i> t<b>e</b><i>xt</i>',
        find: 'text',
        matches: 1,
        sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 3 ], fOffset: 0 }
      }),
      sTestInSelection('Find multiple matches in table', {
        content: '<table><tbody><tr><th data-mce-selected="1">a</th><th>a</th></tr><tr><td data-mce-selected="1">a</td><td>a</td></tr></tbody></table>',
        find: 'a',
        matches: 2
      }),
      sTestInSelection('Find match ignores content editable false elements', {
        content: 'a<span contenteditable="false">a</span>a',
        find: 'a',
        matches: 2,
        sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 2 ], fOffset: 1 }
      }),
      sTestInSelection('Find matches on either side of an image', {
        content: 'ab ab<img src=""/>ab abab',
        find: 'ab',
        matches: 2,
        sel: { sPath: [ 0, 0 ], sOffset: 3, fPath: [ 0, 2 ], fOffset: 2 }
      }),
      sTestInSelection('Find no match spread across image', {
        content: 'abab ab<img src=""/>ab abab',
        find: 'abab',
        matches: 0,
        sel: { sPath: [ 0, 0 ], sOffset: 4, fPath: [ 0, 2 ], fOffset: 3 }
      }),
      sTestInSelection('Find no match spread across new lines', {
        content: 'abab<br>ab<br>ab<br>abab',
        find: 'abab',
        matches: 0,
        sel: { sPath: [ 0, 2 ], sOffset: 0, fPath: [ 0, 4 ], fOffset: 2 }
      }),
      sTestInSelection('Find single match, match case: true', {
        content: 'a A a A',
        find: 'A',
        matches: 1,
        matchCase: true,
        sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 3 }
      }),
      sTestInSelection('Find single match, whole words: true', {
        content: 'a Ax a Ax',
        find: 'a',
        matches: 1,
        wholeWords: true,
        sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 4 }
      }),
      sTestInSelection('Find special characters match', {
        content: '^^ ^^ ^^^^',
        find: '^^',
        matches: 3,
        sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 8 }
      }),
      sTestInSelection('Find special characters match, whole words: true', {
        content: '^^ ^^ ^^^^',
        find: '^^',
        matches: 2,
        wholeWords: true,
        sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 8 }
      }),
      sTestInSelection('Find and replace single match', {
        content: 'a a a',
        find: 'a',
        matches: 1,
        replace: 'x',
        expectedContent: '<p>a x a</p>',
        moreMatches: false,
        sel: { sPath: [ 0, 0 ], sOffset: 2, fPath: [ 0, 0 ], fOffset: 3 }
      }),
      sTestInSelection('Find and replace first in multiple matches', {
        content: 'a b a b ab',
        find: 'a',
        matches: 2,
        replace: 'x',
        expectedContent: '<p>a b x b ab</p>',
        moreMatches: true,
        sel: { sPath: [ 0, 0 ], sOffset: 1, fPath: [ 0, 0 ], fOffset: 10 }
      }),
      sTestInSelection('Find and replace two consecutive spaces', {
        content: 'ab a&nbsp; b a&nbsp; &nbsp;',
        find: 'a  ',
        matches: 1,
        replace: 'x',
        expectedContent: '<p>ab xb a&nbsp; &nbsp;</p>',
        moreMatches: false,
        sel: { sPath: [ 0, 0 ], sOffset: 2, fPath: [ 0, 0 ], fOffset: 8 }
      }),
      sTestInSelection('Find and replace consecutive spaces', {
        content: 'ab a&nbsp; &nbsp;b a&nbsp; &nbsp;',
        find: 'a   ',
        matches: 1,
        replace: 'x',
        expectedContent: '<p>ab a&nbsp; &nbsp;b x</p>',
        moreMatches: false,
        sel: { sPath: [ 0, 0 ], sOffset: 6, fPath: [ 0, 0 ], fOffset: 13 }
      }),
      sTestInSelection('Find and replace all in multiple matches', {
        content: 'a b a b a',
        find: 'a',
        matches: 2,
        replace: 'x',
        replaceAll: true,
        expectedContent: '<p>x b x b a</p>',
        moreMatches: false,
        sel: { sPath: [ 0, 0 ], sOffset: 0, fPath: [ 0, 0 ], fOffset: 7 }
      }),
      sTestInSelection('Find and replace all in multiple matches', {
        content: 'a&nbsp; &nbsp;b<br/><br/>ab&nbsp;c',
        find: ' ',
        matches: 2,
        replace: 'x',
        replaceAll: true,
        expectedContent: '<p>a&nbsp; xb<br /><br />abxc</p>',
        moreMatches: false,
        sel: { sPath: [ 0, 0 ], sOffset: 3, fPath: [ 0, 3 ], fOffset: 4 }
      }),
      sTestInSelection('Find and replace fragmented match', {
        content: '<b>te<i>s</i>t</b><b>te<i>s</i>t</b>',
        find: 'test',
        matches: 1,
        replace: 'abc',
        expectedContent: '<p><b>te<i>s</i>t</b><b>abc</b></p>',
        moreMatches: false,
        sel: { sPath: [ 0, 0, 1 ], sOffset: 0, fPath: [ 0, 1, 2 ], fOffset: 1 }
      }),
      sTestInSelection('Find and replace all fragmented matches', {
        content: '<b>te<i>s</i>t</b><b>te<i>s</i>t</b><b>te<i>s</i>t</b>',
        find: 'test',
        matches: 2,
        replace: 'abc',
        replaceAll: true,
        expectedContent: '<p><b>te<i>s</i>t</b><b>abc</b><b>abc</b></p>',
        moreMatches: false,
        sel: { sPath: [ 0, 1, 0 ], sOffset: 0, fPath: [ 0, 2, 2 ], fOffset: 1 }
      })
    ]), onSuccess, onFailure);
  }, {
    plugins: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver',
    extended_valid_elements: 'b,i'
  }, success, failure);
}
);
