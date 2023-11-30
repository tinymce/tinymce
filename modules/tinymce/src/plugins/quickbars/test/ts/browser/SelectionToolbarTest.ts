import { ApproxStructure, Assertions, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import PageBreakPlugin from 'tinymce/plugins/pagebreak/Plugin';
import QuickbarsPlugin from 'tinymce/plugins/quickbars/Plugin';

enum Alignment {
  Left = 'left',
  Right = 'right',
  Center = 'center'
}

describe('browser.tinymce.plugins.quickbars.SelectionToolbarTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'quickbars link pagebreak',
    inline: true,
    toolbar: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ LinkPlugin, QuickbarsPlugin, PageBreakPlugin ], true);

  const imgSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  const pAssertButtonToggledState = (name: string, state: boolean) =>
    Waiter.pTryUntil('Wait for toolbar button state', () => {
      const button = UiFinder.findIn(SugarBody.body(), `.tox-toolbar button[aria-label="${name}"]`).getOrDie();
      return Assertions.assertStructure('', ApproxStructure.build((s, _str, arr) => s.element('button', {
        classes: [ state ? arr.has('tox-tbtn--enabled') : arr.not('tox-tbtn--enabled') ]
      })), button);
    });

  const pWaitForTextToolbarAndAssertState = async (bold: boolean, italic: boolean, heading2: boolean, heading3: boolean, link: boolean, blockquote: boolean) => {
    await pAssertButtonToggledState('Bold', bold);
    await pAssertButtonToggledState('Italic', italic);
    await pAssertButtonToggledState('Link', link);
    await pAssertButtonToggledState('Heading 2', heading2);
    await pAssertButtonToggledState('Heading 3', heading3);
    await pAssertButtonToggledState('Blockquote', blockquote);
  };

  const pSetImageAndAssertToolbarState = async (editor: Editor, useFigure: boolean, alignment?: Alignment) => {
    let attrs: string;
    let imageHtml: string;
    if (alignment === undefined) {
      attrs = useFigure ? 'class="image"' : '';
    } else if (alignment === Alignment.Center) {
      attrs = useFigure ? `class="image align-${alignment}"` : 'style="margin-left: auto; margin-right: auto; display: block;"';
    } else {
      attrs = useFigure ? `class="image align-${alignment}"` : `style="float: ${alignment};"`;
    }

    if (useFigure) {
      imageHtml = `<figure ${attrs} contenteditable="false"><img src="${imgSrc}"><figcaption contenteditable="true">Caption</figcaption></figure>`;
    } else {
      imageHtml = `<p><img src="${imgSrc}" ${attrs}></p>`;
    }

    editor.setContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p>' + imageHtml);
    TinySelections.select(editor, useFigure ? 'figure' : 'img', []);
    // A short wait to ensure the button state has been updated before running assertions
    await Waiter.pWait(50);
    await pAssertButtonToggledState('Align left', alignment === Alignment.Left);
    await pAssertButtonToggledState('Align center', alignment === Alignment.Center);
    await pAssertButtonToggledState('Align right', alignment === Alignment.Right);
  };

  it('TBA: Text selection toolbar', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Some <strong>bold</strong> and <em>italic</em> content.</p><blockquote><p>Some quoted content</p></blockquote>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    await pWaitForTextToolbarAndAssertState(false, false, false, false, false, false);
    TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 3);
    await pWaitForTextToolbarAndAssertState(true, false, false, false, false, false);
    TinySelections.setSelection(editor, [ 0, 3, 0 ], 1, [ 0, 3, 0 ], 4);
    await pWaitForTextToolbarAndAssertState(false, true, false, false, false, false);
    TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 1);
    await pWaitForTextToolbarAndAssertState(false, false, false, false, false, true);
  });

  it('TBA: Image selection toolbar', async () => {
    const editor = hook.editor();
    await pSetImageAndAssertToolbarState(editor, false);
    await pSetImageAndAssertToolbarState(editor, false, Alignment.Left);
    await pSetImageAndAssertToolbarState(editor, false, Alignment.Center);
    await pSetImageAndAssertToolbarState(editor, false, Alignment.Right);
    await pSetImageAndAssertToolbarState(editor, true);
    await pSetImageAndAssertToolbarState(editor, true, Alignment.Left);
    await pSetImageAndAssertToolbarState(editor, true, Alignment.Center);
    await pSetImageAndAssertToolbarState(editor, true, Alignment.Right);
  });

  it('TINY-10054: Pagebreak should not toggle toolbar', async () => {
    const editor = hook.editor();
    editor.setContent('<!-- pagebreak -->');
    TinySelections.select(editor, 'img', []);
    await Waiter.pWait(50); // Give the toolbar a chance to appear. If not present this test will pass even when it shouldn't.
    await Waiter.pTryUntil('Wait for toolbar button state', () => {
      UiFinder.notExists(SugarBody.body(), `.tox-toolbar button[aria-label="Align left"]`);
    });
  });
});
