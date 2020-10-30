import { Assertions, Chain, Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { ApiChains, TinyApis, TinyLoader } from '@ephox/mcagar';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as ExpandRange from 'tinymce/core/fmt/ExpandRange';
import { ZWSP } from 'tinymce/core/text/Zwsp';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.fmt.ExpandRangeTest', (success, failure) => {

  Theme();

  const cExpandRng = (startPath: number[], startOffset: number, endPath: number[], endOffset: number, format, excludeTrailingSpaces: boolean = false) =>
    Chain.mapper((editor: Editor) => {
      const startContainer = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), startPath).getOrDie();
      const endContainer = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), endPath).getOrDie();

      const rng = editor.dom.createRng();
      rng.setStart(startContainer.dom, startOffset);
      rng.setEnd(endContainer.dom, endOffset);

      return ExpandRange.expandRng(editor, rng, format, excludeTrailingSpaces);
    });

  const cAssertRange = (editor: Editor, startPath: number[], startOffset: number, endPath: number[], endOffset: number) =>
    Chain.op((rng: Range) => {
      const startContainer = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), startPath).getOrDie();
      const endContainer = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), endPath).getOrDie();

      Assertions.assertDomEq('Should be expected start container', startContainer, SugarElement.fromDom(rng.startContainer));
      Assertions.assertEq('Should be expected start offset', startOffset, rng.startOffset);
      Assertions.assertDomEq('Should be expected end container', endContainer, SugarElement.fromDom(rng.endContainer));
      Assertions.assertEq('Should be expected end offset', endOffset, rng.endOffset);
    });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const inlineFormat = [{ inline: 'b' }];
    const blockFormat = [{ block: 'div' }];
    const selectorFormat = [{ selector: 'div', classes: 'b' }];
    const selectorFormatCollapsed = [{ selector: 'div', classes: 'b', collapsed: true }];

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Log.stepsAsStep('TBA', 'Expand inline format words', [
        Log.step('TBA', 'In middle of single word in paragraph', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab</p>'),
          cExpandRng([ 0, 0 ], 1, [ 0, 0 ], 1, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'In middle of single word in paragraph with paragraph siblings', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>a</p><p>bc</p><p>de</p>'),
          cExpandRng([ 1, 0 ], 1, [ 1, 0 ], 1, inlineFormat, false),
          cAssertRange(editor, [], 1, [], 2)
        ])),
        Log.step('TBA', 'In middle of single word wrapped in b', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><b>ab</b></p>'),
          cExpandRng([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'In middle of first word', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab cd</p>'),
          cExpandRng([ 0, 0 ], 1, [ 0, 0 ], 1, inlineFormat, false),
          cAssertRange(editor, [], 0, [ 0, 0 ], 2)
        ])),
        Log.step('TBA', 'In middle of last word', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab cd</p>'),
          cExpandRng([ 0, 0 ], 4, [ 0, 0 ], 4, inlineFormat, false),
          cAssertRange(editor, [ 0, 0 ], 3, [], 1)
        ])),
        Log.step('TBA', 'In middle of middle word', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab cd ef</p>'),
          cExpandRng([ 0, 0 ], 4, [ 0, 0 ], 4, inlineFormat, false),
          cAssertRange(editor, [ 0, 0 ], 3, [ 0, 0 ], 5)
        ])),
        Log.step('TBA', 'In middle of word with bold siblings expand to sibling spaces', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><b>ab </b>cd<b> ef</b></p>'),
          cExpandRng([ 0, 1 ], 1, [ 0, 1 ], 1, inlineFormat, false),
          cAssertRange(editor, [ 0, 0, 0 ], 3, [ 0, 2, 0 ], 0)
        ])),
        Log.step('TBA', 'In middle of word with block sibling and inline sibling expand to sibling space to the right', Chain.asStep(editor, [
          ApiChains.cSetContent('<div><p>ab </p>cd<b> ef</b></div>'),
          cExpandRng([ 0, 1 ], 1, [ 0, 1 ], 1, inlineFormat, false),
          cAssertRange(editor, [ 0, 1 ], 0, [ 0, 2, 0 ], 0)
        ])),
        Log.step('TBA', 'In middle of word with block sibling and inline sibling expand to sibling space to the left', Chain.asStep(editor, [
          ApiChains.cSetContent('<div><b>ab </b>cd<p> ef</p></div>'),
          cExpandRng([ 0, 1 ], 1, [ 0, 1 ], 1, inlineFormat, false),
          cAssertRange(editor, [ 0, 0, 0 ], 3, [ 0, 1 ], 2)
        ])),
        Log.step('TBA', 'In middle of middle word separated by nbsp characters', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab\u00a0cd\u00a0ef</p>'),
          cExpandRng([ 0, 0 ], 4, [ 0, 0 ], 4, inlineFormat, false),
          cAssertRange(editor, [ 0, 0 ], 3, [ 0, 0 ], 5)
        ])),
        Log.step('TBA', 'In empty paragraph', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><br></p>'),
          cExpandRng([ 0 ], 0, [ 0 ], 0, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'Fully selected word', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab</p>'),
          cExpandRng([ 0, 0 ], 0, [ 0, 0 ], 2, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'Partially selected word', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>abc</p>'),
          cExpandRng([ 0, 0 ], 1, [ 0, 0 ], 2, inlineFormat, false),
          cAssertRange(editor, [ 0, 0 ], 1, [ 0, 0 ], 2)
        ])),
        Log.step('TBA', 'Whole word selected wrapped in multiple inlines', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><b><i>c</i></b></p>'),
          cExpandRng([ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'Whole word inside td', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>a</td></tr></tbody></table>'),
          cExpandRng([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1, inlineFormat, false),
          cAssertRange(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1)
        ])),
        Log.step('TBA', 'In middle of single word in paragraph (index based)', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab</p>'),
          cExpandRng([ 0 ], 0, [ 0 ], 1, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'In middle of single word wrapped in bold in paragraph (index based)', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><b>ab</b></p>'),
          cExpandRng([ 0 ], 0, [ 0 ], 1, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'In middle of word inside bookmark then exclude bookmark', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><span data-mce-type="bookmark">ab cd ef</span></p>'),
          cExpandRng([ 0, 0, 0 ], 3, [ 0, 0, 0 ], 5, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ]))
      ]),

      Log.stepsAsStep('TBA', 'Expand inline format words (remove format)', [
        Log.step('TBA', 'In middle of single word in paragraph', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab</p>'),
          cExpandRng([ 0, 0 ], 1, [ 0, 0 ], 1, inlineFormat, true),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TINY-6268', 'Does not extend over space before', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab<u> <span data-mce-type="bookmark">' + ZWSP + '</span>cd</u></p>'),
          cExpandRng([ 0, 1, 2 ], 0, [ 0, 1, 2 ], 2, inlineFormat, false),
          cAssertRange(editor, [ 0, 1, 2 ], 0, [], 1)
        ])),
        Log.step('TINY-6268', 'Does not extend over space after', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><u>ab<span data-mce-type="bookmark">' + ZWSP + '</span> </u>cd</p>'),
          cExpandRng([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2, inlineFormat, false),
          cAssertRange(editor, [], 0, [ 0, 0, 0 ], 2)
        ])),
        Log.step('TINY-6268', 'Does extend over collapsible space at start of block', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><u> <span data-mce-type="bookmark">' + ZWSP + '</span>ab</u></p>'),
          cExpandRng([ 0, 0, 2 ], 0, [ 0, 0, 2 ], 2, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TINY-6268', 'Does extend over collapsible space at end of block', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><u>ab<span data-mce-type="bookmark">' + ZWSP + '</span> </u></p>'),
          cExpandRng([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2, inlineFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ]))
      ]),

      Log.stepsAsStep('TBA', 'Expand block format', [
        Log.step('TBA', 'In middle word', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab cd ef</p>'),
          cExpandRng([ 0, 0 ], 4, [ 0, 0 ], 4, blockFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'In middle bold word', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab <b>cd</b> ef</p>'),
          cExpandRng([ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1, blockFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'Whole word inside td', Chain.asStep(editor, [
          ApiChains.cSetContent('<table><tbody><tr><td>a</td></tr></tbody></table>'),
          cExpandRng([ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0 ], 1, blockFormat, false),
          cAssertRange(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1)
        ]))
      ]),

      Log.stepsAsStep('TBA', 'Expand selector format', [
        Log.step('TBA', 'Do not expand over element if selector does not match', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab</p>'),
          cExpandRng([ 0, 0 ], 1, [ 0, 0 ], 1, selectorFormat, false),
          cAssertRange(editor, [ 0, 0 ], 0, [ 0, 0 ], 2)
        ])),
        Log.step('TBA', 'Do not expand outside of element if selector does not match - from bookmark at middle', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>a<span data-mce-type="bookmark">&#65279;</span>b</p>'),
          cExpandRng([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0, selectorFormat, false),
          cAssertRange(editor, [ 0, 0 ], 0, [ 0, 2 ], 1)
        ])),
        Log.step('TBA', 'Do not expand outside of element if selector does not match - from bookmark at start', Chain.asStep(editor, [
          ApiChains.cSetContent('<p><span data-mce-type="bookmark">&#65279;</span>ab</p>'),
          cExpandRng([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0, selectorFormat, false),
          cAssertRange(editor, [ 0 ], 0, [ 0, 1 ], 2)
        ])),
        Log.step('TBA', 'Do not expand outside of element if selector does not match - from bookmark at end', Chain.asStep(editor, [
          ApiChains.cSetContent('<p>ab<span data-mce-type="bookmark">&#65279;</span></p>'),
          cExpandRng([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0, selectorFormat, false),
          cAssertRange(editor, [ 0, 0 ], 0, [ 0 ], 2)
        ])),
        Log.step('TBA', 'Expand since selector matches', Chain.asStep(editor, [
          ApiChains.cSetContent('<div>ab</div>'),
          cExpandRng([ 0, 0 ], 1, [ 0, 0 ], 1, selectorFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'Expand since selector matches non collapsed', Chain.asStep(editor, [
          ApiChains.cSetContent('<div>ab</div>'),
          cExpandRng([ 0, 0 ], 1, [ 0, 0 ], 2, selectorFormat, false),
          cAssertRange(editor, [], 0, [], 1)
        ]))
      ]),

      Log.stepsAsStep('TBA', 'Expand selector format with collapsed property', [
        Log.step('TBA', 'Expand since selector matches collapsed on collapsed format', Chain.asStep(editor, [
          ApiChains.cSetContent('<div>ab</div>'),
          cExpandRng([ 0, 0 ], 1, [ 0, 0 ], 1, selectorFormatCollapsed, false),
          cAssertRange(editor, [], 0, [], 1)
        ])),
        Log.step('TBA', 'Expand since selector matches non collapsed on collapsed format', Chain.asStep(editor, [
          ApiChains.cSetContent('<div>ab</div>'),
          cExpandRng([ 0, 0 ], 1, [ 0, 0 ], 2, selectorFormatCollapsed, false),
          cAssertRange(editor, [ 0, 0 ], 1, [ 0, 0 ], 2)
        ]))
      ])
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    toolbar: '',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
