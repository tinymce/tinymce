import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Plugin from 'tinymce/plugins/directionality/Plugin';

describe('browser.tinymce.plugins.directionality.DirectionalitySanityTest', () => {
  const hook = TinyHooks.bddSetupLight({
    plugins: 'directionality',
    toolbar: 'ltr rtl',
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Plugin ]);

  it('TBA: Set and select content, click on the Right to left toolbar button and assert direction is right to left', () => {
    const editor = hook.editor();
    editor.setContent('a');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, '<p dir="rtl">a</p>');
  });

  it('TBA: Set and select content, click on the Left to right toolbar button and assert direction is left to right', () => {
    const editor = hook.editor();
    editor.setContent('<p dir="rtl">a</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, '<p>a</p>'); // as the default dir is ltr it just removes the dir attr
  });

  it('TINY-4589: should set two paragraphs to rtl and ltl', () => {
    const editor = hook.editor();
    editor.setContent('<p>foo</p><p>bar</p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 1 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, '<p dir="rtl">foo</p><p dir="rtl">bar</p>');
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, '<p>foo</p><p>bar</p>');
  });

  it('TINY-4589: should set parent dir when element is a list item', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>foo</li><li>bar</li></ul>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, '<ul dir="rtl"><li>foo</li><li>bar</li></ul>');
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, '<ul><li>foo</li><li>bar</li></ul>');
  });

  it('TINY-4589: should remove dir from selected list item and children', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li dir="ltr">foo' +
          '<ul>' +
            '<li dir="ltr">a</li>' +
            '<li dir="rtl">b</li>' +
            '<li>c</li>' +
          '</ul>' +
        '</li>' +
        '<li dir="xyz">bar</li>' +
      '</ul>'
    );
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor,
      '<ul dir="rtl">' +
        '<li>foo' +
          '<ul>' +
            '<li dir="ltr">a</li>' +
            '<li dir="rtl">b</li>' +
            '<li>c</li>' +
          '</ul>' +
        '</li>' +
        '<li>bar</li>' +
      '</ul>'
    );
  });

  it('TINY-4589: applying the same dir makes no changes', () => {
    const editor = hook.editor();
    const editorContent =
    '<ul dir="rtl">' +
      '<li dir="ltr">ini' +
        '<ul>' +
          '<li>foo</li>' +
          '<li>bar</li>' +
        '</ul>' +
      '</li>' +
    '</ul>';
    editor.setContent(editorContent);
    TinySelections.setSelection(editor, [ 0, 0, 1, 0 ], 0, [ 0, 0, 1, 0 ], 1); // foo
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, editorContent);
  });

  it('TINY-4589: should consider list item dir', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul dir="rtl">' +
        '<li dir="ltr">ini' +
          '<ul>' +
            '<li>foo</li>' +
            '<li>bar</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
    TinySelections.setSelection(editor, [ 0, 0, 1, 0 ], 0, [ 0, 0, 1, 0 ], 1); // foo
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor,
      '<ul dir="rtl">' +
        '<li dir="ltr">ini' +
          '<ul dir="rtl">' +
            '<li>foo</li>' +
            '<li>bar</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
  });

  it('TINY-4589: should remove dir attr if parent has same dir', () => {
    const editor = hook.editor();
    editor.setContent('<div dir="ltr"><p>foo</p><p>bar</p></div>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor, '<div dir="ltr"><p dir="rtl">foo</p><p>bar</p></div>');
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor, '<div dir="ltr"><p>foo</p><p>bar</p></div>');
  });

  it('TINY-4589: should get computed dir from #target-elm', () => {
    const editor = hook.editor();
    editor.setContent(
      '<div dir="rtl">' +
        '<div id="target-elm" dir="ltr">' +
          '<div dir="x">' +
            '<p>foo</p>' +
            '<p>bar</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    TinySelections.setSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0 ], 1); // foo
    TinyUiActions.clickOnToolbar(editor, 'button[title="Right to left"]');
    TinyAssertions.assertContent(editor,
      '<div dir="rtl">' +
        '<div id="target-elm" dir="ltr">' +
          '<div dir="x">' +
            '<p dir="rtl">foo</p>' +
            '<p>bar</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    TinyUiActions.clickOnToolbar(editor, 'button[title="Left to right"]');
    TinyAssertions.assertContent(editor,
      '<div dir="rtl">' +
        '<div id="target-elm" dir="ltr">' +
          '<div dir="x">' +
            '<p>foo</p>' +
            '<p>bar</p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  });
});
