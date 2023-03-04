import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Class, Css, Insert, Remove, SugarBody, SugarElement, Traverse } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.SilverPopupSinkBoundsTest', () => {
  const numItems = 100;
  const sharedSettings = {
    toolbar: 'undo bold',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      // Define lots and lots and lots of menu items
      Arr.range(numItems, (x) => {
        editor.ui.registry.addMenuItem(
          `menu-item-${x}`,
          {
            type: 'menuitem',
            text: `Item ${x}`
          }
        );
      });
    },
    menubar: 'custom',
    menu: {
      custom: {
        title: 'Custom menu',
        items: Arr.range(numItems, (x) => `menu-item-${x}`).join(' ')
      }
    },
  };

  // These tests are going to create editor inside another divs, so that we can
  // test whether the sinks are being put in the correct place.
  const setupElement = (inline: boolean) => {

    const scrollingContainer = SugarElement.fromTag('div');
    Class.add(scrollingContainer, 'test-scrolling-viewport');
    Css.set(scrollingContainer, 'overflow', 'scroll');
    Css.set(scrollingContainer, 'height', '300px');

    const banner = SugarElement.fromTag('div');
    Css.setAll(banner, {
      'width': '100%',
      'height': '150px',
      'background-color': 'purple'
    });

    const target = inline ? SugarElement.fromTag('div') : SugarElement.fromTag('textarea');

    Insert.append(scrollingContainer, banner);
    Insert.append(scrollingContainer, target);

    // The Loader is going to try to insert `target` into the body if it isn't already in the body,
    // so we insert grandparent here.
    Insert.append(SugarBody.body(), scrollingContainer);

    // We remove the outer most div, not just the target element
    const teardown = () => {
      Remove.remove(scrollingContainer);
    };

    return {
      element: target,
      teardown
    };
  };

  const pOpenAndMeasureMenu = async (editor: Editor): Promise<DOMRect> => {
    TinyUiActions.clickOnMenu(editor, 'span:contains("Custom")');

    const menu = await TinyUiActions.pWaitForUi(editor, '[role=menu]');
    return menu.dom.getBoundingClientRect();
  };

  const measureWrapper = (editor: Editor): DOMRect => {
    const wrapper = Traverse.parent(
      SugarElement.fromDom(editor.targetElm)
    ).getOrDie('Could not find the wrapper') as SugarElement<HTMLElement>;
    return wrapper.dom.getBoundingClientRect();
  };

  context('ui_mode: combined', () => {
    const hook = TinyHooks.bddSetupFromElement<Editor>(
      {
        ...sharedSettings,
        ui_mode: 'combined'
      },
      () => setupElement(false),
      []
    );

    it('TINY-9226: popup just needs to be inside window', async () => {
      const editor = hook.editor();
      assert.isFalse(editor.isHidden());

      const marginOfError = 5;

      const menuRect = await pOpenAndMeasureMenu(editor);
      const wrapperRect = measureWrapper(editor);
      // Compare the menu to the window
      assert.isAbove(menuRect.top, -marginOfError, 'Menu should not appear above window');
      assert.isBelow(menuRect.bottom, window.innerHeight, 'Menu should not below window');

      // Compare the menu to the wrapper
      assert.isAbove(menuRect.bottom, wrapperRect.bottom, 'Menu should extend outside wrapper');
    });
  });

  context('ui_mode: split', () => {
    const hook = TinyHooks.bddSetupFromElement<Editor>(
      {
        ...sharedSettings,
        ui_mode: 'split'
      },
      () => setupElement(false),
      []
    );

    it('TINY-9226: popup needs to be inside scrolling container', async () => {
      const editor = hook.editor();
      assert.isFalse(editor.isHidden());

      const marginOfError = 5;
      const menuRect = await pOpenAndMeasureMenu(editor);
      const wrapperRect = measureWrapper(editor);

      // Compare the menu to the scrolling container
      assert.isAbove(menuRect.top, wrapperRect.top - marginOfError, 'Menu should not appear above scrolling container');
      assert.isBelow(menuRect.bottom, wrapperRect.bottom + marginOfError, 'Menu should not below scrolling container');
    });
  });
});
