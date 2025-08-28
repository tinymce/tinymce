import { describe, it } from '@ephox/bedrock-client';
import { Strings } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ApplyListOnParagraphWithStylesTest', () => {

  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TINY-9998: Apply list to nested custom list should keep the original list structure', () => {
    const editor = hook.editor();
    const multilistContent = ( className: string, listType: 'ul' | 'ol' = 'ul' ) =>
      // eslint-disable-next-line max-len
      `<${listType}${Strings.isEmpty(className) ? '' : ` class="${className}"`}><li>a<${listType}${Strings.isEmpty(className) ? '' : ` class="${className}"`}><li>a1</li><li>a2</li></${listType}></li><li>b<${listType}${Strings.isEmpty(className) ? '' : ` class="${className}"`}><li>b1</li><li>b2</li></${listType}></li></${listType}>`;
    editor.setContent(multilistContent('tox-checklist'));
    editor.execCommand('SelectAll');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, multilistContent(''));
    editor.setContent(multilistContent('tox-checklist'));
    editor.execCommand('SelectAll');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]');
    TinyAssertions.assertContent(editor, multilistContent('', 'ol'));
  });

  it('TINY-9998: Apply list to flat custom list should keep the original list structure', () => {
    const editor = hook.editor();
    const singleListContent = ( className: string, listType: 'ul' | 'ol' = 'ul' ) =>
      `<${listType}${Strings.isEmpty(className) ? '' : ` class="${className}"`}><li>a</li><li>b</li></${listType}>`;
    editor.setContent(singleListContent('tox-checklist'));
    editor.execCommand('SelectAll');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, singleListContent(''));
    editor.setContent(singleListContent('tox-checklist'));
    editor.execCommand('SelectAll');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]');
    TinyAssertions.assertContent(editor, singleListContent('', 'ol'));
  });

});
