import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as ButtonClasses from 'tinymce/themes/silver/ui/toolbar/button/ButtonClasses';

describe('browser.tinymce.themes.silver.editor.SilverDialogDraggedTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('init', () => {
        ed.windowManager.open( {
          title: 'Silver Test Modal Dialog',
          body: {
            type: 'panel',
            items: []
          },
          buttons: [
            {
              type: 'menu',
              name: 'menuButton',
              icon: 'preferences',
              tooltip: 'Dialog Menu Button',
              items: [
                {
                  type: 'togglemenuitem',
                  name: 'option1',
                }, {
                  type: 'togglemenuitem',
                  name: 'option2',
                }
              ]
            },
          ],
          initialData: {
            option1: true,
            option2: false,
          },
        }, { inline: 'toolbar' });
      });
    }
  }, []);

  const dragDialog = (dx: number, dy: number) => {
    const draghandle = UiFinder.findIn(SugarBody.body(), '.tox-dialog__draghandle').getOrDie();
    Mouse.mouseDown(draghandle);
    Mouse.mouseMoveTo(draghandle, dx, dy);
    Mouse.mouseUp(draghandle);
  };

  const openMenuButton = (container: SugarElement): SugarElement => {
    const menuButtonSelector = '.' + ButtonClasses.ToolbarButtonClasses.MatchWidth;
    const menuButton = UiFinder.findIn(container, menuButtonSelector).getOrDie();
    Mouse.click(menuButton);
    assert.equal(menuButton.dom.getAttribute('aria-expanded'), 'true');

    return menuButton;
  };

  it('', async () => {
    hook.editor();
    const dialog = UiFinder.findIn(SugarBody.body(), '[role="dialog"]').getOrDie();
    const menuButton = openMenuButton(dialog);

    dragDialog(10, 10);

    await Waiter.pTryUntil(
      'Waiting for menu to close after dialog was dragged',
      () => assert.equal(menuButton.dom.getAttribute('aria-expanded'), 'false')
    );
  });
});
