import { UiFinder, Waiter } from '@ephox/agar';
import { after, before, context, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
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
      before(async () => {
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
            selector: 'div[title=Align][role=menuitem]' // note we are using title instead of aria-label for some items here.
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
            selector: 'div[title=Formats][role=menuitem]'
          },
          {
            label: 'then Inline submenu',
            selector: 'div[title=Inline][role=menuitem]'
          }
        ]), 3, isToolbarTop);
      });

      it('Open text color palette => check sticky states', async () => {
        await StickyUtils.pOpenMenuAndTestScrolling(() => MenuUtils.pOpenNestedMenus([
          {
            label: 'Open splitmenu item, color palette',
            selector: 'div[title^="Text color"][aria-expanded=false]'
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
};

export {
  testStickyHeader
};
