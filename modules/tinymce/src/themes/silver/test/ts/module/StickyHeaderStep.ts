import { UiFinder, Waiter } from '@ephox/agar';
import { after, before, context, it } from '@ephox/bedrock-client';
import { Strings } from '@ephox/katamari';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import { ToolbarLocation, ToolbarMode } from 'tinymce/themes/silver/api/Options';

import * as MenuUtils from './MenuUtils';
import * as PageScroll from './PageScroll';
import * as StickyUtils from './StickyHeaderUtils';

const testStickyHeader = (toolbarMode: ToolbarMode, toolbarLocation: ToolbarLocation): void => {
  const isToolbarTop = toolbarLocation === ToolbarLocation.top;

  context('Test editor with toolbar_mode: ' + toolbarMode, () => {
    const hook = TinyHooks.bddSetup<Editor>({
      plugins: 'fullscreen',
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'align | fontsize | fontfamily | blocks | styles | insertfile | forecolor | backcolor ',
      resize: 'both',
      min_height: 300,
      min_width: 350,
      height: 400,
      width: 500,
      max_height: 500,
      max_width: 550,
      toolbar_mode: toolbarMode,
      toolbar_location: toolbarLocation,
      toolbar_sticky: true,
    }, [ FullscreenPlugin ], true);

    PageScroll.bddSetup(hook.editor, 5000);

    before(async () => {
      // Need to wait for a fraction for some reason on safari,
      // otherwise the initial scrolling doesn't work
      await Waiter.pWait(100);
    });

    it('Checking startup structure', async () => {
      await StickyUtils.pAssertEditorContainer(isToolbarTop, StickyUtils.expectedInFullView);
      StickyUtils.assertEditorClasses(false);
    });

    it('Checking scroll event listeners are bound, scroll by 1px then assert', async () => {
      await StickyUtils.pScrollAndAssertStructure(isToolbarTop, 1, StickyUtils.expectedScrollEventBound);
    });

    it('Scroll to half the editor should have sticky css markings', async () => {
      const editor = hook.editor();
      const contentAreaContainerHeight = editor.getContentAreaContainer().clientHeight;
      await StickyUtils.pScrollAndAssertStructure(isToolbarTop, 200, StickyUtils.expectedHalfView);
      await StickyUtils.pAssertHeaderDocked(isToolbarTop);
      StickyUtils.assertEditorClasses(true);
      assert.equal(
        editor.getContentAreaContainer().clientHeight,
        contentAreaContainerHeight,
        'ContentAreaContainer height should be the same before as after docking'
      );
    });

    it('Scroll down so the editor is hidden from view, it should have hidden css markings', async () => {
      await StickyUtils.pScrollAndAssertStructure(isToolbarTop, 500, StickyUtils.expectedEditorHidden);
      await StickyUtils.pAssertHeaderDocked(isToolbarTop);
    });

    it('Scroll editor into view should not have sticky', async () => {
      // Move the editor out of view first
      StickyUtils.scrollRelativeEditor(500, isToolbarTop);
      await StickyUtils.pScrollAndAssertStructure(isToolbarTop, -100, StickyUtils.expectedInFullView);
      StickyUtils.assertEditorClasses(false);
    });

    context('with open toolbar drawer', () => {
      before(async function () {
        this.timeout(10000);
        // Ensure the editor is in view
        StickyUtils.scrollRelativeEditor(-100, isToolbarTop);
        // Open the more drawer
        if (toolbarMode !== ToolbarMode.default) {
          await MenuUtils.pOpenMore(toolbarMode);
          MenuUtils.assertMoreDrawerInViewport(toolbarMode);
        }
      });

      after(async () => {
        if (toolbarMode !== ToolbarMode.default) {
          await MenuUtils.pCloseMore(toolbarMode);
        }
      });

      it('Open align menu and check sticky states', async () => {
        await StickyUtils.pOpenMenuAndTestScrolling(() => MenuUtils.pOpenAlignMenu('open align'), 1, isToolbarTop);
      });

      it('Open nested Formats menu Align and check sticky states', async () => {
        await StickyUtils.pOpenMenuAndTestScrolling(() => MenuUtils.pOpenNestedMenus([
          {
            // first open this menu
            label: 'Open nested formats dropdown',
            selector: 'button[aria-label^=Format]'
          },
          {
            // opening the first menu should reveal the next menu which contains Align, open Align
            label: 'Open Align menu item',
            selector: 'div[aria-label=Align][role=menuitem]' // note we are using title instead of aria-label for some items here.
          }
        ]), 2, isToolbarTop);
      });

      it('Open menubar Formats menu => Formats => Inline => check sticky states', async () => {
        await StickyUtils.pOpenMenuAndTestScrolling(() => MenuUtils.pOpenNestedMenus([
          {
            label: 'Open menu bar Format menu',
            selector: 'button:contains(Format)[role=menuitem]'
          },
          {
            label: 'then Formats submenu',
            selector: 'div[aria-label=Formats][role=menuitem]'
          },
          {
            label: 'then Inline submenu',
            selector: 'div[aria-label=Inline][role=menuitem]'
          }
        ]), 3, isToolbarTop);
      });

      it('Open text color palette => check sticky states', async () => {
        await StickyUtils.pOpenMenuAndTestScrolling(() => MenuUtils.pOpenNestedMenus([
          {
            label: 'Open splitmenu item, color palette',
            selector: 'div[data-mce-name="forecolor"][aria-expanded=false]'
          }
        ]), 1, isToolbarTop);
      });
    });

    it('Toggle fullscreen mode and ensure header moves from docked -> undocked -> docked', async () => {
      const editor = hook.editor();
      await StickyUtils.pScrollAndAssertStructure(isToolbarTop, 200, StickyUtils.expectedHalfView);
      editor.execCommand('mceFullscreen');
      await UiFinder.pWaitForVisible('Wait for fullscreen to be activated', SugarBody.body(), '.tox-fullscreen');
      await StickyUtils.pAssertEditorContainer(isToolbarTop, StickyUtils.expectedInFullView);
      editor.execCommand('mceFullscreen');
      await Waiter.pTryUntil('Wait for fullscreen to be deactivated', () => UiFinder.notExists(SugarBody.body(), '.tox-fullscreen'));
      // TODO: Figure out why Chrome 78 needs this wait on MacOS. I suspect it might be because fullscreen sets overflow hidden
      // and we're setting the scroll position before the window has updated
      await Waiter.pWait(100);
      await StickyUtils.pScrollAndAssertStructure(isToolbarTop, 200, StickyUtils.expectedHalfView);
    });

    it('TINY-7337: Checking toolbar_sticky_offset updated sticky header position', async () => {
      const editor = hook.editor();
      editor.options.set('toolbar_sticky_offset', 54);

      await StickyUtils.pAssertHeaderPosition(toolbarLocation, 54);
      editor.options.unset('toolbar_sticky_offset');
    });
  });

  context('Test inline editor editor with toolbar_mode: ' + toolbarMode, () => {
    const element: SugarElement<HTMLElement> = SugarElement.fromHtml(`<p id="content">${Strings.repeat('some content ', 1000)}</p>`);
    const setupElement = () => {

      Insert.append(SugarBody.body(), element);

      return {
        element,
        teardown: () => {
          Remove.remove(element);
        }
      };
    };
    const hook = TinyHooks.bddSetupFromElement<Editor>({
      plugins: 'fullscreen',
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'align | fontsize | fontfamily | blocks | styles | insertfile | forecolor | backcolor ',
      menubar: false,
      inline: true
    }, setupElement);

    PageScroll.bddSetup(hook.editor, 5000);

    it('TINY-10581: Scroll to the end of the content, open and close the editor, and then scroll to the top of the content the editor should not shrink', async () => {
      const editor = hook.editor();
      const getRect = (element: SugarElement<any>): DOMRect =>
        (element as SugarElement<HTMLElement>).dom.getBoundingClientRect();
      let isScrolled = false;

      element.dom.focus();
      element.dom.scrollIntoView(false);

      editor.focus();
      await UiFinder.pWaitForVisible('Wait for the editor to show', SugarBody.body(), '.tox-editor-header');
      const toolbar = await UiFinder.pWaitFor('toolbar should be visible', SugarBody.body(), '.tox-editor-header');

      const initialWidth = getRect(toolbar).width;

      element.dom.blur();
      await UiFinder.pWaitForHidden('Wait for the editor to show', SugarBody.body(), '.tox-editor-header');

      editor.focus();
      await UiFinder.pWaitForVisible('Wait for the editor to show', SugarBody.body(), '.tox-editor-header');

      const scrollHandler = () => {
        isScrolled = true;
      };

      window.addEventListener('scroll', scrollHandler);
      window.scrollTo(0, 5000);
      await Waiter.pTryUntilPredicate('it should be scrolled', () => isScrolled);
      window.removeEventListener('scroll', scrollHandler);

      const currentWidth = getRect(toolbar).width;

      assert.equal(initialWidth, currentWidth, 'initial toolbar width should be equal to the current toolbar width');
    });
  });
};

export {
  testStickyHeader
};
