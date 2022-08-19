import { ApproxStructure, Keys, StructAssert } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Zwsp from 'tinymce/core/text/Zwsp';

describe('browser.tinymce.core.keyboard.ArrowKeysAnchorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);
  const BEFORE = true;
  const AFTER = false;
  const START = true;
  const END = false;

  const addGeckoBr = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, children: StructAssert[]) => {
    if (PlatformDetection.detect().browser.isFirefox()) {
      return [ ...children, s.element('br', { attrs: { 'data-mce-bogus': str.is('1') }}) ];
    } else {
      return children;
    }
  };

  const anchorSurroundedWithText = (expectedText: string) => {
    return ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a')),
              s.element('a', {
                attrs: {
                  'data-mce-selected': str.is('inline-boundary'),
                  'data-mce-href': str.is('#'),
                  'href': str.is('#')
                },
                children: [
                  s.text(str.is(expectedText))
                ]
              }),
              s.text(str.is('c'))
            ]
          })
        ]
      });
    });
  };

  const anchorSurroundedWithZwspInside = (start: boolean) => {
    return anchorSurroundedWithText(start ? Zwsp.ZWSP + 'b' : 'b' + Zwsp.ZWSP);
  };

  const anchorSurroundedWithZwspOutside = (before: boolean) => {
    return ApproxStructure.build((s, str) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.text(str.is('a' + (before ? Zwsp.ZWSP : ''))),
              s.element('a', {
                attrs: {
                  'data-mce-selected': str.none('inline-boundary'),
                  'data-mce-href': str.is('#'),
                  'href': str.is('#')
                },
                children: [
                  s.text(str.is('b'))
                ]
              }),
              s.text(str.is((before === false ? Zwsp.ZWSP : '') + 'c'))
            ]
          })
        ]
      });
    });
  };

  const anchorsZwspOutside = (texts: string[], before: boolean, index: number) => {
    return ApproxStructure.build((s, str) => {
      const children = Arr.map(texts, (text, i) => {
        return Arr.flatten([
          index === i && before ? [ s.text(str.is(Zwsp.ZWSP)) ] : [ ],
          [
            s.element(
              'a',
              {
                attrs: {
                  'data-mce-selected': str.none('inline-boundary'),
                  'data-mce-href': str.is('#'),
                  'href': str.is('#')
                },
                children: [
                  s.text(str.is(text))
                ]
              }
            )
          ],
          index === i && before === false ? [ s.text(str.is(Zwsp.ZWSP)) ] : [ ]
        ]);
      });

      return s.element('body', {
        children: [
          s.element('p', {
            children: addGeckoBr(s, str, Arr.flatten(children))
          })
        ]
      });
    });
  };

  const anchorsZwspInside = (texts: string[], start: boolean, index: number) => {
    return ApproxStructure.build((s, str) => {
      const children = Arr.map(texts, (text, i) => {
        const zwspText = start ? Zwsp.ZWSP + text : text + Zwsp.ZWSP;

        return s.element(
          'a',
          {
            attrs: {
              'data-mce-selected': i === index ? str.is('inline-boundary') : str.none('1'),
              'data-mce-href': str.is('#'),
              'href': str.is('#')
            },
            children: [
              s.text(str.is(i === index ? zwspText : text))
            ]
          }
        );
      });

      return s.element('body', {
        children: [
          s.element('p', {
            children: addGeckoBr(s, str, children)
          })
        ]
      });
    });
  };

  it('Test arrow keys with single anchor', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#">b</a></p>');

    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.nodeChanged();
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspInside([ 'b' ], START, 0));

    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    TinyAssertions.assertContentStructure(editor, anchorsZwspOutside([ 'b' ], BEFORE, 0));

    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    TinyAssertions.assertContentStructure(editor, anchorsZwspOutside([ 'b' ], BEFORE, 0));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspInside([ 'b' ], START, 0));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspInside([ 'b' ], END, 0));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspOutside([ 'b' ], AFTER, 0));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspOutside([ 'b' ], AFTER, 0));
  });

  it('Test arrow keys with anchor surrounded by text', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<a href="#">b</a>c</p>');

    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    editor.nodeChanged();
    TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorSurroundedWithZwspInside(START));

    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorSurroundedWithZwspOutside(BEFORE));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorSurroundedWithZwspInside(START));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorSurroundedWithZwspInside(END));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorSurroundedWithZwspOutside(AFTER));
  });

  it('Test arrow keys with multiple anchors', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#">a</a><a href="#">b</a></p>');

    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.nodeChanged();
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspInside([ 'a', 'b' ], START, 0));

    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    TinyAssertions.assertContentStructure(editor, anchorsZwspOutside([ 'a', 'b' ], BEFORE, 0));

    TinyContentActions.keystroke(editor, Keys.left());
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    TinyAssertions.assertContentStructure(editor, anchorsZwspOutside([ 'a', 'b' ], BEFORE, 0));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspInside([ 'a', 'b' ], START, 0));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspInside([ 'a', 'b' ], END, 0));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspOutside([ 'a', 'b' ], BEFORE, 1));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspInside([ 'a', 'b' ], START, 1));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspInside([ 'a', 'b' ], END, 1));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspOutside([ 'a', 'b' ], AFTER, 1));

    TinyContentActions.keystroke(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
    TinyAssertions.assertContentStructure(editor, anchorsZwspOutside([ 'a', 'b' ], AFTER, 1));
  });
});
