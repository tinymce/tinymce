import { FocusTools, Keys, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it, TestLabel } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { SelectorExists, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.DialogPopupsTest', () => {
  before(function () {
    // NOTE: This test uses the caretRangeFromPoint API which is not supported on every browser. We are
    // using this API to check if the popups appearing from things like the color input button and
    // the urlinput are on top of the dialog. Just test in Chrome.
    if (!PlatformDetection.detect().browser.isChrome()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'show-color show-urlinput',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('show-color', {
        text: 'Show Color Dialog',
        onAction: () => ed.windowManager.open({
          title: 'Dialog Test',
          body: {
            type: 'panel',
            items: [
              {
                name: 'col1',
                type: 'colorinput'
              }
            ]
          },
          initialData: {
            col1: 'green'
          },
          buttons: [ ]
        })
      });

      ed.ui.registry.addButton('show-urlinput', {
        text: 'Show Urlinput Dialog',
        onAction: () => ed.windowManager.open({
          title: 'Dialog Test',
          body: {
            type: 'panel',
            items: [
              {
                name: 'url1',
                type: 'urlinput',
                filetype: 'file'
              }
            ]
          },
          initialData: {
            url1: { value: '' }
          },
          buttons: [ ]
        })
      });
    }
  }, [ Theme ], true);

  const pWaitForDialogClosed = () => Waiter.pTryUntil(
    'Waiting for dialog to close',
    () => UiFinder.notExists(SugarBody.body(), '.tox-dialog')
  );

  const assertVisibleFocusInside = (getFocused: (doc: SugarElement<Document>) => Result<SugarElement<HTMLElement>, TestLabel>, selector: string) => {
    const elem = getFocused(SugarDocument.getDocument()).getOrDie();
    const rect = elem.dom.getBoundingClientRect();
    const middle = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const range = document.caretRangeFromPoint(middle.x, middle.y);
    if (!range) {
      throw new Error('Could not find a range at coordinate: (' + middle.x + ', ' + middle.y + ')');
    } else if (!SelectorExists.closest(SugarElement.fromDom(range.startContainer), selector)) {
      throw new Error('Range was not within: "' + selector + '". Are you sure that it is on top of the dialog?');
    } else {
      return rect;
    }
  };

  it('TBA: Trigger the colorswatch and check that the swatch appears in front of the dialog', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();
    TinyUiActions.clickOnToolbar(editor, 'button:contains("Show Color Dialog")');
    await FocusTools.pTryOnSelector('Focus should be on colorinput', doc, 'input');
    TinyUiActions.keydown(editor, Keys.tab());
    await FocusTools.pTryOnSelector('Focus should be on colorinput button', doc, 'span[aria-haspopup="true"]');
    TinyUiActions.keydown(editor, Keys.enter());
    await FocusTools.pTryOnSelector('Focus should be inside colorpicker', doc, '.tox-swatch');
    assertVisibleFocusInside(FocusTools.getFocused, '.tox-swatches');
    TinyUiActions.keydown(editor, Keys.escape());
    await FocusTools.pTryOnSelector('Focus should return to colorinput button', doc, 'span[aria-haspopup="true"]');
    TinyUiActions.keydown(editor, Keys.escape());
    await pWaitForDialogClosed();
  });

  it('TBA: Trigger the urlinput and check that the dropdown appears in front of the dialog', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://foo">Foo</a> <a href="http://goo">Goo</a></p>');
    TinyUiActions.clickOnToolbar(editor, 'button:contains("Show Urlinput Dialog")');
    await FocusTools.pTryOnSelector('Focus should be on urlinput', SugarDocument.getDocument(), 'input');
    TinyUiActions.keydown(editor, Keys.down());
    await UiFinder.pWaitForVisible('Waiting for menu to appear', SugarBody.body(), '.tox-collection__item');
    assertVisibleFocusInside(() => UiFinder.findIn(SugarBody.body(), '.tox-collection__item--active'), '.tox-menu');
    TinyUiActions.keydown(editor, Keys.escape());
    TinyUiActions.keydown(editor, Keys.escape());
    await pWaitForDialogClosed();
  });
});
