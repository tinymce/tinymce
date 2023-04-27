import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/directionality/Plugin';

type Dir = 'rtl' | 'ltr';

describe('browser.tinymce.plugins.directionality.DirectionStyleTest', () => {
  const applyDir = (editor: Editor, dir: Dir) =>
    TinyUiActions.clickOnToolbar(editor, dir === 'ltr' ? 'button[title="Left to right"]' : 'button[title="Right to left"]');

  const testDirectionStyle = (editor: Editor, content: string, dir: Dir, expected: string) => {
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    applyDir(editor, dir);
    TinyAssertions.assertContent(editor, expected);
  };

  context('TINY-9314: Inline direction style', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      plugins: 'directionality',
      toolbar: 'ltr rtl',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ]);

    it('Applying ltr with dir="rtl" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p dir="rtl" style="direction: rtl;">RTL Style</p>',
      'ltr',
      '<p style="direction: ltr;">RTL Style</p>'
    ));

    it('Applying rtl with dir="ltr" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p dir="ltr" style="direction: ltr;">LTR Style</p>',
      'rtl',
      '<p dir="rtl" style="direction: rtl;">LTR Style</p>'
    ));

    it('Applying ltr with dir="ltr" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p dir="ltr" style="direction: ltr;">RTL Style</p>',
      'ltr',
      '<p style="direction: ltr;">RTL Style</p>'
    ));

    it('Applying rtl with dir="rtl" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p dir="rtl" style="direction: rtl;">LTR Style</p>',
      'rtl',
      '<p dir="rtl" style="direction: rtl;">LTR Style</p>'
    ));

    it('Applying ltr with no dir attribute and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p style="direction: rtl;">RTL Style</p>',
      'ltr',
      '<p style="direction: ltr;">RTL Style</p>'
    ));

    it('Applying rtl with no dir attribute and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p style="direction: ltr;">LTR Style</p>',
      'rtl',
      '<p dir="rtl" style="direction: rtl;">LTR Style</p>'
    ));

    it('Applying ltr with no dir attribute and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p style="direction: ltr;">LTR Style</p>',
      'ltr',
      '<p style="direction: ltr;">LTR Style</p>'
    ));

    it('Applying rtl with no dir attribute and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p style="direction: rtl;">RTL Style</p>',
      'rtl',
      '<p dir="rtl" style="direction: rtl;">RTL Style</p>'
    ));

    it('Applying ltr with dir="rtl" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p dir="rtl" style="direction: ltr;">LTR Style</p>',
      'ltr',
      '<p style="direction: ltr;">LTR Style</p>'
    ));

    it('Applying rtl with dir="rtl" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p dir="rtl" style="direction: ltr;">LTR Style</p>',
      'rtl',
      '<p dir="rtl" style="direction: rtl;">LTR Style</p>'
    ));

    it('Applying ltr with dir="ltr" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p dir="ltr" style="direction: rtl;">RTL Style</p>',
      'ltr',
      '<p style="direction: ltr;">RTL Style</p>'
    ));

    it('Applying rtl with dir="ltr" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p dir="ltr" style="direction: rtl;">RTL Style</p>',
      'rtl',
      '<p dir="rtl" style="direction: rtl;">RTL Style</p>'
    ));

    it('Should remove dir and direction style from selected list item and children', () => testDirectionStyle(
      hook.editor(),
      '<ul>' +
        '<li dir="ltr" style="direction: ltr;">foo' +
          '<ul>' +
            '<li dir="ltr">a</li>' +
            '<li dir="rtl">b</li>' +
            '<li>c</li>' +
          '</ul>' +
        '</li>' +
        '<li style="direction: ltr;">bar</li>' +
        '<li dir="rtl" style="direction: ltr;">bar1</li>' +
        '<li dir="ltr" style="direction: rtl;">bar2</li>' +
        '<li dir="xyz">bar3</li>' +
      '</ul>',
      'rtl',
      [
        '<ul dir="rtl">',
        '<li>foo',
        '<ul>',
        '<li dir="ltr">a</li>',
        '<li dir="rtl">b</li>',
        '<li>c</li>',
        '</ul>',
        '</li>',
        '<li>bar</li>',
        '<li>bar1</li>',
        '<li>bar2</li>',
        '<li>bar3</li>',
        '</ul>'
      ].join('\n')
    ));
  });
});

