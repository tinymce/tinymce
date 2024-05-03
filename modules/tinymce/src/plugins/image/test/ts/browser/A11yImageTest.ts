import { Cursors, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarBody, Value } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { fillActiveDialog, generalTabSelectors, ImageDialogData } from '../module/Helpers';

describe('browser.tinymce.plugins.image.A11yImageTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    a11y_advanced_options: true
  }, [ Plugin ]);

  const pInitAndOpenDialog = async (editor: Editor, content: string, cursorPos: Cursors.RangeSpec | Cursors.CursorSpec) => {
    editor.options.set('image_advtab', true);
    editor.options.set('image_dimensions', false);
    editor.setContent(content);
    TinySelections.setSelectionFrom(editor, cursorPos);
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
  };

  const pCreateTestOnContent = async (editor: Editor, data: Partial<ImageDialogData>, cursorPos: Cursors.RangeSpec | Cursors.CursorSpec, initialContent: string, expectedContent: string) => {
    await pInitAndOpenDialog(editor, initialContent, cursorPos);
    fillActiveDialog(data, true);
    TinyUiActions.clickOnUi(editor, 'div[role="dialog"] button:contains("Save")');
    TinyAssertions.assertContent(editor, expectedContent);
  };

  const pCreateTestOnEmptyEditor = (editor: Editor, data: Partial<ImageDialogData>, expectedContent: string) =>
    pCreateTestOnContent(editor, data, { element: [ 0 ], offset: 0 }, '', expectedContent);

  const pTestUiStateDisabled = async (editor: Editor) => {
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    UiFinder.exists(SugarBody.body(), generalTabSelectors.alt + ':disabled');
    TinyUiActions.submitDialog(editor);
    UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]');
  };

  const pTestUiStateEnabled = async (editor: Editor, alt: string) => {
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    const altElem = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), generalTabSelectors.alt).getOrDie();
    const value = Value.get(altElem);
    assert.equal(value, alt, 'Assert input value');
    TinyUiActions.submitDialog(editor);
    UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]');
  };

  it('TBA: Check the decorative checkbox toggles the alt text input', async () => {
    const editor = hook.editor();
    await pInitAndOpenDialog(editor, '', { element: [ 0 ], offset: 0 });
    await UiFinder.pWaitForState('Check alt text input is enabled', SugarBody.body(), generalTabSelectors.alt, (e) => !Attribute.has(e, 'disabled'));
    TinyUiActions.clickOnUi(editor, generalTabSelectors.decorative);
    await UiFinder.pWaitForState('Check alt text input is disabled', SugarBody.body(), generalTabSelectors.alt, (e) => Attribute.has(e, 'disabled') && Attribute.get(e, 'disabled') === 'disabled');
    TinyUiActions.clickOnUi(editor, generalTabSelectors.decorative);
    await UiFinder.pWaitForState('Check alt text input is enabled', SugarBody.body(), generalTabSelectors.alt, (e) => !Attribute.has(e, 'disabled'));
    TinyUiActions.submitDialog(editor);
    UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]');
  });

  it('TINY-10903: Empty editor - alt input should be enabled - image with alt text', async () => {
    const editor = hook.editor();
    await pCreateTestOnEmptyEditor(
      editor,
      {
        alt: 'alt',
        src: {
          value: 'src'
        }
      },
      '<p><img src="src" alt="alt"></p>'
    );
    await pTestUiStateEnabled(editor, 'alt');
  });

  it('TINY-10903: Empty editor - alt input should be disabled - image without alt text and with role presentation', async () => {
    const editor = hook.editor();
    await pCreateTestOnEmptyEditor(
      editor,
      {
        alt: '',
        src: {
          value: 'src',
        },
        decorative: true
      },
      '<p><img role="presentation" src="src" alt=""></p>'
    );
    await pTestUiStateDisabled(editor);
  });

  it('TINY-10903: Empty editor - alt input should be disabled - Decorative image (should ignore alt text value)', async () => {
    const editor = hook.editor();
    await pCreateTestOnEmptyEditor(
      editor,
      {
        alt: 'alt',
        src: {
          value: 'src'
        },
        decorative: true
      },
      '<p><img role="presentation" src="src" alt=""></p>'
    );
    await pTestUiStateDisabled(editor);
  });

  it('TINY-10903: With content - alt input should be disabled - Image without role presentation and alt to decorative image', async () => {
    const editor = hook.editor();
    await pCreateTestOnContent(
      editor,
      {
        src: {
          value: 'src'
        },
        decorative: true
      },
      {
        start: { element: [ 0 ], offset: 0 },
        finish: { element: [ 0 ], offset: 1 }
      },
      '<p><img src="src" /></p>',
      '<p><img role="presentation" src="src" alt=""></p>'
    );
    await pTestUiStateDisabled(editor);
  });

  it('TINY-10903: With content - alt input should be disabled - Image without role presentation but empty alt text to decorative image', async () => {
    const editor = hook.editor();
    await pCreateTestOnContent(
      editor,
      {
        src: {
          value: 'src'
        },
        decorative: true
      },
      {
        start: { element: [ 0 ], offset: 0 },
        finish: { element: [ 0 ], offset: 1 }
      },
      '<p><img src="src" alt="" /></p>',
      '<p><img role="presentation" src="src" alt=""></p>'
    );
    await pTestUiStateDisabled(editor);
  });

  it('TINY-10903: With content - alt input be enabled - Decorative image with role and empty alt text to informative image', async () => {
    const editor = hook.editor();
    await pCreateTestOnContent(
      editor,
      {
        alt: 'alt',
        src: {
          value: 'src'
        },
        decorative: false
      },
      {
        start: { element: [ 0 ], offset: 0 },
        finish: { element: [ 0 ], offset: 1 }
      },
      '<p><img role="presentation" src="src" alt="" /></p>',
      '<p><img src="src" alt="alt"></p>'
    );
    await pTestUiStateEnabled(editor, 'alt');
  });

  it('TINY-10903: With content - alt input should be disabled - Decorative image with role and without alt attribute to decorative image', async () => {
    const editor = hook.editor();
    await pCreateTestOnContent(
      editor,
      {
        alt: 'alt',
        src: {
          value: 'src'
        },
        decorative: true
      },
      {
        start: { element: [ 0 ], offset: 0 },
        finish: { element: [ 0 ], offset: 1 }
      },
      '<p><img role="presentation" src="src" /></p>',
      '<p><img role="presentation" src="src" alt=""></p>'
    );
    await pTestUiStateDisabled(editor);
  });

  it('TINY-10903: With content - alt input should be disabled - Decorative image with role and null alt text to informative image', async () => {
    const editor = hook.editor();
    await pCreateTestOnContent(
      editor,
      {
        src: {
          value: 'src'
        },
        decorative: true
      },
      {
        start: { element: [ 0 ], offset: 0 },
        finish: { element: [ 0 ], offset: 1 }
      },
      '<p><img role="presentation" src="src" /></p>',
      '<p><img role="presentation" src="src" alt=""></p>'
    );
    await pTestUiStateDisabled(editor);
  });

  it('TINY-10903: Informative image to decorative image', async () => {
    const editor = hook.editor();
    await pCreateTestOnContent(
      editor,
      {
        alt: 'alt',
        src: {
          value: 'src'
        },
        decorative: true
      },
      {
        start: { element: [ 0 ], offset: 0 },
        finish: { element: [ 0 ], offset: 1 }
      },
      '<p><img src="src" alt="alt" /></p>',
      '<p><img role="presentation" src="src" alt=""></p>'
    );
    await pTestUiStateDisabled(editor);
  });
});
