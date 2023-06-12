import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Menu } from '@ephox/bridge';
import { Arr, Fun } from '@ephox/katamari';
import { Class, Css, Insert, Remove, SugarBody, SugarElement, SugarShadowDom, Traverse } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface Scenario {
  readonly label: string;
  readonly getRect: (rect: DOMRect) => {
    readonly clientX: number;
    readonly clientY: number;
  };
}

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
    const marginOfError = 5;

    context('DOM', () => {
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

        const menuRect = await pOpenAndMeasureMenu(editor);
        const wrapperRect = measureWrapper(editor);

        // Compare the menu to the scrolling container
        assert.isAbove(menuRect.top, wrapperRect.top - marginOfError, 'Menu should not appear above scrolling container');
        assert.isBelow(menuRect.bottom, wrapperRect.bottom + marginOfError, 'Menu should not below scrolling container');
      });
    });

    context('ShadowDOM', () => {
      const nestedLevel = 15;

      const setupRoot = (shadowParent: SugarElement<HTMLElement>): SugarElement<HTMLElement | ShadowRoot> => {
        const shadowHost = SugarElement.fromTag('div', document);
        Class.add(shadowHost, 'test-shadow-root');
        Insert.append(shadowParent, shadowHost);
        return SugarElement.fromDom(shadowHost.dom.attachShadow({ mode: 'open' }));
      };

      const setupSingleScrollerElement = (shadow: string) => {
        const scroller = SugarElement.fromTag('div');
        Css.setAll(scroller, {
          overflow: 'auto',
          height: '500px',
          margin: '0px 200px', // 200px to make sure the bounds are not calculated from the viewport
          outline: '3px solid brown'
        });
        Class.add(scroller, 'scrolling-wrapper');

        const target = SugarElement.fromTag('textarea');
        let root = setupRoot(scroller);

        if (shadow === 'outside') {
          // The scroller is being outside of the ShadowRoot
          const root = setupRoot(scroller);
          Insert.append(
            root,
            target
          );
          Insert.append(SugarBody.body(), scroller);
        } else {
          // The scroller is being appended to the ShadowRoot
          root = setupRoot(SugarBody.body());
          Insert.append(scroller, target);
          Insert.append(root, scroller);
        }

        return {
          element: target,
          teardown: () => {
            Remove.remove(scroller);
            Remove.remove(root);
          }
        };
      };

      const contextMenuClick = (editor: Editor, clientX: number, clientY: number) => {
        const element = editor.getContentAreaContainer();
        const target = element as EventTarget;
        editor.dispatch('mousedown', { target, clientX, clientY, button: 2 } as MouseEvent);
        editor.dispatch('mouseup', { target, clientX, clientY, button: 2 } as MouseEvent);
        editor.dispatch('contextmenu', { target, clientX, clientY, button: 2 } as PointerEvent);
      };

      const pOpenAndMeasureContextMenu = async (editor: Editor, clientX: number, clientY: number): Promise<DOMRect> => {
        contextMenuClick(editor, clientX, clientY);
        const menu = await TinyUiActions.pWaitForUi(editor, '[role=menu]');
        return menu.dom.getBoundingClientRect();
      };

      const pCloseContextMenu = async (editor: Editor) => {
        Mouse.click(TinyDom.body(editor), { dx: 0, dy: 0 });
        await Waiter.pTryUntil('Close context menu', () => UiFinder.notExists(SugarBody.body(), 'div[role="menu"]'));
      };

      const assertMenuWithinWrapperBounds = (menuRect: DOMRect, wrapperRect: DOMRect, label: string = 'Context Menu') => {
        assert.isAbove(menuRect.top, wrapperRect.top - marginOfError, `${label} should not appear above scrolling container`);
        assert.isBelow(menuRect.bottom, wrapperRect.bottom + marginOfError, `${label} should not appear below of scrolling container`);
        assert.isBelow(menuRect.right, wrapperRect.right + marginOfError, `${label} should not appear beyond east of scrolling container`);
        assert.isAbove(menuRect.left, wrapperRect.left + marginOfError, `${label} should not appear beyond west of scrolling container`);
      };

      const pOpenAndMeasureMenu = async (editor: Editor): Promise<DOMRect[]> => {
        TinyUiActions.clickOnMenu(editor, 'button:contains("Custom menu")');
        await TinyUiActions.pWaitForUi(editor, '[role=menu]');

        Arr.range(nestedLevel, async (x) => {
          TinyUiActions.clickOnUi(editor, `[role="menu"] div[title="Nested Item ${x}"]`);
          await TinyUiActions.pWaitForUi(editor, `[role="menu"] div[title="Nested Item ${x}"]`);
        });

        const shadowHost = UiFinder.findIn(SugarBody.body(), '.test-shadow-root').getOrDie();
        const menuRects = Arr.from(shadowHost.dom.shadowRoot?.querySelectorAll('[role=menu]') || []).map((x) => x.getBoundingClientRect());

        return menuRects;
      };

      const contextMenuScenarios: Scenario[] = [
        {
          label: 'top right',
          getRect: (rect) => {
            return { clientX: rect.right - 200, clientY: 0 };
          }
        },
        {
          label: 'top left',
          getRect: (_) => {
            return { clientX: 5, clientY: 0 };
          }
        },
        {
          label: 'bottom right',
          getRect: (rect) => {
            return { clientX: rect.right - 200, clientY: rect.bottom };
          }
        },
        {
          label: 'bottom left',
          getRect: (rect) => {
            return { clientX: 5, clientY: rect.bottom };
          }
        },
      ];

      Arr.from([ 'inside', 'outside' ]).map((shadow: string) => {
        context('ShadowDOM ' + shadow, () => {
          const hook = TinyHooks.bddSetupFromElement<Editor>(
            {
              ...sharedSettings,
              ui_mode: 'split',
              contextmenu: 'custom-context-menu',
              height: 2000,
              menu: {
                custom: {
                  title: 'Custom menu',
                  items: 'menu-item-0'
                }
              },
              setup: (editor: Editor) => {
                editor.ui.registry.addMenuItem('custom-context-menu', {
                  icon: 'link',
                  text: 'Custom context menu',
                  onAction: Fun.noop
                });

                editor.ui.registry.addContextMenu('custom-context-menu', {
                  update: Fun.constant('custom-context-menu')
                });

                const generateNestedMenuItems = (depth: number = 1): Menu.MenuItemSpec[] | Menu.NestedMenuItemSpec[] => {
                  if (depth === nestedLevel) {
                    return [{
                      type: 'menuitem',
                      text: `Nested Item ${depth}`,
                    }];
                  }

                  return [{
                    type: 'nestedmenuitem',
                    text: `Nested Item ${depth}`,
                    getSubmenuItems: () => generateNestedMenuItems(depth + 1),
                  }];
                };

                editor.ui.registry.addNestedMenuItem(`menu-item-0`, {
                  text: `Nested Item 0`,
                  getSubmenuItems: () => generateNestedMenuItems()
                });
              },
            },
            () => setupSingleScrollerElement(shadow)
          );

          Arr.each(contextMenuScenarios, (scenario) => {
            it(`TINY-9743: Context Menu to be within scrollable container - position: ${scenario.label}`, async () => {
              const editor = hook.editor();

              const containerRect = editor.getContentAreaContainer().getBoundingClientRect();
              const { clientX, clientY } = scenario.getRect(containerRect);
              const contextMenuRect = await pOpenAndMeasureContextMenu(editor, clientX, clientY );

              const wrapper = SugarShadowDom.getShadowRoot(SugarElement.fromDom(editor.targetElm)).map(SugarShadowDom.getShadowHost).getOrDie();
              const wrapperRect = wrapper.dom.getBoundingClientRect();

              assertMenuWithinWrapperBounds(contextMenuRect, wrapperRect);
              await pCloseContextMenu(editor);
            });
          });

          it('TINY-9743: Menu to be within scrollable container', async () => {
            const editor = hook.editor();

            const menuRects = await pOpenAndMeasureMenu(editor);

            const wrapper = SugarShadowDom.getShadowRoot(SugarElement.fromDom(editor.targetElm)).map(SugarShadowDom.getShadowHost).getOrDie();
            const wrapperRect = wrapper.dom.getBoundingClientRect();

            Arr.each(menuRects, (menuRect, index) => {
              assertMenuWithinWrapperBounds(menuRect, wrapperRect, `Nested Menu Item ${index}`);
            });
          });
        });
      });
    });
  });
});
