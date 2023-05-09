import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/directionality/Plugin';

type Dir = 'rtl' | 'ltr';

describe('browser.tinymce.plugins.directionality.DirectionStyleTest', () => {
  const applyDir = (editor: Editor, dir: Dir) =>
    TinyUiActions.clickOnToolbar(editor, dir === 'ltr' ? 'button[title="Left to right"]' : 'button[title="Right to left"]');

  const testDirectionStyle = (editor: Editor, content: string, dir: Dir, expected: string, cursorPath: number[] = [ 0, 0 ]) => {
    editor.setContent(content);
    TinySelections.setCursor(editor, cursorPath, 0);
    applyDir(editor, dir);
    TinyAssertions.assertContent(editor, expected);
  };

  const baseSettings = {
    plugins: 'directionality',
    toolbar: 'ltr rtl',
    base_url: '/project/tinymce/js/tinymce'
  };

  context('Inline direction style', () => {
    const hook = TinyHooks.bddSetup<Editor>(baseSettings, [ Plugin ]);

    it('TINY-9314: Applying ltr with dir="rtl" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p dir="rtl" style="direction: rtl;">Lorem ipsum</p>',
      'ltr',
      '<p>Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with dir="ltr" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p dir="ltr" style="direction: ltr;">Lorem ipsum</p>',
      'rtl',
      '<p dir="rtl">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with dir="ltr" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p dir="ltr" style="direction: ltr;">Lorem ipsum</p>',
      'ltr',
      '<p>Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with dir="rtl" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p dir="rtl" style="direction: rtl;">Lorem ipsum</p>',
      'rtl',
      '<p dir="rtl">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with no dir attribute and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p style="direction: rtl;">Lorem ipsum</p>',
      'ltr',
      '<p>Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with no dir attribute and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p style="direction: ltr;">Lorem ipsum</p>',
      'rtl',
      '<p dir="rtl">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with no dir attribute and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p style="direction: ltr;">Lorem ipsum</p>',
      'ltr',
      '<p>Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with no dir attribute and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p style="direction: rtl;">Lorem ipsum</p>',
      'rtl',
      '<p dir="rtl">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with dir="rtl" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p dir="rtl" style="direction: ltr;">Lorem ipsum</p>',
      'ltr',
      '<p>Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with dir="rtl" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p dir="rtl" style="direction: ltr;">Lorem ipsum</p>',
      'rtl',
      '<p dir="rtl">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with dir="ltr" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p dir="ltr" style="direction: rtl;">Lorem ipsum</p>',
      'ltr',
      '<p>Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with dir="ltr" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p dir="ltr" style="direction: rtl;">Lorem ipsum</p>',
      'rtl',
      '<p dir="rtl">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr to element whose parent has direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<div style="direction: rtl;"><p>Lorem ipsum</p></div>',
      'ltr',
      [
        '<div style="direction: rtl;">',
        '<p dir="ltr">Lorem ipsum</p>',
        '</div>'
      ].join('\n'),
      [ 0, 0, 0 ]
    ));

    it('TINY-9314: Applying rtl to element whose parent has direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<div style="direction: ltr;"><p>Lorem ipsum</p></div>',
      'rtl',
      [
        '<div style="direction: ltr;">',
        '<p dir="rtl">Lorem ipsum</p>',
        '</div>'
      ].join('\n'),
      [ 0, 0, 0 ]
    ));

    it('TINY-9314: Should remove dir and direction style from selected list item and children', () => testDirectionStyle(
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

  context('Direction style from stylesheet', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...baseSettings,
      content_style: '.rtl-content { direction: rtl; } .ltr-content { direction: ltr; }',
    }, [ Plugin ]);

    it('TINY-9314: Applying ltr with dir="rtl" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p class="rtl-content" dir="rtl">Lorem ipsum</p>',
      'ltr',
      '<p class="rtl-content" style="direction: ltr;">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with dir="ltr" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p class="ltr-content" dir="ltr">Lorem ipsum</p>',
      'rtl',
      '<p class="ltr-content" dir="rtl" style="direction: rtl;">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with dir="ltr" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p class="ltr-content" dir="ltr">Lorem ipsum</p>',
      'ltr',
      '<p class="ltr-content">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with dir="rtl" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p class="rtl-content" dir="rtl">Lorem ipsum</p>',
      'rtl',
      '<p class="rtl-content" dir="rtl">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with no dir attribute and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p class="rtl-content">Lorem ipsum</p>',
      'ltr',
      '<p class="rtl-content" style="direction: ltr;">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with no dir attribute and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p class="ltr-content">Lorem ipsum</p>',
      'rtl',
      '<p class="ltr-content" dir="rtl" style="direction: rtl;">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with no dir attribute and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p class="ltr-content">Lorem ipsum</p>',
      'ltr',
      '<p class="ltr-content">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with no dir attribute and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p class="rtl-content">Lorem ipsum</p>',
      'rtl',
      '<p class="rtl-content" dir="rtl">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with dir="rtl" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p class="ltr-content" dir="rtl">Lorem ipsum</p>',
      'ltr',
      '<p class="ltr-content">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with dir="rtl" and direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<p class="ltr-content" dir="rtl">Lorem ipsum</p>',
      'rtl',
      '<p class="ltr-content" dir="rtl" style="direction: rtl;">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr with dir="ltr" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p class="rtl-content" dir="ltr">Lorem ipsum</p>',
      'ltr',
      '<p class="rtl-content" style="direction: ltr;">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying rtl with dir="ltr" and direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<p class="rtl-content" dir="ltr">Lorem ipsum</p>',
      'rtl',
      '<p class="rtl-content" dir="rtl">Lorem ipsum</p>'
    ));

    it('TINY-9314: Applying ltr to element whose parent has direction: rtl', () => testDirectionStyle(
      hook.editor(),
      '<div class="rtl-content"><p>Lorem ipsum</p></div>',
      'ltr',
      [
        '<div class="rtl-content">',
        '<p dir="ltr">Lorem ipsum</p>',
        '</div>'
      ].join('\n'),
      [ 0, 0, 0 ]
    ));

    it('TINY-9314: Applying rtl to element whose parent has direction: ltr', () => testDirectionStyle(
      hook.editor(),
      '<div class="ltr-content"><p>Lorem ipsum</p></div>',
      'rtl',
      [
        '<div class="ltr-content">',
        '<p dir="rtl">Lorem ipsum</p>',
        '</div>'
      ].join('\n'),
      [ 0, 0, 0 ]
    ));

    it('TINY-9314: Should remove dir and direction style from selected list item and children', () => testDirectionStyle(
      hook.editor(),
      '<ul class="rtl-content">' +
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
      'ltr',
      [
        '<ul class="rtl-content" style="direction: ltr;">',
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

