import { ApproxStructure, Assertions, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Class, Css, Insert, InsertAll, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface TestUi {
  className: string;
  selector: string;
}

describe('browser.tinymce.themes.silver.editor.scrolling.EditorInScrollingContainerTest', () => {
  const sharedSettings = {
    menubar: 'file',
    toolbar: 'undo bold',
    base_url: '/project/tinymce/js/tinymce'
  };

  // look for .tox-editor-header

  const fromClass = (className: string): TestUi => ({
    className,
    selector: `.${className}`
  });

  const ui = {
    other: {
      scrollingWrapper: fromClass('scrolling-wrapper'),
    },
    editor: {
      stickyHeader: fromClass('tox-editor-header'),
      menuButton: fromClass('tox-mbtn'),
      menu: {
        className: 'tox-menu',
        selector: '[role=menu]'
      },
      menubar: {
        className: 'tox-menubar',
        selector: '[role=menubar]'
      }
    }
  };

  const getOtherUi = (editor: Editor, testUi: TestUi) => {
    return SelectorFind.ancestor<HTMLElement>(TinyDom.container(editor), testUi.selector).getOrDie(
      `Could not find selector: ${testUi.selector}`
    );
  };

  const getEditorUi = (editor: Editor, testUi: TestUi) => {
    return SelectorFind.descendant<HTMLElement>(TinyDom.container(editor), testUi.selector).getOrDie(
      `Could not find selector: ${testUi.selector}`
    );
  };

  context('Classic editor', () => {
    const setupElement = () => {
      const scroller = SugarElement.fromTag('div');
      Css.set(scroller, 'overflow', 'auto');
      Css.set(scroller, 'height', '500px');
      Css.set(scroller, 'margin', '0em 2em 2000px 2em');
      Css.set(scroller, 'outline', '3px solid brown');
      Class.add(scroller, ui.other.scrollingWrapper.className);

      const banner = SugarElement.fromHtml('<div style="height: 200px; background-color: orange;" />');

      const target = SugarElement.fromTag('textarea');
      InsertAll.append(
        scroller,
        [
          banner,
          target
        ]
      );

      Insert.append(SugarBody.body(), scroller);

      return {
        element: target,
        teardown: () => {
          Remove.remove(scroller);
        }
      };
    };

    const hook = TinyHooks.bddSetupFromElement<Editor>(
      {
        ...sharedSettings,
        ui_of_tomorrow: true,
        toolbar_sticky: true,
        height: 2000
      },
      () => setupElement(),
      []
    );

    context('No disconnect between menubar and menu', () => {
      // We can compare their positions.
      const pAssertMenuBelowMenubar = async (editor: Editor) => {
        const menu = await TinyUiActions.pWaitForPopup(editor, ui.editor.menu.selector);

        const menubar = await TinyUiActions.pWaitForUi(editor, ui.editor.menubar.selector);
        const menubarBottom = menubar.dom.getBoundingClientRect().bottom;
        const menuTop = menu.dom.getBoundingClientRect().top;
        assert.isTrue(
          Math.abs(menubarBottom - menuTop) < 10,
          'Menu and menubar should stay in sync'
        );
      };

      const pRunTestWithAdjustment = async (editor: Editor, adjustScrollPosition: () => void): Promise<void> => {
        const header = getEditorUi(editor, ui.editor.stickyHeader);
        // It should not be fixed yet.
        assert.isTrue(Css.getRaw(header, 'position').isNone(), 'We have not yet docked the sticky toolbar');

        // Open the menu
        TinyUiActions.clickOnMenu(editor, `${ui.editor.menuButton.selector}:contains("File")`);
        await pAssertMenuBelowMenubar(editor);

        adjustScrollPosition();
        await pAssertMenuBelowMenubar(editor);

        // Close the menu
        TinyUiActions.clickOnMenu(editor, `${ui.editor.menuButton.selector}:contains("File")`);
        await Waiter.pWait(1);
      };

      it('When scrolling the outer page', async () => {
        await pRunTestWithAdjustment(
          hook.editor(),
          () => {
            window.scrollTo(0, 200);
          }
        );
      });

      it('When scrolling the scroller', async () => {
        const editor = hook.editor();
        const scroller = getOtherUi(editor, ui.other.scrollingWrapper);
        await pRunTestWithAdjustment(
          editor,
          () => {
            scroller.dom.scrollTop = 150;
          }
        );
      });

      it('When scrolling the editor itself', async () => {
        const editor = hook.editor();
        const paragraphs = Arr.range(100, (x) => `<p>This is line #${x}</p>`).join('\n');
        editor.setContent(paragraphs);
        await pRunTestWithAdjustment(
          editor,
          () => {
            editor.getWin().scrollTo(0, 500);
          }
        );
      });
    });

    context('Testing stickiness', () => {

      beforeEach(() => {
        const editor = hook.editor();
        const scroller = getOtherUi(editor, ui.other.scrollingWrapper);
        window.scrollTo(0, 0);
        scroller.dom.scrollTo(0, 0);
      });

      it('When scrolling the outer page', async () => {
        const editor = hook.editor();
        const header = getEditorUi(editor, ui.editor.stickyHeader);
        const headerTop = header.dom.getBoundingClientRect().top;
        window.scrollTo(0, headerTop - 10);

        // It should not be docked yet.
        assert.isTrue(Css.getRaw(header, 'position').isNone(), 'We have not yet docked the sticky toolbar');

        // Scroll a bit further, and it should dock.
        await Waiter.pWait(1000);
        window.scrollTo(0, headerTop + 30);
        await Waiter.pTryUntil(
          'Waiting for sticky toolbar to dock',
          () => {
            Assertions.assertStructure(
              'Toolbar should dock to the top',
              ApproxStructure.build((s, str, arr) => s.element('div', {
                classes: [ arr.has(ui.editor.stickyHeader.className) ],
                styles: {
                  position: str.is('fixed'),
                  top: str.is('0px')
                }
              })),
              header
            );
          }
        );

        // Scroll back a bit and watch it undock.
        window.scrollTo(0, headerTop - 30);
        await Waiter.pTryUntil(
          'Waiting for sticky toolbar to undock',
          () => {
            Assertions.assertStructure(
              'Toolbar should undock',
              ApproxStructure.build((s, str, arr) => s.element('div', {
                classes: [ arr.has(ui.editor.stickyHeader.className) ],
                styles: {
                  position: str.none()
                }
              })),
              header
            );
          }
        );
        assert.isTrue(
          Math.abs(header.dom.getBoundingClientRect().top - 30) < 4,
          'Toolbar should be about 30 pixels from the top'
        );
      });

      it.only('When scrolling the scroller', async () => {
        // Remember, that the editor is about 200px down the scroller.
        const editor = hook.editor();
        const header = getEditorUi(editor, ui.editor.stickyHeader);
        const scroller = getOtherUi(editor, ui.other.scrollingWrapper);

        scroller.dom.scrollTo(0, 200 - 10);
        // It should not be docked yet.
        assert.isTrue(Css.getRaw(header, 'position').isNone(), 'We have not yet docked the sticky toolbar');

        // Now scroll further, and it should dock
        const scrollerTop = scroller.dom.getBoundingClientRect().top;
        // 22 was chosen, because it is far enough down the header that it's obvious that it's been
        // cut-off if docking isn't working (visually).
        scroller.dom.scrollTo(0, 200 + 22);
        await Waiter.pTryUntil(
          'Waiting for sticky toolbar to dock',
          () => {
            assert.equal(
              'fixed',
              Css.getRaw(header, 'position').getOr('-'),
              'Toolbar should dock'
            );
          }
        );

        assert.isTrue(
          Math.abs(header.dom.getBoundingClientRect().top - scrollerTop) < 5,
          'Top position should be pretty much at scroller top position'
        );

        // Now scroll back a bit.
        scroller.dom.scrollTo(0, 200 - 5);
        await Waiter.pTryUntil(
          'Waiting for sticky toolbar to undock',
          () => {
            assert.isTrue(
              Css.getRaw(header, 'position').isNone(),
              'Toolbar should undock'
            );
          }
        );
      });

      it('When scrolling the outer page and the scroller', async () => {
        // HERE
        await Waiter.pWait(1);
      });
    });
  });

  context('Nested stuff', () => Fun.noop);
});
