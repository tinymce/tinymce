import { Cursors, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarBody, SugarElement, Value } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { fillActiveDialog, generalTabLabels, ImageDialogData } from '../module/Helpers';

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
    UiFinder.findTargetByLabel(SugarBody.body(), generalTabLabels.alt)
      .exists((e) => Attribute.has(e, 'disabled') && Attribute.get(e, 'disabled') === 'disabled');
    TinyUiActions.submitDialog(editor);
    UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]');
  };

  const pTestUiStateEnabled = async (editor: Editor, alt: string) => {
    editor.execCommand('mceImage');
    await TinyUiActions.pWaitForDialog(editor);
    const altElem = UiFinder.findTargetByLabel<HTMLInputElement>(SugarBody.body(), generalTabLabels.alt).getOrDie();
    const value = Value.get(altElem);
    assert.equal(value, alt, 'Assert input value');
    TinyUiActions.submitDialog(editor);
    UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]');
  };

  const pWaitForInputState = async (waiterLabel: string, labelText: string, predicate: (input: SugarElement<Element>) => boolean) =>
    await Waiter.pTryUntilPredicate(waiterLabel, () => UiFinder.findTargetByLabel(SugarBody.body(), labelText).exists(predicate));

  it('TBA: Check the decorative checkbox toggles the alt text input', async () => {
    const editor = hook.editor();
    await pInitAndOpenDialog(editor, '', { element: [ 0 ], offset: 0 });
    await pWaitForInputState('Check alt text input is enabled', generalTabLabels.alt, (e) => !Attribute.has(e, 'disabled'));
    Mouse.clickByLabel(SugarBody.body(), generalTabLabels.decorative);
    await pWaitForInputState('Check alt text input is disabled', generalTabLabels.alt, (e) => Attribute.has(e, 'disabled') && Attribute.get(e, 'disabled') === 'disabled');
    Mouse.clickByLabel(SugarBody.body(), generalTabLabels.decorative);
    await pWaitForInputState('Check alt text input is enabled', generalTabLabels.alt, (e) => !Attribute.has(e, 'disabled'));
    TinyUiActions.submitDialog(editor);
    UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]');
  });

  it('FOAM-11: Image with alt text', async () => {
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

  it('FOAM-11: Decorative image', async () => {
    const editor = hook.editor();
    await pCreateTestOnEmptyEditor(
      editor,
      {
        src: {
          value: 'src'
        },
        decorative: true
      },
      '<p><img role="presentation" src="src" alt=""></p>'
    );
    await pTestUiStateDisabled(editor);
  });

  it('FOAM-11: Decorative image (should ignore alt text value)', async () => {
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

  it('FOAM-11: Decorative image to informative image', async () => {
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

  it('FOAM-11: Informative image to decorative image', async () => {
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
