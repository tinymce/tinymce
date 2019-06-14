import { GeneralSteps, Logger, Pipeline, Step, Waiter, Chain, Cursors } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import Editor from 'tinymce/core/api/Editor';
import { PlatformDetection } from '@ephox/sand';
import { Element, Insert } from '@ephox/sugar';
import { Arr, Fun } from '@ephox/katamari';
import { document } from '@ephox/dom-globals';

const browser = PlatformDetection.detect().browser;

UnitTest.asynctest('browser.tinymce.core.keyboard.InsertKeysTest', (success, failure) => {
  Theme();

  const sFireInsert = (editor: Editor) => {
    return Step.sync(() => {
      editor.fire('input', { isComposing: false });
    });
  };

  const sFireKeyPress = (editor: Editor) => {
    return Step.sync(() => {
      editor.fire('keypress');
    });
  };

  const sInsertEmptyTextNodesAt = (editor: Editor, count: number, path: number[], insert: (marker: Element, element: Element) => void) => {
    return Chain.asStep(Element.fromDom(editor.getBody()), [
      Cursors.cFollow(path),
      Chain.op((elm) => {
        Arr.each(Arr.range(count, Fun.identity), () => {
          insert(elm, Element.fromDom(document.createTextNode('')));
        });
      })
    ]);
  };

  const sPrependEmptyTextNodesAt = (editor: Editor, count: number, path: number[]) => {
    return sInsertEmptyTextNodesAt(editor, count, path, Insert.before);
  };

  const sAppendEmptyTextNodesAt = (editor: Editor, count: number, path: number[]) => {
    return sInsertEmptyTextNodesAt(editor, count, path, Insert.after);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Insert key in text with in nbsp text node', GeneralSteps.sequence([
        Logger.t('Nbsp at first character position', GeneralSteps.sequence([
          Logger.t('Insert in text node with nbsp at start of block', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>&nbsp;a</p>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<p>&nbsp;a</p>')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline with trailing space', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<em>b </em>&nbsp;c</p>'),
            tinyApis.sSetCursor([0, 2], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2], 2, [0, 2], 2),
            tinyApis.sAssertContent('<p>a<em>b </em>&nbsp;c</p>')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<em>b</em>&nbsp;c</p>'),
            tinyApis.sSetCursor([0, 2], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2], 2, [0, 2], 2),
            tinyApis.sAssertContent('<p>a<em>b</em> c</p>')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline with trailing nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<em>b&nbsp;</em>&nbsp;c</p>'),
            tinyApis.sSetCursor([0, 2], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2], 2, [0, 2], 2),
            tinyApis.sAssertContent('<p>a<em>b&nbsp;</em> c</p>')
          ])),
          Logger.t('Insert at beginning of text node with leading nbsp after a br', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<br />&nbsp;b</p>'),
            tinyApis.sSetCursor([0, 2], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2], 0, [0, 2], 0),
            tinyApis.sAssertContent('<p>a<br />&nbsp;b</p>')
          ])),
          Logger.t('Insert at beginning of text node with leading nbsp within inline element followed by br', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a<br /><em>&nbsp;b</em></p>'),
            tinyApis.sSetCursor([0, 2, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 2, 0], 0, [0, 2, 0], 0),
            tinyApis.sAssertContent('<p>a<br /><em>&nbsp;b</em></p>')
          ]))
        ])),

        Logger.t('Nbsp at last character position', GeneralSteps.sequence([
          Logger.t('Insert in text node with nbsp at end of block', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            tinyApis.sAssertContent('<p>a&nbsp;</p>')
          ])),
          Logger.t('Insert in text in node with leading nbsp after inline with trailing space', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;<em> b</em>c</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            tinyApis.sAssertContent('<p>a&nbsp;<em> b</em>c</p>')
          ])),
          Logger.t('Insert in text in node with traling nbsp before inline', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;<em>b</em>c</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            tinyApis.sAssertContent('<p>a <em>b</em>c</p>')
          ])),
          Logger.t('Insert in text in node with trailing nbsp before inline with leading nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;<em>&nbsp;b</em>c</p>'),
            tinyApis.sSetCursor([0, 0], 0),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0),
            tinyApis.sAssertContent('<p>a <em>&nbsp;b</em>c</p>')
          ])),
          Logger.t('Insert in text in node with single middle nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;b</p>'),
            tinyApis.sSetCursor([0, 0], 3),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 3, [0, 0], 3),
            tinyApis.sAssertContent('<p>a b</p>')
          ])),
          Logger.t('Insert in text in node with multiple middle nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;b&nbsp;c&nbsp;d</p>'),
            tinyApis.sSetCursor([0, 0], 7),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 7, [0, 0], 7),
            tinyApis.sAssertContent('<p>a b c d</p>')
          ])),
          Logger.t('Insert in text node multiple nbsps between inline elements', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p><em>a</em>&nbsp;&nbsp;<em>b</em></p>'),
            tinyApis.sSetCursor([0, 1], 1),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
            tinyApis.sAssertContent('<p><em>a</em> &nbsp;<em>b</em></p>')
          ]))
        ])),

        Logger.t('Nbsp at fragmented text', GeneralSteps.sequence([
          Logger.t('Insert nbsp at end of text block with leading empty text nodes should retain the nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>&nbsp;a</p>'),
            sPrependEmptyTextNodesAt(editor, 3, [0, 0]),
            tinyApis.sSetCursor([0, 3], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 3], 2, [0, 3], 2),
            tinyApis.sAssertContent('<p>&nbsp;a</p>')
          ])),
          Logger.t('Insert nbsp at end of text block with trailing empty text nodes should retain the nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>a&nbsp;</p>'),
            sAppendEmptyTextNodesAt(editor, 3, [0, 0]),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<p>a&nbsp;</p>')
          ]))
        ])),

        Logger.t('Nbsp at img', GeneralSteps.sequence([
          Logger.t('Insert nbsp before an image at start of a block should not remove the nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p>&nbsp;<img src="about:blank" /></p>'),
            tinyApis.sSetCursor([0, 0], 1),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1),
            tinyApis.sAssertContent('<p>&nbsp;<img src="about:blank" /></p>')
          ])),
          Logger.t('Insert nbsp between two images should remove nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p><img src="about:blank" />&nbsp;<img src="about:blank" /></p>'),
            tinyApis.sSetCursor([0, 1], 1),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
            tinyApis.sAssertContent('<p><img src="about:blank" /> <img src="about:blank" /></p>')
          ])),
          Logger.t('Insert nbsp after an image at the end of a block should not remove the nbsp', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<p><img src="about:blank" />&nbsp;</p>'),
            tinyApis.sSetCursor([0, 1], 1),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1),
            tinyApis.sAssertContent('<p><img src="about:blank" />&nbsp;</p>')
          ]))
        ])),

        Logger.t('Insert in text on IE using keypress', GeneralSteps.sequence(browser.isIE() ? [
          tinyApis.sFocus,
          tinyApis.sSetContent('<p>a&nbsp;b</p>'),
          tinyApis.sSetCursor([0, 0], 3),
          sFireKeyPress(editor),
          Waiter.sTryUntil('', tinyApis.sAssertContent('<p>a b</p>'), 10, 1000),
          tinyApis.sAssertSelection([0, 0], 3, [0, 0], 3),
        ] : [])),

        Logger.t('Nbsp in pre', GeneralSteps.sequence([
          Logger.t('Trim nbsp at beginning of text in pre element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<pre>&nbsp;a</pre>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<pre> a</pre>')
          ])),
          Logger.t('Trim nbsp at end of text in pre element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<pre>a&nbsp;</pre>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<pre>a </pre>')
          ])),
          Logger.t('Trim nbsp middle of text in pre element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<pre>a&nbsp;b</pre>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<pre>a b</pre>')
          ]))
        ])),

        Logger.t('Nbsp in pre: white-space: pre-wrap', GeneralSteps.sequence([
          Logger.t('Trim nbsp at start of text in white-space: pre-line element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<pre style="white-space: pre-wrap;">&nbsp;a</pre>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<pre style="white-space: pre-wrap;"> a</pre>')
          ])),
          Logger.t('Trim nbsp at end of text in white-space: pre-line element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<pre style="white-space: pre-wrap;">a&nbsp;</pre>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<pre style="white-space: pre-wrap;">a </pre>')
          ])),
          Logger.t('Trim nbsp in middle of text in in white-space: pre-line element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<pre style="white-space: pre-wrap;">a&nbsp;b</pre>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<pre style="white-space: pre-wrap;">a b</pre>')
          ]))
        ])),

        Logger.t('Nbsp in pre: white-space: pre-line', GeneralSteps.sequence([
          Logger.t('Do not trim nbsp at beginning of text in white-space: pre-line element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<pre style="white-space: pre-line;">&nbsp;a</pre>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<pre style="white-space: pre-line;">&nbsp;a</pre>')
          ])),
          Logger.t('Do not trim nbsp at end of text in white-space: pre-line element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<pre style="white-space: pre-line;">a&nbsp;</pre>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<pre style="white-space: pre-line;">a&nbsp;</pre>')
          ])),
          Logger.t('Trim nbsp in middle of text in in white-space: pre-line element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<pre style="white-space: pre-line;">a&nbsp;b</pre>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<pre style="white-space: pre-line;">a b</pre>')
          ]))
        ])),

        Logger.t('Nbsp before/after block', GeneralSteps.sequence([
          Logger.t('Do not trim nbsp before a block element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<div>a&nbsp;<p>b</p></div>'),
            tinyApis.sSetCursor([0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
            tinyApis.sAssertContent('<div>a&nbsp;<p>b</p></div>')
          ])),
          Logger.t('Do not trim nbsp after a block element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<div><p>b</p>&nbsp;a</div>'),
            tinyApis.sSetCursor([0, 1], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 1], 2, [0, 1], 2),
            tinyApis.sAssertContent('<div><p>b</p>&nbsp;a</div>')
          ])),
          Logger.t('Do not trim nbsp in an inline before a block element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<div><em>a&nbsp;</em><p>b</p></div>'),
            tinyApis.sSetCursor([0, 0, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 0, 0], 2, [0, 0, 0], 2),
            tinyApis.sAssertContent('<div><em>a&nbsp;</em><p>b</p></div>')
          ])),
          Logger.t('Do not trim nbsp in an inline after a block element', GeneralSteps.sequence([
            tinyApis.sFocus,
            tinyApis.sSetContent('<div><p>b</p><em>&nbsp;a</em></div>'),
            tinyApis.sSetCursor([0, 1, 0], 2),
            sFireInsert(editor),
            tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2),
            tinyApis.sAssertContent('<div><p>b</p><em>&nbsp;a</em></div>')
          ]))
        ]))
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
  }, success, failure);
});
