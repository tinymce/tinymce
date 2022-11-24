import { ApproxStructure, Assertions, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
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

  const fromClass = (className: string): TestUi => ({
    className,
    selector: `.${className}`
  });

  const ui = {
    other: {
      scrollingWrapper: fromClass('scrolling-wrapper'),
      outerScroller: fromClass('outer-scroller')
    },
    editor: {
      stickyHeader: fromClass('tox-editor-header'),
      stickyHeaderVisible: fromClass('tox-editor-dock-fadein'),
      stickyHeaderInvisible: fromClass('tox-editor-dock-fadeout'),
      stickyHeaderTransitioning: fromClass('tox-editor-dock-transition'),
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

  const heights = {
    banner: 200,
    scroller: 500,
    outerScroller: 200,
    editor: 2000
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

  const resetScrolls = (editor: Editor) => {
    const scroller = getOtherUi(editor, ui.other.scrollingWrapper);
    window.scrollTo(0, 0);
    scroller.dom.scrollTo(0, 0);
    editor.getWin().scrollTo(0, 0);
  };

  const assertApprox = (label: string, value1: number, value2: number, marginOfError: number): void => {
    assert.isTrue(
      Math.abs(value1 - value2) <= marginOfError,
      `${label}.
        Value1: ${value1}\n
        Value2: ${value2}\n
        Error Margin: ${marginOfError}`
    );
  };

  context('Classic editor', () => {
    const pWaitUntilUndocked = (header: SugarElement<HTMLElement>): Promise<void> => Waiter.pTryUntil(
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

    const pWaitUntilDockedAtTop = (header: SugarElement<HTMLElement>, optTop: Optional<number>): Promise<void> => Waiter.pTryUntil(
      'Waiting for sticky toolbar to dock',
      () => {
        Assertions.assertStructure(
          'Toolbar should dock to the top',
          ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [ arr.has(ui.editor.stickyHeader.className) ],
            styles: {
              position: str.is('fixed'),
              ...(optTop.map((top) => ({ top: str.is(`${top}px`) })).getOr({ }))
            }
          })),
          header
        );
      }
    );

    const pWaitUntilAppears = (header: SugarElement<HTMLElement>): Promise<void> => Waiter.pTryUntil(
      'Waiting for sticky toolbar to appear',
      () => {
        Assertions.assertStructure(
          'Sticky toolbar should appear',
          ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [
              // The first time it appears, it doesn't get fade-in, so we just look for non-fadeout
              // for now.
              arr.not(ui.editor.stickyHeaderInvisible.className),
              // BUG: In classic mode, the transition class isn't going away because
              // there is another transition style clobbering it.
              // arr.not(ui.editor.stickyHeaderTransitioning.className)
            ]
          })),
          header
        );
      }
    );

    const pWaitUntilDisappears = (header: SugarElement<HTMLElement>): Promise<void> => Waiter.pTryUntil(
      'Waiting for sticky toolbar to disappear',
      () => {
        Assertions.assertStructure(
          'Sticky toolbar should disappear',
          ApproxStructure.build((s, str, arr) => s.element('div', {
            classes: [
              arr.has(ui.editor.stickyHeaderInvisible.className),
              // BUG: In classic mode, the transition class isn't going away because
              // there is another transition style clobbering it.
              // arr.not(ui.editor.stickyHeaderTransitioning.className)
            ]
          })),
          header
        );
      }
    );

    context('Single scroller', () => {
      const setupElement = () => {
        const scroller = SugarElement.fromTag('div');
        Css.setAll(scroller, {
          overflow: 'auto',
          height: `${heights.scroller}px`,
          margin: '0em 2em 2000px 2em',
          outline: '3px solid brown'
        });
        Class.add(scroller, ui.other.scrollingWrapper.className);

        const banner = SugarElement.fromHtml(`<div style="height: ${heights.banner}px; background-color: orange;" />`);

        const target = SugarElement.fromTag('textarea');
        InsertAll.append(
          scroller,
          [
            banner,
            target,
            SugarElement.fromHtml(
              `<div style="height: 2000px; background-color: lime;" />`
            )
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
          height: heights.editor
        },
        () => setupElement(),
        []
      );

      beforeEach(() => resetScrolls(hook.editor()));

      context('No disconnect between menubar and menu after scrolling', () => {
        // This is the allowed gap between the bottom of the menubar and the top of the menu
        const allowedGap = 10;

        const pAssertMenuBelowMenubar = async (editor: Editor) => {
          const menu = await TinyUiActions.pWaitForPopup(editor, ui.editor.menu.selector);

          const menubar = await TinyUiActions.pWaitForUi(editor, ui.editor.menubar.selector);
          const menubarBottom = menubar.dom.getBoundingClientRect().bottom;
          const menuTop = menu.dom.getBoundingClientRect().top;
          assertApprox(
            'Menu and menubar should stay in sync',
            menubarBottom,
            menuTop,
            allowedGap
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
              // Don't scroll so far that it docks.
              scroller.dom.scrollTop = heights.banner - 50;
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
        it('When scrolling the outer page', async () => {
          const editor = hook.editor();
          const header = getEditorUi(editor, ui.editor.stickyHeader);
          const headerTop = header.dom.getBoundingClientRect().top;
          window.scrollTo(0, headerTop - 10);

          // An amount of chosen that will trigger docking.
          const scrollPastHeaderAmount = 30;

          // It should not be docked yet.
          assert.isTrue(Css.getRaw(header, 'position').isNone(), 'We have not yet docked the sticky toolbar');

          // Scroll a bit further, and it should dock to top: 0px.
          window.scrollTo(0, headerTop + scrollPastHeaderAmount);
          await pWaitUntilDockedAtTop(header, Optional.some(0));

          // Scroll back a bit and watch it undock.
          window.scrollTo(0, headerTop - scrollPastHeaderAmount);
          await pWaitUntilUndocked(header);
          assertApprox(
            `Toolbar should be about ${scrollPastHeaderAmount} pixels from the top`,
            header.dom.getBoundingClientRect().top,
            scrollPastHeaderAmount,
            // Arbitrary margin of error. Reduce as permitted.
            4
          );
        });

        it('When scrolling the scroller', async () => {
          // Remember, that the editor is about 200px down the scroller.
          const editor = hook.editor();
          const header = getEditorUi(editor, ui.editor.stickyHeader);
          const scroller = getOtherUi(editor, ui.other.scrollingWrapper);

          scroller.dom.scrollTo(0, heights.banner - 10);
          // It should not be docked yet.
          await pWaitUntilUndocked(header);

          // Now scroll further, and it should dock
          const scrollerTop = scroller.dom.getBoundingClientRect().top;
          // 22 was chosen, because it is far enough down the header that it's obvious that it's been
          // cut-off if docking isn't working (visually).
          scroller.dom.scrollTo(0, heights.banner + 22);
          await pWaitUntilDockedAtTop(header, Optional.none());

          assertApprox(
            'Top position should be pretty much at scroller top position',
            header.dom.getBoundingClientRect().top,
            scrollerTop,
            // Arbitrary margin of error. Reduce as permitted
            4
          );

          // Now scroll back a bit.
          scroller.dom.scrollTo(0, heights.banner - 5);
          await pWaitUntilUndocked(header);
        });

        it('When combining scrolling the outer page and the scroller', async () => {
          const editor = hook.editor();
          const header = getEditorUi(editor, ui.editor.stickyHeader);
          const scroller = getOtherUi(editor, ui.other.scrollingWrapper);

          // We will scroll the scroller just before it would dock, and then scroll the window
          // afterwards
          scroller.dom.scrollTo(0, heights.banner - 10);
          await pWaitUntilUndocked(header);

          // Now, scroll the window down to 30 pixels after the scroller top
          window.scrollTo(0, scroller.dom.getBoundingClientRect().top + 30);
          await pWaitUntilDockedAtTop(header, Optional.some(0));

          scroller.dom.scrollTo(0, heights.banner - 50);
          await pWaitUntilUndocked(header);
        });
      });

      context.only('Testing contextual disappearance', () => {
        const pRunTestWithAdjustment = async (
          editor: Editor,
          adjustments: {
            toDock: {
              action: () => void;
              topValue: Optional<number>;
            };
            toOffscreen: () => void;
            toOnScreen: () => void;
          }): Promise<void> => {
          const header = getEditorUi(editor, ui.editor.stickyHeader);

          // Trigger docking
          adjustments.toDock.action();
          await Waiter.pWait(1000);
          await pWaitUntilDockedAtTop(header, adjustments.toDock.topValue);
          await pWaitUntilAppears(header);

          // Scroll much further down and check that it disappears
          adjustments.toOffscreen();
          await Waiter.pWait(1000);
          await pWaitUntilDisappears(header);

          // Scroll up again and check it reappears
          adjustments.toOnScreen();
          await Waiter.pWait(1000);
          await pWaitUntilAppears(header);
        };

        it('When scrolling the outer page', async () => {
          const editor = hook.editor();
          const header = getEditorUi(editor, ui.editor.stickyHeader);
          const scroller = getOtherUi(editor, ui.other.scrollingWrapper);
          const headerTop = header.dom.getBoundingClientRect().top;
          const scrollerBottom = scroller.dom.getBoundingClientRect().bottom;

          await pRunTestWithAdjustment(editor, {
            toDock: {
              action: () => window.scrollTo(0, headerTop + 30),
              topValue: Optional.some(0)
            },
            toOffscreen: () => window.scrollTo(0, scrollerBottom + 100),
            toOnScreen: () => window.scrollTo(0, scrollerBottom - 100)
          });
        });

        it('When scrolling the scroller', async () => {
          const editor = hook.editor();
          const scroller = getOtherUi(editor, ui.other.scrollingWrapper);
          const scrollerTop = scroller.dom.getBoundingClientRect().top;

          await pRunTestWithAdjustment(editor, {
            toDock: {
              action: () => scroller.dom.scrollTo(0, heights.banner + 100),
              topValue: Optional.some(scrollerTop)
            },
            toOffscreen: () => scroller.dom.scrollTo(0, heights.banner + heights.editor + 100),
            toOnScreen: () => scroller.dom.scrollTo(0, heights.banner + heights.editor - 100)
          });
        });
      });
    });

    context('Nested scrollers', () => {
      const setupElement = () => {
        const scroller = SugarElement.fromTag('div');
        Css.setAll(scroller, {
          overflow: 'auto',
          height: `${heights.scroller}px`,
          margin: '0em 2em 2000px 2em',
          outline: '3px solid brown'
        });
        Class.add(scroller, ui.other.scrollingWrapper.className);

        const banner = SugarElement.fromHtml(`<div style="height: ${heights.banner}px; background-color: orange;" />`);

        const target = SugarElement.fromTag('textarea');
        InsertAll.append(
          scroller,
          [
            banner,
            target
          ]
        );

        const outerScroller = SugarElement.fromTag('div');
        Css.setAll(outerScroller, {
          'overflow': 'auto',
          'height': `${heights.outerScroller}px`,
          'padding': '0em 2em 0em 2em',
          'margin-bottom': '2000px',
          'background-color': 'darkgreen'
        });
        Class.add(outerScroller, ui.other.outerScroller.className);

        InsertAll.append(outerScroller, [
          SugarElement.fromHtml(`<div style="height: ${heights.banner}px; background-color: pink;" />`),
          scroller
        ]);
        Insert.append(SugarBody.body(), outerScroller);

        return {
          element: target,
          teardown: () => {
            Remove.remove(outerScroller);
          }
        };
      };

      const hook = TinyHooks.bddSetupFromElement<Editor>(
        {
          ...sharedSettings,
          ui_of_tomorrow: true,
          toolbar_sticky: true,
          height: heights.editor
        },
        () => setupElement(),
        []
      );

      beforeEach(() => resetScrolls(hook.editor()));

      it('When scrolling the outer scroller (contains another scroller)', async () => {
        // Remember, that the editor is about 200px down the scroller.
        const editor = hook.editor();
        const header = getEditorUi(editor, ui.editor.stickyHeader);
        const outerScroller = getOtherUi(editor, ui.other.outerScroller);

        // There are banners in both scrollers, so we use * 2 to scroll towards the menubar
        outerScroller.dom.scrollTo(0, heights.banner * 2 - 10);
        // It should not be docked yet.
        await pWaitUntilUndocked(header);

        // Now scroll further, and it should dock
        const scrollerTop = outerScroller.dom.getBoundingClientRect().top;
        // 22 was chosen, because it is far enough down the header that it's obvious that it's been
        // cut-off if docking isn't working (visually).
        outerScroller.dom.scrollTo(0, heights.banner * 2 + 22);
        await pWaitUntilDockedAtTop(header, Optional.none());

        assertApprox(
          'Top position should be pretty much at scroller top position',
          header.dom.getBoundingClientRect().top,
          scrollerTop,
          // Arbitrary margin of error. Reduce as permitted
          4
        );

        // Now scroll back a bit until it undocks
        outerScroller.dom.scrollTo(0, heights.banner * 2 - 5);
        await pWaitUntilUndocked(header);
      });
    });
  });

});
